"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TagManager = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const errors_1 = require("./errors");
const tag_manager_interface_1 = require("./tag-manager-interface");
class TagManager extends tag_manager_interface_1.ITagManager {
    usages = [];
    addUsage(usage) {
        this.usages.push(...(Array.isArray(usage) ? usage : [usage]));
    }
    async update(repository, originalItem, values = {}) {
        let { prev, curr } = this.prevCurrForUpdate(repository, originalItem);
        await this.add(curr.filter(x => !prev.includes(x)));
        await this.delete(prev.filter(x => !curr.includes(x)));
    }
    async delete(tags) {
        if (tags.length === 0)
            return;
        let items = await this.tableRepo.getByNameNonPredefined(tags);
        await this.deleteItems(items);
    }
    async deletePredefined(name) {
        let item = await this.tableRepo.getOneByName(name);
        if (!item)
            errors_1.blitzError.tagManager.itemNotFound(name);
        return this.tableRepo.delete(item.id);
    }
    async changePredefined(name, to) {
        let item = await this.tableRepo.getOneByName(name);
        if (!item)
            throw errors_1.blitzError.tagManager.itemNotFound(name);
        await this.tableRepo.update(item.id, { predefined: to });
        if (!to)
            await this.delete([name]);
    }
    async add(tags, predefined = false) {
        if (tags.length === 0)
            return;
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
        await this.doRename(oldName, newName);
    }
    async deleteInUsages(originalItem) {
        let name = `${originalItem.name}`;
        for (let usage of this.usages) {
            let set = {};
            set[usage.field] = (0, drizzle_orm_1.sql) `trim(both ',' from replace(concat(',', ${usage.repo.schema[usage.field]} , ','), ',${name},', ','))`;
            usage.repo.db.update(usage.repo.schema).set(set).where((0, drizzle_orm_1.sql) `FIND_IN_SET("${name}", ${usage.repo.schema[usage.field]})`);
        }
    }
}
exports.TagManager = TagManager;
//# sourceMappingURL=tag-manager.js.map