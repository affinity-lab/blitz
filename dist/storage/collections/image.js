"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageCollection = void 0;
const collection_1 = require("../collection");
const affinity_util_1 = require("@affinity-lab/affinity-util");
class ImageCollection extends collection_1.Collection {
    static factory(repository, name, rules) {
        return new ImageCollection(`${repository.name}.${name}`, repository.eventEmitter, repository, repository.collectionStorage, rules);
    }
    async prepareFile(file) {
        const descriptor = new affinity_util_1.FileDescriptor(file.file);
        let img = await descriptor.image;
        return {
            file, metadata: {
                width: img?.meta.width,
                height: img?.meta.height,
                color: img?.stats.dominant,
                animated: (img?.meta.pages) ? img.meta.pages > 1 : false,
                focus: "entropy"
            }
        };
    }
    async setTitle(id, filename, title) {
        await this.updateMetadata(id, filename, { title });
    }
}
exports.ImageCollection = ImageCollection;
//# sourceMappingURL=image.js.map