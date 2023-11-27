"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Collection = void 0;
const events_1 = require("../events");
const path_1 = __importDefault(require("path"));
const errors_1 = require("../errors");
const fs_1 = __importDefault(require("fs"));
class Collection {
    name;
    emitter;
    repository;
    storage;
    rules;
    static factory(repository, name, rules) {
        return new Collection(repository.name + name, repository.eventEmitter, repository, repository.collectionStorage, rules);
    }
    constructor(name, emitter, repository, storage, rules) {
        this.name = name;
        this.emitter = emitter;
        this.repository = repository;
        this.storage = storage;
        this.rules = rules;
        // if it was a string cast it to array
        if (typeof this.rules.ext === "string")
            this.rules.ext = [this.rules.ext];
        // if it was an empty string cast it to undefined
        if (Array.isArray(this.rules.ext) && this.rules.ext.length === 0)
            this.rules.ext = undefined;
        this.emitter.on(events_1.BLITZ_EVENTS.AFTER_DELETE, async (repo, id) => {
            console.log(id);
            console.log(repo);
            if (repo === this.repository) {
                this.emitter.emit(events_1.BLITZ_EVENTS.STORAGE_DESTROY, this.name, id);
                await this.storage.destroy(this.name, id);
            }
        });
    }
    async updateMetadata(id, filename, metadata) {
        await this.storage.updateMetadata(this.name, id, filename, metadata);
    }
    async prepareFile(file) { return { file, metadata: {} }; }
    async add(id, file) {
        let metadata;
        const ext = path_1.default.extname(file.filename);
        const filename = path_1.default.basename(file.filename);
        // check if entity exists
        if (await this.repository.get(id) === undefined) {
            throw errors_1.blitzError.storage.ownerNotExists(this.repository.name, id);
        }
        // check limit
        const attachments = await this.storage.get(this.name, id);
        if (attachments.length >= this.rules.limit) {
            throw errors_1.blitzError.storage.tooManyFiles(this.repository.name, id, filename, this.rules.limit);
        }
        // check extension
        if (this.rules.ext !== undefined && !this.rules.ext.includes(ext)) {
            throw errors_1.blitzError.storage.extensionNotAllowed(this.repository.name, id, filename, this.rules.ext);
        }
        // prepare (modify, replace, whatever) the file
        ({ file, metadata } = await this.prepareFile(file));
        // check size
        let size = fs_1.default.statSync(file.file).size;
        if (size > this.rules.size) {
            throw errors_1.blitzError.storage.fileTooLarge(this.repository.name, id, filename, this.rules.size);
        }
        await this.storage.add(this.name, id, file, metadata);
    }
    async delete(id, filename) {
        this.emitter.emit(events_1.BLITZ_EVENTS.STORAGE_DELETE, this.name, id, filename);
        await this.storage.delete(this.name, id, filename);
    }
    async get(id) {
        return await this.storage.get(this.name, id);
    }
    async setPosition(id, filename, position) {
        await this.storage.setPosition(this.name, id, filename, position);
    }
}
exports.Collection = Collection;
//# sourceMappingURL=collection.js.map