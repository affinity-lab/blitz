"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.imgEventListeners = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const events_1 = require("../events");
const glob_1 = require("glob");
function imgEventListeners(imgPath, eventEmitter) {
    eventEmitter.on(events_1.BLITZ_EVENTS.STORAGE_DESTROY, (collection, id) => {
        const pattern = path_1.default.join(imgPath, `${collection}.${id.toString(36).padStart(6, "0")}*`);
        const files = glob_1.glob.sync(pattern);
        files.forEach((file) => {
            try {
                fs_1.default.unlinkSync(file);
            }
            catch (err) {
            }
        });
    });
    eventEmitter.on(events_1.BLITZ_EVENTS.STORAGE_DELETE, (collection, id, filename) => {
        const pattern = path_1.default.join(imgPath, `${collection}.${id.toString(36).padStart(6, "0")}.${filename}*`).replaceAll("\\", "/");
        const files = glob_1.glob.sync(pattern);
        files.forEach((file) => {
            try {
                fs_1.default.unlinkSync(file);
            }
            catch (err) {
            }
        });
    });
    eventEmitter.on(events_1.BLITZ_EVENTS.STORAGE_RENAME, (collection, id, filename) => {
        const pattern = path_1.default.join(imgPath, `${collection}.${id.toString(36).padStart(6, "0")}.${filename}*`).replaceAll("\\", "/");
        const files = glob_1.glob.sync(pattern);
        files.forEach((file) => {
            try {
                fs_1.default.unlinkSync(file);
            }
            catch (err) {
            }
        });
    });
}
exports.imgEventListeners = imgEventListeners;
//# sourceMappingURL=img-event-listeners.js.map