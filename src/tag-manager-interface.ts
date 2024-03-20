import {MaybePromise} from "@affinity-lab/util";
import {MySqlUpdateSetSource} from "drizzle-orm/mysql-core";
import {and, InferInsertModel, InferSelectModel, not, sql, Table} from "drizzle-orm";
import {MySqlRepository} from "./repository/my-sql-repository";
import {ITagRepository} from "./repository/tag-repository-interface";
import {blitzError} from "./errors";

export abstract class ITagManager {
	protected usages: Array<{ "repo": MySqlRepository, "field": string} & Record<string, any>> = []
	constructor(
		protected tableRepo: ITagRepository,
	) {}
	abstract addUsage(...args: any): MaybePromise<void>;
	protected prepare(repository: MySqlRepository, values: MySqlUpdateSetSource<any> | InferInsertModel<any>) {
		for (let usage of this.usages) {
			if (usage.repo === repository) {
				if(!values[usage.field]) values[usage.field] = "";
				values[usage.field] = [...new Set((values[usage.field] as string).trim().split(',').map(x => x.trim()).filter(x => !!x))].join(',');
			}
		}
	}
	protected prevCurrForUpdate(repository: MySqlRepository, originalItem: InferInsertModel<any> | undefined, values: MySqlUpdateSetSource<any> = {}) {
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
		return {prev, curr};
	}

	abstract update(...args: any): MaybePromise<void>;

	protected async deleteItems(items: Array<any>) {
		for (let item of items) {
			let doDelete = true;
			for (let usage of this.usages) {
				let res = await usage.repo.db.select().from(usage.repo.schema).where(sql`FIND_IN_SET(${item.name}, ${usage.repo.schema[usage.field]})`).limit(1).execute();
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
	abstract delete(...args: any): MaybePromise<void>;
	abstract deletePredefined(...args: any): MaybePromise<void>;
	abstract changePredefined(...args: any): MaybePromise<void>;
	abstract add(...args: any): MaybePromise<void>;
	protected doRename(oldName: string, newName: string) {
		for (let usage of this.usages) {
			let set: Record<string, any> = {};
			set[usage.field] = sql`trim(both ',' from replace(concat(',', ${usage.field} , ','), ',${oldName},', ',${newName},'))`;
			usage.repo.db.update(usage.repo.schema).set(set).where(and(sql`FIND_IN_SET("${oldName}", ${usage.field})`, not(sql`FIND_IN_SET("${newName}", ${usage.field})`)));
			set[usage.field] = sql`trim(both ',' from replace(concat(',', ${usage.field} , ','), ',${oldName},', ','))`;
			usage.repo.db.update(usage.repo.schema).set(set).where(and(sql`FIND_IN_SET("${oldName}", ${usage.field})`, sql`FIND_IN_SET("${newName}", ${usage.field})`));
		}
	}

	abstract rename(...args: any): MaybePromise<void>;
	abstract deleteInUsages(...args: any): Promise<void>;

	async selfRename<T extends Table<any> = any>(values: MySqlUpdateSetSource<any>, originalItem: InferSelectModel<T> | any) {
		if(values.name) {
			await this.doRename(originalItem.name, values.name)
		}
	}
}