"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentCollection = void 0;
const collection_1 = require("../collection");
class DocumentCollection extends collection_1.Collection {
    static factory(repository, name, rules) {
        return new DocumentCollection(repository.name + name, repository.eventEmitter, repository, repository.collectionStorage, rules);
    }
    async setTitle(id, filename, title) {
        await this.updateMetadata(id, filename, { title });
    }
}
exports.DocumentCollection = DocumentCollection;
//# sourceMappingURL=document.js.map