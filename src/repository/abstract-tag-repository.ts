import {MySqlRepository} from "./my-sql-repository";
import {MySqlTable} from "drizzle-orm/mysql-core";
import {TagManager} from "../tag-manager";
import {and, eq, sql} from "drizzle-orm";


export abstract class AbstractTagRepository<S extends Record<string, any> = any, T extends MySqlTable = any> extends MySqlRepository<S, T> {
	public tagManager: TagManager;
	private queries = {
		getAll: this.db.select().from(this.schema).orderBy(sql`name`).prepare(),
		getByName: this.db.select().from(this.schema).where(sql`name IN (${sql.placeholder("names")})`).prepare(),
		getOneByName: this.db.select().from(this.schema).where(sql`name = (${sql.placeholder("name")})`).prepare(),
		getByNameNonPredefined: this.db.select().from(this.schema).where(and(sql`name IN (${sql.placeholder("names")})`, eq(sql`predefined`, false))).prepare()
	}

	abstract get usages(): Array<{ "repo": MySqlRepository, "field": string }>;

	protected initialize() {
		this.tagManager = new TagManager(this, this.usages);
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
		await this.tagManager.delete([tag]);
	}

	getAll() {
		return this.queries.getAll.execute().then(r => r.map(i => i.tag));
	}

	getByName(names: Array<string>) {
		return this.queries.getByName.execute({names});
	}

	getOneByName(name: string) {
		return this.queries.getOneByName.execute({name}).then(r => r.length ? r[0] : undefined);
	}

	getByNameNonPredefined(names: Array<string>) {
		return this.queries.getByNameNonPredefined.execute({names});
	}
}