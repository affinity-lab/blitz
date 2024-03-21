"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroupTagManager = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const tag_manager_interface_1 = require("./tag-manager-interface");
const errors_1 = require("./errors");
class GroupTagManager extends tag_manager_interface_1.ITagManager {
    addUsage(usage) {
        this.usages.push(...(Array.isArray(usage) ? usage : [usage]));
    }
    async deleteInUsages(originalItem) {
        let n = `$.${originalItem.name}`;
        let name = `${originalItem.name}`;
        for (let usage of this.usages) {
            let set = {};
            if (usage.mode && usage.mode === "JSON") {
                set[usage.field] = (0, drizzle_orm_1.sql) `json_remove(${usage.repo.schema[usage.field]}, ${n})`;
                await usage.repo.db.update(usage.repo.schema).set(set).where((0, drizzle_orm_1.sql) `json_extract(${usage.repo.schema[usage.field]}, ${n}) > 0`);
            }
            else {
                set[usage.field] = (0, drizzle_orm_1.sql) `trim(both ',' from replace(concat(',', ${usage.repo.schema[usage.field]} , ','), ',${name},', ','))`;
                usage.repo.db.update(usage.repo.schema).set(set).where((0, drizzle_orm_1.sql) `FIND_IN_SET("${name}", ${usage.repo.schema[usage.field]})`);
            }
        }
    }
    async update(repository, originalItem, values = {}, eventId) {
        let { prev, curr } = this.prevCurrForUpdate(repository, originalItem);
        await this.add(curr.filter(x => !prev.includes(x)), false, eventId);
        await this.delete(prev.filter(x => !curr.includes(x)), eventId);
    }
    prevCurrForUpdate(repository, originalItem, values) {
        return { prev: [], curr: [] };
    }
    prepare(repository, values) {
        return;
    }
    async doRename(oldName, newName) {
        let nN = `$.${newName}`;
        let oN = `$.${oldName}`;
        let eN = `"${newName}"`;
        let eO = `"${oldName}"`;
        let oldN = `,${oldName},`;
        let newN = `,${newName},`;
        for (let usage of this.usages) {
            let set = {};
            if (usage.mode && usage.mode === "JSON") {
                let w = (0, drizzle_orm_1.and)((0, drizzle_orm_1.sql) `json_extract(${usage.repo.schema[usage.field]}, ${oN}) > 0`, (0, drizzle_orm_1.sql) `json_extract(${usage.repo.schema[usage.field]}, ${nN}) is NULL`);
                set[usage.field] = (0, drizzle_orm_1.sql) `replace(${usage.repo.schema[usage.field]}, ${eO}, ${eN})`;
                await usage.repo.db.update(usage.repo.schema).set(set).where(w);
                w = (0, drizzle_orm_1.and)((0, drizzle_orm_1.sql) `json_extract(${usage.repo.schema[usage.field]}, ${oN}) > 0`, (0, drizzle_orm_1.sql) `json_extract(${usage.repo.schema[usage.field]}, ${nN}) > 0`);
                // set[usage.field] = sql`json_remove(json_replace(${usage.repo.schema[usage.field]}, ${nN}, json_value(${usage.repo.schema[usage.field]}, ${nN}) + json_value(${usage.repo.schema[usage.field]}, ${oN})), ${oN})`;
                set[usage.field] = (0, drizzle_orm_1.sql) `json_remove(${usage.repo.schema[usage.field]}, ${oN})`; // replace this line with the one above, to add the values together
                await usage.repo.db.update(usage.repo.schema).set(set).where(w);
            }
            else {
                set[usage.field] = (0, drizzle_orm_1.sql) `trim(both ',' from replace(concat(',', ${usage.repo.schema[usage.field]} , ','), ${oldN}, ${newN}))`;
                await usage.repo.db.update(usage.repo.schema).set(set).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.sql) `FIND_IN_SET(${oldName}, ${usage.repo.schema[usage.field]})`, (0, drizzle_orm_1.not)((0, drizzle_orm_1.sql) `FIND_IN_SET(${newName}, ${usage.repo.schema[usage.field]})`)));
                set[usage.field] = (0, drizzle_orm_1.sql) `trim(both ',' from replace(concat(',', ${usage.repo.schema[usage.field]} , ','), ${oldN}, ','))`;
                await usage.repo.db.update(usage.repo.schema).set(set).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.sql) `FIND_IN_SET(${oldName}, ${usage.repo.schema[usage.field]})`, (0, drizzle_orm_1.sql) `FIND_IN_SET(${newName}, ${usage.repo.schema[usage.field]})`));
            }
        }
    }
    async delete(tags, eventId) {
        if (tags.length === 0)
            return;
        let items = await this.tableRepo.getByNameNonPredefined(tags, eventId);
        await this.deleteItems(items);
    }
    async deletePredefined(name, eventId) {
        let item = await this.tableRepo.getOneByName(name, eventId);
        if (!item)
            errors_1.blitzError.tagManager.itemNotFound(name);
        return this.tableRepo.delete(item.id);
    }
    async changePredefined(name, to, eventId) {
        let item = await this.tableRepo.getOneByName(name, eventId);
        if (!item)
            throw errors_1.blitzError.tagManager.itemNotFound(name);
        await this.tableRepo.update(item.id, { predefined: to });
        if (!to)
            await this.delete([name], eventId);
    }
    async add(tags, predefined = false, eventId) {
        if (tags.length === 0)
            return;
        let items = (await this.tableRepo.getByName(tags)).map((x) => x.name);
        let toAdd = tags.filter(x => !items.includes(x));
        for (let tag of toAdd) {
            await this.tableRepo.insert({ name: tag, predefined, eventId });
        }
    }
    async rename(oldName, newName, eventId) {
        oldName = oldName.replace(',', "").trim();
        newName = newName.replace(',', "").trim();
        if (oldName === newName)
            return;
        let o = await this.tableRepo.getOneByName(oldName, eventId);
        if (!o)
            return;
        let n = await this.tableRepo.getOneByName(newName, eventId);
        if (!n)
            await this.tableRepo.update(o.id, { name: newName });
        else
            await this.tableRepo.delete(o.id);
        this.doRename(oldName, newName);
    }
}
exports.GroupTagManager = GroupTagManager;
//# sourceMappingURL=group-tag-manager.js.map