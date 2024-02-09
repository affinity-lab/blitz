"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TagManager = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const errors_1 = require("./errors");
class TagManager {
    tableRepo;
    usages = [];
    constructor(tableRepo) {
        this.tableRepo = tableRepo;
    }
    addUsage(usage) {
        this.usages.push(...(Array.isArray(usage) ? usage : [usage]));
    }
    prepare(repository, values) {
        for (let usage of this.usages) {
            if (usage.repo === repository) {
                values[usage.field] = [...new Set(values[usage.field].trim().split(',').map(x => x.trim()).filter(x => !!x))].join(',');
            }
        }
    }
    async update(repository, originalItem, values = {}) {
        if (!originalItem)
            throw errors_1.blitzError.tagManager.itemNotFound(repository.name);
        let prev = [];
        let curr = [];
        for (let usage of this.usages) {
            if (usage.repo === repository) {
                prev.push(...(originalItem[usage.field] ? originalItem[usage.field].split(',') : []));
                curr.push(...(values[usage.field] ? values[usage.field].split(',') : []));
            }
        }
        prev = [...new Set(prev)];
        curr = [...new Set(curr)];
        await this.add(curr.filter(x => !prev.includes(x)));
        await this.delete(prev.filter(x => !curr.includes(x)));
    }
    async delete(tags) {
        let items = await this.tableRepo.getByNameNonPredefined(tags);
        for (let item of items) {
            let doDelete = true;
            for (let usage of this.usages) {
                let res = await usage.repo.db.select().from(usage.repo.schema).where((0, drizzle_orm_1.sql) `FIND_IN_SET("${item.name}", ${usage.field})`).limit(1).execute();
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
    async changePredefined(name, to) {
        let item = await this.tableRepo.getOneByName(name);
        if (!item)
            throw errors_1.blitzError.tagManager.itemNotFound(name);
        await this.tableRepo.update(item.id, { predefined: to });
    }
    async add(tags, predefined = false) {
        let items = (await this.tableRepo.getByName(tags)).map(x => x.name);
        let toAdd = tags.filter(x => !items.includes(x));
        for (let tag of toAdd) {
            await this.tableRepo.insert({ name: tag, predefined });
        }
    }
    async rename(oldName, newName) {
        oldName = oldName.replace(',', "").trim();
        newName = newName.replace(',', "").trim();
        if (oldName === newName)
            return;
        let o = await this.tableRepo.getOneByName(oldName);
        if (!o)
            return;
        let n = await this.tableRepo.getOneByName(newName);
        if (!n)
            await this.tableRepo.update(o.id, { name: newName });
        else
            await this.tableRepo.delete(o.id);
        for (let usage of this.usages) {
            let set = {};
            set[usage.field] = (0, drizzle_orm_1.sql) `trim(both ',' from replace(concat(',', ${usage.field} , ','), ',${oldName},', ',${newName},'))`;
            usage.repo.db.update(usage.repo.schema).set(set).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.sql) `FIND_IN_SET("${oldName}", ${usage.field})`, (0, drizzle_orm_1.not)((0, drizzle_orm_1.sql) `FIND_IN_SET("${newName}", ${usage.field})`)));
            set[usage.field] = (0, drizzle_orm_1.sql) `trim(both ',' from replace(concat(',', ${usage.field} , ','), ',${oldName},', ','))`;
            usage.repo.db.update(usage.repo.schema).set(set).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.sql) `FIND_IN_SET("${oldName}", ${usage.field})`, (0, drizzle_orm_1.sql) `FIND_IN_SET("${newName}", ${usage.field})`));
        }
    }
}
exports.TagManager = TagManager;
//# sourceMappingURL=tag-manager.js.map