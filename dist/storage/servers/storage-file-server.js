"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.storageFileServer = void 0;
const express_1 = __importDefault(require("express"));
function storageFileServer(exp, endpoint, fileStoragePath, fileMaxAge, guards = {}) {
    exp.use(endpoint + "/:name/:id/:file", async (req, res, next) => {
        if (guards[req.params.name] !== undefined) {
            let guard = guards[req.params.name];
            if (await guard(parseInt(req.params.id, 36), req.params.file)) {
                res.setHeader("Cache-Control", `public, max-age=0`);
                next();
            }
            else {
                res.sendStatus(404);
            }
        }
        else {
            next();
        }
    }, (req, res, next) => {
        let b36 = parseInt(req.params.id).toString(36).padStart(6, "0");
        req.url = `//${req.params.name}/${b36.slice(0, 2)}/${b36.slice(2, 4)}/${b36.slice(4, 6)}/${req.params.file}`;
        res.getHeader("Cache-Control") === undefined && res.setHeader("Cache-Control", `public, max-age=${fileMaxAge}`);
        next();
    }, express_1.default.static(fileStoragePath), (req, res) => {
        res.removeHeader("Cache-Control");
        res.sendStatus(404);
    });
}
exports.storageFileServer = storageFileServer;
//# sourceMappingURL=storage-file-server.js.map