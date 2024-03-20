import {MySqlRepository} from "./repository/my-sql-repository";
import {MySqlUpdateSetSource} from "drizzle-orm/mysql-core";
import {InferInsertModel, InferSelectModel, sql} from "drizzle-orm";
import {blitzError} from "./errors";
import {MaybeArray} from "@affinity-lab/util";
import {ITagManager} from "./tag-manager-interface";

export class TagManager extends ITagManager {
	protected usages: Array<{ "repo": MySqlRepository, "field": string }> = []

	addUsage(usage: MaybeArray<{ "repo": MySqlRepository, "field": string }>) {
		this.usages.push(...(Array.isArray(usage) ? usage : [usage]));
	}

	async update(repository: MySqlRepository, originalItem: InferInsertModel<any> | undefined, values: MySqlUpdateSetSource<any> = {}) {
		let {prev, curr} = this.prevCurrForUpdate(repository, originalItem);
		await this.add(curr.filter(x => !prev.includes(x)));
		await this.delete(prev.filter(x => !curr.includes(x)));
	}

	async delete(tags: Array<string>) {
		if(tags.length === 0) return;
		let items = await this.tableRepo.getByNameNonPredefined(tags);
		await this.deleteItems(items);
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
		await this.doRename(oldName, newName);
	}

	async deleteInUsages(originalItem: InferSelectModel<any> | any) {
		let name = `${originalItem.name}`
		for (let usage of this.usages) {
			let set: Record<string, any> = {}
			set[usage.field] = sql`trim(both ',' from replace(concat(',', ${usage.repo.schema[usage.field]} , ','), ',${name},', ','))`;
			usage.repo.db.update(usage.repo.schema).set(set).where(sql`FIND_IN_SET("${name}", ${usage.repo.schema[usage.field]})`);
		}
	}
}