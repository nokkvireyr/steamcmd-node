"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadFile = exports.unpress = exports.rootFolder = void 0;
const axios_1 = __importDefault(require("axios"));
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const decompress = require('decompress');
exports.rootFolder = path_1.default.join(__dirname, '../../files');
const unpress = async (name) => {
    return new Promise((resolve) => decompress(path_1.default.join(exports.rootFolder, name), exports.rootFolder).then((files) => resolve(files)));
};
exports.unpress = unpress;
const downloadFile = async (fileUrl, filename) => {
    const writer = (0, fs_1.createWriteStream)(path_1.default.join(exports.rootFolder, filename));
    const { data } = await (0, axios_1.default)({
        method: 'get',
        url: fileUrl,
        responseType: 'stream',
    });
    await data.pipe(writer);
    return new Promise((resolve) => {
        writer.on('finish', resolve);
    });
};
exports.downloadFile = downloadFile;
module.exports = { rootFolder: exports.rootFolder, unpress: exports.unpress, downloadFile: exports.downloadFile };
