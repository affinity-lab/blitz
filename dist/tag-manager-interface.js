"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ITagManager = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const errors_1 = require("./errors");
class ITagManager {
    tableRepo;
    usages = [];
    constructor(tableRepo) {
        this.tableRepo = tableRepo;
    }
    prepare(repository, values) {
        for (let usage of this.usages) {
            if (usage.repo === repository) {
                if (!values[usage.field])
                    values[usage.field] = "";
                values[usage.field] = [...new Set(values[usage.field].trim().split(',').map(x => x.trim()).filter(x => !!x))].join(',');
            }
        }
    }
    prevCurrForUpdate(repository, originalItem, values = {}) {
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
        //TODO ITT A HIBA
        return { prev, curr };
    }
    async deleteItems(items) {
        for (let item of items) {
            let doDelete = true;
            for (let usage of this.usages) {
                let res = await usage.repo.db.select().from(usage.repo.schema).where((0, drizzle_orm_1.sql) `FIND_IN_SET(${item.name}, ${usage.repo.schema[usage.field]})`).limit(1).execute();
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
    doRename(oldName, newName) {
        for (let usage of this.usages) {
            let set = {};
            set[usage.field] = (0, drizzle_orm_1.sql) `trim(both ',' from replace(concat(',', ${usage.field} , ','), ',${oldName},', ',${newName},'))`;
            usage.repo.db.update(usage.repo.schema).set(set).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.sql) `FIND_IN_SET("${oldName}", ${usage.field})`, (0, drizzle_orm_1.not)((0, drizzle_orm_1.sql) `FIND_IN_SET("${newName}", ${usage.field})`)));
            set[usage.field] = (0, drizzle_orm_1.sql) `trim(both ',' from replace(concat(',', ${usage.field} , ','), ',${oldName},', ','))`;
            usage.repo.db.update(usage.repo.schema).set(set).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.sql) `FIND_IN_SET("${oldName}", ${usage.field})`, (0, drizzle_orm_1.sql) `FIND_IN_SET("${newName}", ${usage.field})`));
        }
    }
}
exports.ITagManager = ITagManager;
//# sourceMappingURL=tag-manager-interface.js.map