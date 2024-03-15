import {MySqlUpdateSetSource} from "drizzle-orm/mysql-core";
import {InferInsertModel} from "drizzle-orm";
import {MaybeArray} from "@affinity-lab/util";
import {ITagManager} from "./tag-manager-interface";
import {MySqlRepository} from "./repository/my-sql-repository";
import {blitzError} from "./errors";

export class GroupTagManager extends ITagManager {

	addUsage(usage: MaybeArray<{ "repo": MySqlRepository, "field": string }>) {
		this.usages.push(...(Array.isArray(usage) ? usage : [usage]));
	}

	async update(repository: MySqlRepository, originalItem: InferInsertModel<any> | undefined, values: MySqlUpdateSetSource<any> = {}, eventId: number) {
		let {prev, curr} = this.prevCurrForUpdate(repository, originalItem);
		await this.add(curr.filter(x => !prev.includes(x)), false, eventId);
		await this.delete(prev.filter(x => !curr.includes(x)), eventId);
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