"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollectionStorage = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const errors_1 = require("../errors");
const crypto_1 = __importDefault(require("crypto"));
class CollectionStorage {
    path;
    db;
    schema;
    cache;
    queries = {};
    constructor(path, db, schema, cache) {
        this.path = path;
        this.db = db;
        this.schema = schema;
        this.cache = cache;
        this.queries = {
            get: this.db.select().from(schema).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.sql) `name = ${drizzle_orm_1.sql.placeholder("name")}`, (0, drizzle_orm_1.sql) `itemId = ${drizzle_orm_1.sql.placeholder("id")}`)).limit(1).prepare(),
            all: this.db.select().from(schema).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.sql) `itemId IN (${drizzle_orm_1.sql.placeholder("ids")})`, (0, drizzle_orm_1.sql) `name = ${drizzle_orm_1.sql.placeholder("name")}`)).prepare(),
            del: this.db.delete(schema).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.sql) `itemId = (${drizzle_orm_1.sql.placeholder("id")})`, (0, drizzle_orm_1.sql) `name = ${drizzle_orm_1.sql.placeholder("name")}`)).prepare()
        };
    }
    getPath(name, id) { return path_1.default.resolve(this.path, name, id.toString(36).padStart(6, "0").match(/.{1,2}/g).join("/")); }
    key(name, id) { return `${name}-${id}`; }
    removeStructure(dir) {
        let parent = path_1.default.parse(dir).dir;
        let list = fs_1.default.readdirSync(dir);
        if (list.length === 0) {
            fs_1.default.rmdirSync(dir);
            this.removeStructure(parent);
        }
    }
    ;
    sanitizeFilename(filename) {
        const extName = path_1.default.extname(filename);
        const fileName = path_1.default.basename(filename, extName);
        return fileName.toLowerCase().trim().replace(/[/\\?%*:|"<>]/g, "-") + extName.toLowerCase().trim();
    }
    getUniqueFilename(directory, filename) {
        const baseName = path_1.default.basename(filename, path_1.default.extname(filename));
        const extName = path_1.default.extname(filename);
        let newName = filename;
        let count = 1;
        while (fs_1.default.existsSync(path_1.default.resolve(directory, newName))) {
            newName = `${baseName}(${count})${extName}`;
            count++;
        }
        return newName;
    }
    async get(name, id, res = {}) {
        if (Array.isArray(id)) {
            if (id.length === 0)
                return [];
            let records;
            const res = {};
            if (this.cache !== undefined) {
                // get available items from cache
                let keys = id.map(id => this.key(name, id));
                records = await this.cache.get(keys);
                for (const i in records)
                    res[records[i].itemId] = JSON.parse(records[i].data);
                // get the rest and set to cache
                const has = records.map(record => record.itemId);
                const need = id.filter(i => !has.includes(i));
                records = await this.queries.all.execute({ name, need });
                for (const i in records)
                    res[records[i].itemId] = JSON.parse(records[i].data);
                const toCache = records.map(record => { return { key: this.key(record.name, record.itemId), value: record }; });
                await this.cache.set(toCache);
            }
            else {
                records = await this.queries.all.execute({ name, id });
                for (const i in records)
                    res[records[i].itemId] = JSON.parse(records[i].data);
            }
            return res;
        }
        else {
            //read from cache
            let record = await this.cache?.get(this.key(name, id));
            if (record !== undefined) {
                res.found = "cache";
                return JSON.parse(record.data);
            }
            //read from db
            const records = await this.queries.get.execute({ name, id });
            if (records && records.length > 0) {
                record = records[0];
                res.found = "db";
                this.cache?.set({ key: this.key(name, id), value: record });
                return JSON.parse(record.data);
            }
            res.found = false;
            return [];
        }
    }
    async getIndexOfAttachments(name, id, filename, fail = false) {
        const attachments = await this.get(name, id);
        console.log(attachments);
        const idx = attachments.findIndex(a => a.name === filename);
        if (idx === -1 && fail)
            throw errors_1.blitzError.storage.attachedFileNotFound(name, id, filename);
        return { attachments, index: idx };
    }
    async destroy(name, id) {
        this.cache?.del(this.key(name, id));
        await this.queries.del.execute({ name, id });
        const path = this.getPath(name, id);
        const files = fs_1.default.readdirSync(path);
        files.map(async (file) => {
            fs_1.default.unlinkSync(path_1.default.join(path, file));
        });
        this.removeStructure(path);
    }
    async updateRecord(name, id, attachments) {
        this.cache?.del(this.key(name, id));
        await this.db.update(this.schema)
            .set({ data: JSON.stringify(attachments) })
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)((0, drizzle_orm_1.sql) `itemId`, drizzle_orm_1.sql.placeholder("id")), (0, drizzle_orm_1.eq)((0, drizzle_orm_1.sql) `name`, drizzle_orm_1.sql.placeholder("name"))))
            .execute({ name, id });
    }
    async add(name, id, file, metadata) {
        let path = this.getPath(name, id);
        let filename = path_1.default.basename(file.filename);
        filename = this.sanitizeFilename(filename);
        filename = this.getUniqueFilename(path, filename);
        fs_1.default.mkdirSync(path, { recursive: true });
        fs_1.default.copyFileSync(file.file, path_1.default.join(path, filename));
        let res = {};
        const attachments = await this.get(name, id, res);
        attachments.push({
            name: filename,
            size: fs_1.default.statSync(file.file).size,
            id: crypto_1.default.randomUUID(),
            metadata
        });
        if (res.found === false) {
            await this.db.insert(this.schema).values({ name, itemId: id, data: JSON.stringify(attachments) }).execute();
        }
        else {
            await this.db.update(this.schema).set({ data: JSON.stringify(attachments) }).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.sql) `name = ${drizzle_orm_1.sql.placeholder("name")}`, (0, drizzle_orm_1.sql) `itemId = ${drizzle_orm_1.sql.placeholder("id")}`)).execute({ name, id });
            this.cache?.del(this.key(name, id));
        }
        file.release();
    }
    async delete(name, id, filename) {
        let { attachments, index } = await this.getIndexOfAttachments(name, id, filename, true);
        attachments.splice(index, 1);
        await this.updateRecord(name, id, attachments);
        const path = this.getPath(name, id);
        fs_1.default.unlinkSync(path_1.default.resolve(path, filename));
        this.removeStructure(path);
    }
    async setPosition(name, id, filename, position) {
        const attachments = await this.get(name, id);
        const idx = attachments.findIndex(a => a.name === filename);
        if (idx === -1)
            throw errors_1.blitzError.storage.attachedFileNotFound(name, id, filename);
        if (idx === position)
            return;
        attachments.splice(position, 0, ...attachments.splice(idx, 1));
        await this.updateRecord(name, id, attachments);
    }
    async updateMetadata(name, id, filename, metadata) {
        const attachments = await this.get(name, id);
        const idx = attachments.findIndex(a => a.name === filename);
        if (idx === -1)
            throw errors_1.blitzError.storage.attachedFileNotFound(name, id, filename);
        attachments[idx].metadata = { ...attachments[idx].metadata, ...metadata };
        await this.updateRecord(name, id, attachments);
    }
    async rename(name, id, filename, newName) {
        const attachments = await this.get(name, id);
        const idx = attachments.findIndex(a => a.name === filename);
        if (idx === -1)
            throw errors_1.blitzError.storage.attachedFileNotFound(name, id, filename);
        let path = this.getPath(name, id);
        newName = this.sanitizeFilename(newName);
        newName = this.getUniqueFilename(path, newName);
        attachments[idx].name = newName;
        fs_1.default.renameSync(path_1.default.join(path, filename), path_1.default.join(path, newName));
        await this.updateRecord(name, id, attachments);
    }
}
exports.CollectionStorage = CollectionStorage;
//# sourceMappingURL=collection-storage.js.map