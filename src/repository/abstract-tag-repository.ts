import {MySqlTable, MySqlUpdateSetSource} from "drizzle-orm/mysql-core";
import {and, eq, InferSelectModel, sql} from "drizzle-orm";
import {ITagManager} from "../tag-manager-interface";
import {ITagRepository} from "./tag-repository-interface";

export abstract class AbstractTagRepository<S extends Record<string, any> = any, T extends MySqlTable = any, TM extends ITagManager = any> extends ITagRepository<S, T, TM> {
	private queries = {
		getAll: this.db.select().from(this.schema).orderBy(sql`name`).prepare(),
		getByName: this.db.select().from(this.schema).where(sql`name IN (${sql.placeholder("names")})`).prepare(),
		getOneByName: this.db.select().from(this.schema).where(sql`name = ${sql.placeholder("name")}`).prepare(),
		getByNameNonPredefined: this.db.select().from(this.schema).where(and(sql`name IN (${sql.placeholder("names")})`, eq(sql`predefined`, false))).prepare()
	}

	public initialize(c: new (...args: any) => TM) {
		this.tagManager = new c(this);
	}

	async createTag(tag: string) {
		await this.tagManager.add([tag], true);
	}

	async renameTag(oldName: string, newName: string) {
		await this.tagManager.rename(oldName, newName);
	}

	async changePredefinedTag(name: string, to: boolean) {
		await this.tagManager.changePredefined(name, to);
	}

	async deleteTag(tag: string) {
		await this.tagManager.deletePredefined(tag);
	}


	getAll() {
		return this.queries.getAll.execute().then(r => r.map(i => i.name)).then(r=> r.join(','));
	}

	getTags() {
		return this.queries.getAll.execute().then(r=> r.map(i=> {return {name: i.name, predefined: i.predefined}}));
	}

	getByName(names: Array<string>) {
		return this.queries.getByName.execute({names: names.join(", ")});
	}

	getOneByName(name: string) {
		return this.queries.getOneByName.execute({name}).then(r => r.length ? r[0] : undefined);
	}

	getByNameNonPredefined(names: Array<string>) {
		return this.queries.getByNameNonPredefined.execute({names: names.join(", ")});
	}

	protected async afterDelete(id: number, affectedRows: number, originalItem: InferSelectModel<T> | undefined): Promise<void> {
		await this.tagManager.deleteInUsages(originalItem);
	}

	protected async afterUpdate<T extends MySqlTable = any>(id: number, values: MySqlUpdateSetSource<T>, affectedRows: number, originalItem: InferSelectModel<T> | undefined): Promise<void> {
		await this.tagManager.selfRename(values, originalItem);
	}
}