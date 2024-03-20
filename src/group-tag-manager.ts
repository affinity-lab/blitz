import {MySqlUpdateSetSource} from "drizzle-orm/mysql-core";
import {and, InferInsertModel, InferSelectModel, not, sql} from "drizzle-orm";
import {MaybeArray} from "@affinity-lab/util";
import {ITagManager} from "./tag-manager-interface";
import {MySqlRepository} from "./repository/my-sql-repository";
import {blitzError} from "./errors";

export class GroupTagManager extends ITagManager {

	addUsage(usage: MaybeArray<{ "repo": MySqlRepository, "field": string, mode: "JSON" | undefined }>) {
		this.usages.push(...(Array.isArray(usage) ? usage : [usage]));
	}

	async deleteInUsages(originalItem: InferSelectModel<any> | any) {
		let n = `$.${originalItem.name}`
		let name = `${originalItem.name}`
		for (let usage of this.usages as { repo: MySqlRepository; field: string, mode?: "JSON"}[]) {
			let set: Record<string, any> = {}
			if(usage.mode && usage.mode === "JSON") {
				set[usage.field] = sql`json_remove(${usage.repo.schema[usage.field]}, ${n})`
				await usage.repo.db.update(usage.repo.schema).set(set).where(sql`json_extract(${usage.repo.schema[usage.field]}, ${n}) > 0`);
			} else {
				set[usage.field] = sql`trim(both ',' from replace(concat(',', ${usage.repo.schema[usage.field]} , ','), ',${name},', ','))`;
				usage.repo.db.update(usage.repo.schema).set(set).where(sql`FIND_IN_SET("${name}", ${usage.repo.schema[usage.field]})`);
			}
		}
	}

	async update(repository: MySqlRepository, originalItem: InferInsertModel<any> | undefined, values: MySqlUpdateSetSource<any> = {}, eventId: number) {
		let {prev, curr} = this.prevCurrForUpdate(repository, originalItem);
		await this.add(curr.filter(x => !prev.includes(x)), false, eventId);
		await this.delete(prev.filter(x => !curr.includes(x)), eventId);
	}

	protected prevCurrForUpdate(repository: MySqlRepository, originalItem: InferInsertModel<any> | undefined, values?: MySqlUpdateSetSource<any>): { prev: string[]; curr: string[] } {
		return {prev: [], curr: []};
	}

	protected prepare(repository: MySqlRepository, values: MySqlUpdateSetSource<any> | InferInsertModel<any>) {
		return
	}

	protected async doRename(oldName: string, newName: string) {
		let nN = `$.${newName}`;
		let oN = `$.${oldName}`;
		let eN = `"${newName}"`;
		let eO = `"${oldName}"`;
		for (let usage of this.usages as { repo: MySqlRepository; field: string, mode?: "JSON"}[]) {
			let set: Record<string, any> = {};
			if(usage.mode && usage.mode === "JSON") {
				let w = and(sql`json_extract(${usage.repo.schema[usage.field]}, ${oN}) > 0`, sql`json_extract(${usage.repo.schema[usage.field]}, ${nN}) is NULL`)
				set[usage.field] = sql`replace(${usage.repo.schema[usage.field]}, ${eO}, ${eN})`;
				await usage.repo.db.update(usage.repo.schema).set(set).where(w);
				w = and(sql`json_extract(${usage.repo.schema[usage.field]}, ${oN}) > 0`, sql`json_extract(${usage.repo.schema[usage.field]}, ${nN}) > 0`)
				// set[usage.field] = sql`json_remove(json_replace(${usage.repo.schema[usage.field]}, ${nN}, json_value(${usage.repo.schema[usage.field]}, ${nN}) + json_value(${usage.repo.schema[usage.field]}, ${oN})), ${oN})`;
				set[usage.field] = sql`json_remove(${usage.repo.schema[usage.field]}, ${oN})`; // replace this line with the one above, to add the values together
				await usage.repo.db.update(usage.repo.schema).set(set).where(w);
			} else {
				set[usage.field] = sql`trim(both ',' from replace(concat(',', ${usage.field} , ','), ',${oldName},', ',${newName},'))`;
				usage.repo.db.update(usage.repo.schema).set(set).where(and(sql`FIND_IN_SET("${oldName}", ${usage.repo.schema[usage.field]})`, not(sql`FIND_IN_SET("${newName}", ${usage.repo.schema[usage.field]})`)));
				set[usage.field] = sql`trim(both ',' from replace(concat(',', ${usage.field} , ','), ',${oldName},', ','))`;
				usage.repo.db.update(usage.repo.schema).set(set).where(and(sql`FIND_IN_SET("${oldName}", ${usage.repo.schema[usage.field]})`, sql`FIND_IN_SET("${newName}", ${usage.repo.schema[usage.field]})`));
			}
		}
	}

	async delete(tags: Array<string>, eventId: number) {
		if(tags.length === 0) return;
		let items = await this.tableRepo.getByNameNonPredefined(tags, eventId);
		await this.deleteItems(items);
	}

	async deletePredefined(name: string, eventId: number) {
		let item = await this.tableRepo.getOneByName(name, eventId);
		if(!item) blitzError.tagManager.itemNotFound(name);
		return this.tableRepo.delete(item!.id);
	}

	async changePredefined(name: string, to: boolean, eventId: number) {
		let item = await this.tableRepo.getOneByName(name, eventId);
		if(!item) throw blitzError.tagManager.itemNotFound(name);
		await this.tableRepo.update(item.id, {predefined: to});
		if(!to) await this.delete([name], eventId);
	}

	async add(tags: Array<string>, predefined: boolean = false, eventId: number) {
		if(tags.length === 0) return;
		let items = (await this.tableRepo.getByName(tags)).map((x: any) => x.name);
		let toAdd = tags.filter(x => !items.includes(x));
		for (let tag of toAdd) {
			await this.tableRepo.insert({name: tag, predefined, eventId});
		}

	}

	async rename(oldName: string, newName: string, eventId: number) {
		oldName = oldName.replace(',', "").trim();
		newName = newName.replace(',', "").trim();
		if (oldName === newName) return
		let o = await this.tableRepo.getOneByName(oldName, eventId);
		if (!o) return
		let n = await this.tableRepo.getOneByName(newName, eventId);
		if (!n) await this.tableRepo.update(o.id, {name: newName});
		else await this.tableRepo.delete(o.id);
		this.doRename(oldName, newName);

	}
}