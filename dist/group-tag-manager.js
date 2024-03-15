"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroupTagManager = void 0;
const tag_manager_interface_1 = require("./tag-manager-interface");
const errors_1 = require("./errors");
class GroupTagManager extends tag_manager_interface_1.ITagManager {
    addUsage(usage) {
        this.usages.push(...(Array.isArray(usage) ? usage : [usage]));
    }
    async update(repository, originalItem, values = {}, eventId) {
        let { prev, curr } = this.prevCurrForUpdate(repository, originalItem);
        await this.add(curr.filter(x => !prev.includes(x)), false, eventId);
        await this.delete(prev.filter(x => !curr.includes(x)), eventId);
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