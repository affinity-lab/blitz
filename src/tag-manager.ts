import {AbstractTagRepository} from "./repository/abstract-tag-repository";
import {MySqlRepository} from "./repository/my-sql-repository";
import {MySqlUpdateSetSource} from "drizzle-orm/mysql-core";
import {and, InferInsertModel, not, sql} from "drizzle-orm";
import {blitzError} from "./errors";

type MaybeArray<T> = T | Array<T>;

export class TagManager {
	private usages: Array<{ "repo": MySqlRepository, "field": string }> = []
	constructor(
		private tableRepo: AbstractTagRepository,
	) {}


	addUsage(usage: MaybeArray<{ "repo": MySqlRepository, "field": string }>) {
		this.usages.push(...(Array.isArray(usage) ? usage : [usage]));
	}

	prepare(repository: MySqlRepository, values: MySqlUpdateSetSource<any> | InferInsertModel<any>) {
		for (let usage of this.usages) {
			if (usage.repo === repository) {
				values[usage.field] = [...new Set((values[usage.field] as string).trim().split(',').map(x => x.trim()).filter(x => !!x))].join(',');
			}
		}
	}

	async update(repository: MySqlRepository, originalItem: InferInsertModel<any> | undefined, values: MySqlUpdateSetSource<any> = {}) {
		if (!originalItem) throw blitzError.tagManager.itemNotFound(repository.name);
		let prev: Array<string> = [];
		let curr: Array<string> = []
		for (let usage of this.usages) {
			if (usage.repo === repository) {
				prev.push(...(originalItem[usage.field] ? originalItem[usage.field].split(',') : []));
				curr.push(...(values[usage.field] ? (values[usage.field] as string).split(',') : []));
			}
		}
		prev = [...new Set(prev)];
		curr = [...new Set(curr)];
		await this.add(curr.filter(x => !prev.includes(x)));
		await this.delete(prev.filter(x => !curr.includes(x)));
	}


	async delete(tags: Array<string>) {
		if(tags.length === 0) return;
		let items = await this.tableRepo.getByNameNonPredefined(tags);
		for (let item of items) {
			let doDelete = true;
			for (let usage of this.usages) {
				let res = await usage.repo.db.select().from(usage.repo.schema).where(sql`FIND_IN_SET("${item.name}", ${usage.field})`).limit(1).execute();
				if (res.length !== 0) {
					doDelete = false;
					break;
				}
			}
			if (doDelete) {
				await this.tableRepo.delete(item.id);
			}
		}
	}

	async deletePredefined(name: string) {
		let item = await this.tableRepo.getOneByName(name);
		if(!item) blitzError.tagManager.itemNotFound(name);
		return this.tableRepo.delete(item!.id);
	}

	async changePredefined(name: string, to: boolean) {
		let item = await this.tableRepo.getOneByName(name);
		if(!item) throw blitzError.tagManager.itemNotFound(name);
		await this.tableRepo.update(item.id, {predefined: to});
		if(!to) await this.delete([name]);
	}

	async add(tags: Array<string>, predefined: boolean = false) {
		if(tags.length === 0) return;
		let items = (await this.tableRepo.getByName(tags)).map(x => x.name);
		let toAdd = tags.filter(x => !items.includes(x));
		for (let tag of toAdd) {
			await this.tableRepo.insert({name: tag, predefined});
		}

	}

	async rename(oldName: string, newName: string) {
		oldName = oldName.replace(',', "").trim();
		newName = newName.replace(',', "").trim();
		if (oldName === newName) return
		let o = await this.tableRepo.getOneByName(oldName);
		if (!o) return
		let n = await this.tableRepo.getOneByName(newName);
		if (!n) await this.tableRepo.update(o.id, {name: newName});
		else await this.tableRepo.delete(o.id);
		for (let usage of this.usages) {
			let set: Record<string, any> = {};
			set[usage.field] = sql`trim(both ',' from replace(concat(',', ${usage.field} , ','), ',${oldName},', ',${newName},'))`;
			usage.repo.db.update(usage.repo.schema).set(set).where(and(sql`FIND_IN_SET("${oldName}", ${usage.field})`, not(sql`FIND_IN_SET("${newName}", ${usage.field})`)));
			set[usage.field] = sql`trim(both ',' from replace(concat(',', ${usage.field} , ','), ',${oldName},', ','))`;
			usage.repo.db.update(usage.repo.schema).set(set).where(and(sql`FIND_IN_SET("${oldName}", ${usage.field})`, sql`FIND_IN_SET("${newName}", ${usage.field})`));
		}

	}
}