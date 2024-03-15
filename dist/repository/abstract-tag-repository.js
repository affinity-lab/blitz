"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbstractTagRepository = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const tag_repository_interface_1 = require("./tag-repository-interface");
class AbstractTagRepository extends tag_repository_interface_1.ITagRepository {
    queries = {
        getAll: this.db.select().from(this.schema).orderBy((0, drizzle_orm_1.sql) `name`).prepare(),
        getByName: this.db.select().from(this.schema).where((0, drizzle_orm_1.sql) `name IN (${drizzle_orm_1.sql.placeholder("names")})`).prepare(),
        getOneByName: this.db.select().from(this.schema).where((0, drizzle_orm_1.sql) `name = ${drizzle_orm_1.sql.placeholder("name")}`).prepare(),
        getByNameNonPredefined: this.db.select().from(this.schema).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.sql) `name IN (${drizzle_orm_1.sql.placeholder("names")})`, (0, drizzle_orm_1.eq)((0, drizzle_orm_1.sql) `predefined`, false))).prepare()
    };
    initialize(c) {
        this.tagManager = new c(this);
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
        await this.tagManager.deletePredefined(tag);
    }
    getAll() {
        return this.queries.getAll.execute().then(r => r.map(i => i.name)).then(r => r.join(','));
    }
    getTags() {
        return this.queries.getAll.execute().then(r => r.map(i => { return { name: i.name, predefined: i.predefined }; }));
    }
    getByName(names) {
        return this.queries.getByName.execute({ names: names.join(", ") });
    }
    getOneByName(name) {
        return this.queries.getOneByName.execute({ name }).then(r => r.length ? r[0] : undefined);
    }
    getByNameNonPredefined(names) {
        return this.queries.getByNameNonPredefined.execute({ names: names.join(", ") });
    }
}
exports.AbstractTagRepository = AbstractTagRepository;
//# sourceMappingURL=abstract-tag-repository.js.map