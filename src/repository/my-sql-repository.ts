import {MySqlTable, MySqlUpdateSetSource, PreparedQuery} from "drizzle-orm/mysql-core";
import {getTableName, InferInsertModel, InferSelectModel, sql} from "drizzle-orm";
import {MySql2Database, MySqlRawQueryResult} from "drizzle-orm/mysql2";
import {Cache, fatalError, type KeyValue, MaterializeIt} from "@affinity-lab/util";
import * as crypto from "crypto";
import {EventEmitter} from "events";
import {BLITZ_EVENTS} from "../events";
import {CollectionStorage} from "../storage/collection-storage";
import {Collection} from "../storage/collection";
import {AbstractTagRepository} from "./abstract-tag-repository";


export class MySqlRepository<S extends Record<string, any> = any, T extends MySqlTable = any> {

	static cache(ttl?: number): MethodDecorator {
		return (target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
			const func = descriptor.value;
			const id = crypto.randomUUID();
			descriptor.value = async function (...args: Array<any>) {
				const instance = this as unknown as MySqlRepository<any, any>;
				if (instance.cache === undefined) return await func.call(instance, ...args);
				const key = crypto.createHash("md5").update(id + JSON.stringify(args)).digest("hex");
				const item = await instance.cache?.get(key);
				if (item !== undefined) return item;
				const result = await func.call(instance, ...args);
				if (result !== undefined) await instance.cache?.set({key: key, value: result}, ttl);
				return result;
			};
		};
	}
	static store(): MethodDecorator {
		return (target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
			const func = descriptor.value;
			descriptor.value = async function (...args: Array<any>) {
				const instance = this as unknown as MySqlRepository<any, any>;
				const result = await func.call(instance, ...args);
				if (instance.store && result !== undefined) await instance.store?.set(instance.itemToKeyValue(result));
				return result;
			};
		};
	}

	protected publicFields: Record<string, any> = {};
	protected getBeforeUpdate: boolean = false;
	protected getBeforeDelete: boolean = false;
	protected get tagRepos(): Array<AbstractTagRepository> {return [];}

	protected excludedFields: Array<string> = [];
	public files: Array<Collection<Record<string, any>>>;

	constructor(
		readonly schema: T,
		readonly db: MySql2Database<S>,
		readonly eventEmitter: EventEmitter,
		readonly collectionStorage?: CollectionStorage,
		protected store?: Cache<InferSelectModel<T>>,
		protected cache?: Cache<InferSelectModel<T>>
	) {}

	public initialize(...args: any) {}

	public get name(): string {return getTableName(this.schema);}
	@MaterializeIt() get baseQueries(): Record<string, PreparedQuery<any>> {
		for (let key of Object.keys(this.schema)) if (!this.excludedFields.includes(key)) this.publicFields[key] = (this.schema as Record<string, any>)[key];

		return {
			get: this.db.select(this.publicFields).from(this.schema).where(sql`id = ${sql.placeholder("id")}`).limit(1).prepare(),
			all: this.db.select(this.publicFields).from(this.schema).where(sql`id IN (${sql.placeholder("ids")})`).prepare(),
			del: this.db.delete(this.schema).where(sql`id = (${sql.placeholder("id")})`).prepare()
		};
	}

	protected itemToKeyValue(items: Array<InferSelectModel<T>>): Array<KeyValue<InferSelectModel<T>>>;
	protected itemToKeyValue(item: InferSelectModel<T>): KeyValue<InferSelectModel<T>> ;
	protected itemToKeyValue(item: InferSelectModel<T> | Array<InferSelectModel<T>>): KeyValue<InferSelectModel<T>> | Array<KeyValue<InferSelectModel<T>>> {
		if (!Array.isArray(item)) return {key: item.id as number, value: item};
		return item.map((item) => Object({key: item.id, value: item}));
	}

	async get(ids: Array<number>): Promise<Array<InferSelectModel<T>>> ;
	async get(id: number): Promise<InferSelectModel<T> | undefined> ;
	async get(id: null): Promise<undefined> ;
	async get(id: undefined): Promise<undefined> ;
	async get(id: number | undefined | null | Array<number>): Promise<InferSelectModel<T> | Array<InferSelectModel<T>> | undefined> {
		if (id === undefined || id === null) return Promise.resolve(undefined);
		if (Array.isArray(id)) return this.all(id);
		return this.store ? this.getFromStoreOrDatabase(id) : (await this.baseQueries.get.execute({id}))[0];
	}

	private async getFromStoreOrDatabase(id: number) {
		// try from store, when exists return
		let item = await this.store!.get(id);
		if (item) return Promise.resolve(item);
		// fetch, store and return
		let res = await this.baseQueries.get.execute({id});
		item = res && res.length ? (res)[0] : undefined;
		if (item) await this.store!.set(this.itemToKeyValue(item));
		return item;
	}

	protected async all(ids: Array<number>): Promise<Array<InferSelectModel<T>>> {
		return this.store ? this.allFromStoreOrDatabase(ids) : this.baseQueries.all.execute({ids});
	}

	private async allFromStoreOrDatabase(ids: Array<number>): Promise<Array<InferSelectModel<T>>> {
		const items = await this.store!.get(ids);
		if (items.length === ids.length) return Promise.resolve(items);		// when all loaded from store return
		let idsToFetch: Array<number>; // get the rest ids to fetch
		if (items.length === 0) {
			idsToFetch = ids;
		} else {
			let itemIds = items.map(item => item.id); // ids of the items we already got
			idsToFetch = ids.filter(id => !itemIds.includes(id));
		}
		const result: Array<InferSelectModel<T>> = [];
		const fetched: Array<InferSelectModel<T>> = await this.baseQueries.all.execute({ids: idsToFetch});
		await this.store!.set(this.itemToKeyValue(fetched));
		result.push(...items, ...fetched);
		return Promise.resolve(result);
	}

	async insert(values: InferInsertModel<T>): Promise<number | undefined> {
		this.eventEmitter.emit(BLITZ_EVENTS.BEFORE_INSERT, this, values);
		if (await this.beforeInsert(values) !== false) {
			let insertWith: InferInsertModel<T> = {} as InferInsertModel<T>;
			let keys = Object.keys(this.schema);
			for(let key of Object.keys(values)) if (keys.includes(key)) insertWith[key as keyof InferInsertModel<T>] = values[key as keyof InferInsertModel<T>];
			const res = await this.db.insert(this.schema).values(insertWith);
			const id = res[0].insertId;
			this.eventEmitter.emit(BLITZ_EVENTS.AFTER_INSERT, this, id, values);
			await this.afterInsert(id, values);
			return id;
		}
		return undefined
	}

	async update(values: MySqlUpdateSetSource<T>): Promise<number>;
	async update(id: number, values: MySqlUpdateSetSource<T>): Promise<number>;
	async update(id: MySqlUpdateSetSource<T> | number, values?: MySqlUpdateSetSource<T>): Promise<number> {
		if (typeof id != "number") {
			values = id;
			id = values.id as number;
			delete (values.id);
		}
		if (typeof id !== "number" || isNaN(id)) throw fatalError("id not provided for update");
		await this.store?.del(id as number);
		let item = this.getBeforeUpdate ? await this.get(id) : undefined;
		this.eventEmitter.emit(BLITZ_EVENTS.BEFORE_UPDATE, this, id, values, item);
		if(await this.beforeUpdate(id, values!, item) !== false) {
			let updateWith: Record<string, any> = {};
			let keys = Object.keys(this.schema);
			for(let key of Object.keys(values!)) if (keys.includes(key)) updateWith[key] = values![key];
			const res: MySqlRawQueryResult = await this.db.update(this.schema).set(updateWith).where(sql`id = ${id}`);
			const affectedRows = res[0].affectedRows;
			this.eventEmitter.emit(BLITZ_EVENTS.AFTER_UPDATE, this, id, values, affectedRows, item);
			await this.afterUpdate(id, values!, affectedRows, item);
			return affectedRows;
		}
		return 0;
	}

	async delete(id: number): Promise<void> {
		await this.store?.del(id);
		let item = this.getBeforeDelete ? await this.get(id) : undefined;
		this.eventEmitter.emit(BLITZ_EVENTS.BEFORE_DELETE, this, id, item);
		if(await this.beforeDelete(id, item) !== false) {
			const res: MySqlRawQueryResult = await this.baseQueries.del.execute({id});
			const affectedRows = res[0].affectedRows;
			this.eventEmitter.emit(BLITZ_EVENTS.AFTER_DELETE, this, id, affectedRows, item);
			await this.afterDelete(id, affectedRows, item);
		}
	}

	protected async beforeUpdate(id: number, values: MySqlUpdateSetSource<T>, item: InferSelectModel<T> | undefined): Promise<boolean | void>  {
		for (let repo of this.tagRepos) if(!!repo.tagManager) repo.tagManager.prepare(this, values);
	}
	protected async beforeDelete(id: number, item: InferSelectModel<T> | undefined): Promise<boolean | void> {}
	protected async beforeInsert(values: InferInsertModel<T>): Promise<boolean | void> {
		for (let repo of this.tagRepos) if(!!repo.tagManager) repo.tagManager.prepare(this, values);
	}
	protected async afterUpdate(id: number, values: MySqlUpdateSetSource<T>, affectedRows: number, originalItem: InferSelectModel<T> | undefined) {
		for (let repo of this.tagRepos) if(!!repo.tagManager) await repo.tagManager.update(this, originalItem, values);
	}
	protected async afterDelete(id: number, affectedRows: number, originalItem: InferSelectModel<T> | undefined) {
		for (let repo of this.tagRepos) if(!!repo.tagManager) await repo.tagManager.update(this, originalItem);
	}
	protected async afterInsert(id: number, values: InferInsertModel<T>) {}
}