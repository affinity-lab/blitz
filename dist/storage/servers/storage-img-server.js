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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.storageImgServer = void 0;
const express_1 = __importDefault(require("express"));
const fs = __importStar(require("fs"));
const path_1 = __importDefault(require("path"));
const sharp_1 = __importDefault(require("sharp"));
const affinity_util_1 = require("@affinity-lab/affinity-util");
function storageImgServer(exp, endpoint, imgStoragePath, fileStoragePath, maxAge) {
    exp.use(endpoint + "/:catalog/:id/:img/:file", (req, res, next) => {
        const { params } = req;
        const ext = path_1.default.extname(params.file);
        const file = path_1.default.parse(params.file).name;
        const { catalog, id, img } = params;
        req.url = `//${catalog}.${id}.${file}.${img}${ext}`;
        res.getHeader("Cache-Control") === undefined && res.setHeader("Cache-Control", `public, max-age=${maxAge}`);
        next();
    }, express_1.default.static(imgStoragePath), async (req, res) => {
        const { params } = req;
        const file = path_1.default.parse(params.file).name;
        const { catalog, id, img } = params;
        let b36 = parseInt(id).toString(36).padStart(6, "0");
        const source = path_1.default.join(fileStoragePath, catalog, b36.slice(0, 2), b36.slice(2, 4), b36.slice(4, 6), file);
        if (!fs.existsSync(source)) {
            res.removeHeader("Cache-Control");
            res.sendStatus(404);
            return;
        }
        sharp_1.default.cache({ files: 0 });
        let meta = await (0, sharp_1.default)(source).metadata();
        const oWidth = meta.width;
        const oHeight = meta.height;
        const match = img.match(/^(\d+)x(\d+)(?:-(\w+))?$/);
        if (match === null)
            throw (0, affinity_util_1.fatalError)("Could not parse img params", { url: req.url });
        let width = match[1] === "0" ? oWidth : parseInt(match[1]);
        let height = match[2] === "0" ? oHeight : parseInt(match[2]);
        const focus = meta.pages > 1 ? "center" : (match[3] || "entropy");
        if (oWidth < width) {
            height = Math.floor(height * oWidth / width);
            width = oWidth;
        }
        if (oHeight < height) {
            width = Math.floor(width * oHeight / height);
            height = oHeight;
        }
        await (0, sharp_1.default)(source, { animated: true })
            .resize(width, height, {
            kernel: sharp_1.default.kernel.lanczos3,
            fit: "cover",
            position: focus,
            withoutEnlargement: true
        })
            .toFile(imgStoragePath + "/" + req.url);
        res.sendFile(path_1.default.resolve(imgStoragePath + "/" + req.url));
    });
}
exports.storageImgServer = storageImgServer;
//# sourceMappingURL=storage-img-server.js.map