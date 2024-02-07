"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbstractTagRepository = void 0;
const my_sql_repository_1 = require("./my-sql-repository");
const tag_manager_1 = require("../tag-manager");
const drizzle_orm_1 = require("drizzle-orm");
class AbstractTagRepository extends my_sql_repository_1.MySqlRepository {
    tagManager;
    queries = {
        getAll: this.db.select().from(this.schema).orderBy((0, drizzle_orm_1.sql) `name`).prepare(),
        getByName: this.db.select().from(this.schema).where((0, drizzle_orm_1.sql) `name IN (${drizzle_orm_1.sql.placeholder("names")})`).prepare(),
        getOneByName: this.db.select().from(this.schema).where((0, drizzle_orm_1.sql) `name = (${drizzle_orm_1.sql.placeholder("name")})`).prepare(),
        getByNameNonPredefined: this.db.select().from(this.schema).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.sql) `name IN (${drizzle_orm_1.sql.placeholder("names")})`, (0, drizzle_orm_1.eq)((0, drizzle_orm_1.sql) `predefined`, false))).prepare()
    };
    initialize() {
        this.tagManager = new tag_manager_1.TagManager(this, this.usages);
    }
    async createTag(tag) {
        await this.tagManager.add([tag], true);
    }
    async renameTag(oldName, newName) {
        await this.tagManager.rename(oldName, newName);
    }
    async changePredefinedTag(name, to) {
        await this.tagManager.changePredefined(name, to);
    }
    async deleteTag(tag) {
        await this.tagManager.delete([tag]);
    }
    getAll() {
        return this.queries.getAll.execute().then(r => r.map(i => i.tag));
    }
    getByName(names) {
        return this.queries.getByName.execute({ names });
    }
    getOneByName(name) {
        return this.queries.getOneByName.execute({ name }).then(r => r.length ? r[0] : undefined);
    }
    getByNameNonPredefined(names) {
        return this.queries.getByNameNonPredefined.execute({ names });
    }
}
exports.AbstractTagRepository = AbstractTagRepository;
//# sourceMappingURL=abstract-tag-repository.js.map