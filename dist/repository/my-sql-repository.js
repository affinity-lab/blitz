"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MySqlRepository = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const util_1 = require("@affinity-lab/util");
const crypto = __importStar(require("crypto"));
const events_1 = require("../events");
class MySqlRepository {
    schema;
    db;
    eventEmitter;
    collectionStorage;
    store;
    cache;
    static cache(ttl) {
        return (target, propertyKey, descriptor) => {
            const func = descriptor.value;
            const id = crypto.randomUUID();
            descriptor.value = async function (...args) {
                const instance = this;
                if (instance.cache === undefined)
                    return await func.call(instance, ...args);
                const key = crypto.createHash("md5").update(id + JSON.stringify(args)).digest("hex");
                const item = await instance.cache?.get(key);
                if (item !== undefined)
                    return item;
                const result = await func.call(instance, ...args);
                if (result !== undefined)
                    await instance.cache?.set({ key: key, value: result }, ttl);
                return result;
            };
        };
    }
    static store() {
        return (target, propertyKey, descriptor) => {
            const func = descriptor.value;
            descriptor.value = async function (...args) {
                const instance = this;
                const result = await func.call(instance, ...args);
                if (instance.store && result !== undefined)
                    await instance.store?.set(instance.itemToKeyValue(result));
                return result;
            };
        };
    }
    publicFields = {};
    getBeforeUpdate = false;
    getBeforeDelete = false;
    get tagRepos() { return []; }
    excludedFields = [];
    files;
    constructor(schema, db, eventEmitter, collectionStorage, store, cache) {
        this.schema = schema;
        this.db = db;
        this.eventEmitter = eventEmitter;
        this.collectionStorage = collectionStorage;
        this.store = store;
        this.cache = cache;
    }
    initialize() { }
    get name() { return (0, drizzle_orm_1.getTableName)(this.schema); }
    get baseQueries() {
        for (let key of Object.keys(this.schema))
            if (!this.excludedFields.includes(key))
                this.publicFields[key] = this.schema[key];
        return {
            get: this.db.select(this.publicFields).from(this.schema).where((0, drizzle_orm_1.sql) `id = ${drizzle_orm_1.sql.placeholder("id")}`).limit(1).prepare(),
            all: this.db.select(this.publicFields).from(this.schema).where((0, drizzle_orm_1.sql) `id IN (${drizzle_orm_1.sql.placeholder("ids")})`).prepare(),
            del: this.db.delete(this.schema).where((0, drizzle_orm_1.sql) `id = (${drizzle_orm_1.sql.placeholder("id")})`).prepare()
        };
    }
    itemToKeyValue(item) {
        if (!Array.isArray(item))
            return { key: item.id, value: item };
        return item.map((item) => Object({ key: item.id, value: item }));
    }
    async get(id) {
        if (id === undefined || id === null)
            return Promise.resolve(undefined);
        if (Array.isArray(id))
            return this.all(id);
        return this.store ? this.getFromStoreOrDatabase(id) : (await this.baseQueries.get.execute({ id }))[0];
    }
    async getFromStoreOrDatabase(id) {
        // try from store, when exists return
        let item = await this.store.get(id);
        if (item)
            return Promise.resolve(item);
        // fetch, store and return
        let res = await this.baseQueries.get.execute({ id });
        item = res && res.length ? (res)[0] : undefined;
        if (item)
            await this.store.set(this.itemToKeyValue(item));
        return item;
    }
    async all(ids) {
        return this.store ? this.allFromStoreOrDatabase(ids) : this.baseQueries.all.execute({ ids });
    }
    async allFromStoreOrDatabase(ids) {
        const items = await this.store.get(ids);
        if (items.length === ids.length)
            return Promise.resolve(items); // when all loaded from store return
        let idsToFetch; // get the rest ids to fetch
        if (items.length === 0) {
            idsToFetch = ids;
        }
        else {
            let itemIds = items.map(item => item.id); // ids of the items we already got
            idsToFetch = ids.filter(id => !itemIds.includes(id));
        }
        const result = [];
        const fetched = await this.baseQueries.all.execute({ ids: idsToFetch });
        await this.store.set(this.itemToKeyValue(fetched));
        result.push(...items, ...fetched);
        return Promise.resolve(result);
    }
    async insert(values) {
        this.eventEmitter.emit(events_1.BLITZ_EVENTS.BEFORE_INSERT, this, values);
        if (await this.beforeInsert(values) !== false) {
            let insertWith = {};
            let keys = Object.keys(this.schema);
            for (let key of Object.keys(values))
                if (keys.includes(key))
                    insertWith[key] = values[key];
            const res = await this.db.insert(this.schema).values(insertWith);
            const id = res[0].insertId;
            this.eventEmitter.emit(events_1.BLITZ_EVENTS.AFTER_INSERT, this, id, values);
            await this.afterInsert(id, values);
            return id;
        }
        return undefined;
    }
    async update(id, values) {
        if (typeof id != "number") {
            values = id;
            id = values.id;
            delete (values.id);
        }
        if (typeof id !== "number" || isNaN(id))
            throw (0, util_1.fatalError)("id not provided for update");
        await this.store?.del(id);
        let item = this.getBeforeUpdate ? await this.get(id) : undefined;
        this.eventEmitter.emit(events_1.BLITZ_EVENTS.BEFORE_UPDATE, this, id, values, item);
        if (await this.beforeUpdate(id, values, item) !== false) {
            let updateWith = {};
            let keys = Object.keys(this.schema);
            for (let key of Object.keys(values))
                if (keys.includes(key))
                    updateWith[key] = values[key];
            const res = await this.db.update(this.schema).set(updateWith).where((0, drizzle_orm_1.sql) `id = ${id}`);
            const affectedRows = res[0].affectedRows;
            this.eventEmitter.emit(events_1.BLITZ_EVENTS.AFTER_UPDATE, this, id, values, affectedRows, item);
            await this.afterUpdate(id, values, affectedRows, item);
            return affectedRows;
        }
        return 0;
    }
    async delete(id) {
        await this.store?.del(id);
        let item = this.getBeforeDelete ? await this.get(id) : undefined;
        this.eventEmitter.emit(events_1.BLITZ_EVENTS.BEFORE_DELETE, this, id, item);
        if (await this.beforeDelete(id, item) !== false) {
            const res = await this.baseQueries.del.execute({ id });
            const affectedRows = res[0].affectedRows;
            this.eventEmitter.emit(events_1.BLITZ_EVENTS.AFTER_DELETE, this, id, affectedRows, item);
            await this.afterDelete(id, affectedRows, item);
        }
    }
    async beforeUpdate(id, values, item) {
        for (let repo of this.tagRepos)
            if (!!repo.tagManager)
                repo.tagManager.prepare(this, values);
    }
    async beforeDelete(id, item) { }
    async beforeInsert(values) {
        for (let repo of this.tagRepos)
            if (!!repo.tagManager)
                repo.tagManager.prepare(this, values);
    }
    async afterUpdate(id, values, affectedRows, originalItem) {
        for (let repo of this.tagRepos)
            if (!!repo.tagManager)
                await repo.tagManager.update(this, originalItem, values);
    }
    async afterDelete(id, affectedRows, originalItem) {
        for (let repo of this.tagRepos)
            if (!!repo.tagManager)
                await repo.tagManager.update(this, originalItem);
    }
    async afterInsert(id, values) { }
}
exports.MySqlRepository = MySqlRepository;
__decorate([
    (0, util_1.MaterializeIt)(),
    __metadata("design:type", Object),
    __metadata("design:paramtypes", [])
], MySqlRepository.prototype, "baseQueries", null);
//# sourceMappingURL=my-sql-repository.js.map