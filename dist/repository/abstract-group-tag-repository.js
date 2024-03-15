"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbstractGroupTagRepository = void 0;
const tag_repository_interface_1 = require("./tag-repository-interface");
const drizzle_orm_1 = require("drizzle-orm");
class AbstractGroupTagRepository extends tag_repository_interface_1.ITagRepository {
    col = "groupId";
    q;
    initialize(tm, repo, col) {
        this.tagManager = new tm(repo);
        if (!this.q)
            this.q = {};
        if (col)
            this.col = col;
        if (!this.q.getAll)
            this.q.getAll = this.db.select().from(this.schema).where((0, drizzle_orm_1.sql) `${this.schema[this.col]} = ${drizzle_orm_1.sql.placeholder("groupId")}`).orderBy((0, drizzle_orm_1.sql) `name`).prepare();
        if (!this.q.getByName)
            this.q.getByName = this.db.select().from(this.schema).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.sql) `${this.schema[this.col]} = ${drizzle_orm_1.sql.placeholder("groupId")}`, (0, drizzle_orm_1.sql) `name IN (${drizzle_orm_1.sql.placeholder("names")})`)).prepare();
        if (!this.q.getOneByName)
            this.q.getOneByName = this.db.select().from(this.schema).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.sql) `${this.schema[this.col]} = ${drizzle_orm_1.sql.placeholder("groupId")}`, (0, drizzle_orm_1.sql) `name = ${drizzle_orm_1.sql.placeholder("name")}`)).prepare();
        if (!this.q.getByNameNonPredefined)
            this.q.getByNameNonPredefined = this.db.select().from(this.schema).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.sql) `${this.schema[this.col]} = ${drizzle_orm_1.sql.placeholder("groupId")}`, (0, drizzle_orm_1.sql) `name IN (${drizzle_orm_1.sql.placeholder("names")})`, (0, drizzle_orm_1.eq)((0, drizzle_orm_1.sql) `predefined`, false))).prepare();
    }
    async createTag(tag, groupId) {
        await this.tagManager.add([tag], true, groupId);
    }
    async renameTag(oldName, newName, groupId) {
        await this.tagManager.rename(oldName, newName, groupId);
    }
    async changePredefinedTag(name, to, groupId) {
        await this.tagManager.changePredefined(name, to, groupId);
    }
    async deleteTag(tag, groupId) {
        await this.tagManager.deletePredefined(tag, groupId);
    }
    getAll(groupId) {
        return this.q.getAll.execute({ groupId, col: this.col }).then(r => r.map((i) => i.name)).then(r => r.join(','));
    }
    getTags(groupId) {
        return this.q.getAll.execute({ groupId, col: this.col });
    }
    getByName(names, groupId) {
        return this.q.getByName.execute({ names: names.join(", "), groupId, col: this.col });
    }
    getOneByName(name, groupId) {
        return this.q.getOneByName.execute({ name, groupId, col: this.col }).then(r => r.length ? r[0] : undefined);
    }
    getByNameNonPredefined(names, groupId) {
        return this.q.getByNameNonPredefined.execute({ names: names.join(", "), groupId, col: this.col });
    }
}
exports.AbstractGroupTagRepository = AbstractGroupTagRepository;
//# sourceMappingURL=abstract-group-tag-repository.js.map