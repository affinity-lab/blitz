import {ITagRepository} from "./tag-repository-interface";
import {GroupTagManager} from "../group-tag-manager";
import {MySqlTableWithColumns} from "drizzle-orm/mysql-core";
import {and, eq, sql} from "drizzle-orm";
import {MySql2PreparedQuery} from "drizzle-orm/mysql2";

export abstract class AbstractGroupTagRepository<S extends Record<string, any> = any, T extends MySqlTableWithColumns<any> = any, TM extends GroupTagManager = GroupTagManager> extends ITagRepository<S, T, TM> {
	protected col: string = "groupId";
	protected q: { getAll: MySql2PreparedQuery<any>, getByName: MySql2PreparedQuery<any>, getOneByName: MySql2PreparedQuery<any>, getByNameNonPredefined: MySql2PreparedQuery<any> };

	initialize(tm: new (r: AbstractGroupTagRepository) => TM, repo: AbstractGroupTagRepository, col?: string) {
		this.tagManager = new tm(repo);
		if(!this.q) this.q = {} as any;
		if(col) this.col = col
		if(!this.q.getAll) this.q.getAll = this.db.select().from(this.schema).where(sql`${this.schema[this.col]} = ${sql.placeholder("groupId")}`).orderBy(sql`name`).prepare();
		if(!this.q.getByName) this.q.getByName = this.db.select().from(this.schema).where(and(sql`${this.schema[this.col]} = ${sql.placeholder("groupId")}`, sql`name IN (${sql.placeholder("names")})`)).prepare();
		if(!this.q.getOneByName) this.q.getOneByName = this.db.select().from(this.schema).where(and(sql`${this.schema[this.col]} = ${sql.placeholder("groupId")}`, sql`name = ${sql.placeholder("name")}`)).prepare();
		if(!this.q.getByNameNonPredefined) this.q.getByNameNonPredefined = this.db.select().from(this.schema).where(and(sql`${this.schema[this.col]} = ${sql.placeholder("groupId")}`, sql`name IN (${sql.placeholder("names")})`, eq(sql`predefined`, false))).prepare();
	}

	async createTag(tag: string, groupId: number) {
		await this.tagManager.add([tag], true, groupId);
	}

	async renameTag(oldName: string, newName: string, groupId: number) {
		await this.tagManager.rename(oldName, newName, groupId);
	}

	async changePredefinedTag(name: string, to: boolean, groupId: number) {
		await this.tagManager.changePredefined(name, to, groupId);
	}

	async deleteTag(tag: string, groupId: number) {
		await this.tagManager.deletePredefined(tag, groupId);
	}

	getAll(groupId: number) {
		return this.q.getAll.execute({groupId, col: this.col}).then(r => r.map((i: any) => i.name)).then(r => r.join(','));
	}

	getTags(groupId: number) {
		return this.q.getAll.execute({groupId, col: this.col});
	}

	getByName(names: Array<string>, groupId: number) {
		return this.q.getByName.execute({names: names.join(", "), groupId, col: this.col});
	}

	getOneByName(name: string, groupId: number) {
		return this.q.getOneByName.execute({name, groupId, col: this.col}).then(r => r.length ? r[0] : undefined);
	}

	getByNameNonPredefined(names: Array<string>, groupId: number) {
		return this.q.getByNameNonPredefined.execute({names: names.join(", "), groupId, col: this.col});
	}
}