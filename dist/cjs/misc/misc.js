"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadFile = exports.unpress = exports.rootFolder = void 0;
const axios_1 = __importDefault(require("axios"));
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const decompress = require('decompress');
exports.rootFolder = path_1.default.join('../../files');
const unpress = (name) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve) => decompress(path_1.default.join(exports.rootFolder, name), exports.rootFolder).then((files) => resolve(files)));
});
exports.unpress = unpress;
const downloadFile = (fileUrl, filename) => __awaiter(void 0, void 0, void 0, function* () {
    const writer = (0, fs_1.createWriteStream)(path_1.default.join(exports.rootFolder, filename));
    const { data } = yield (0, axios_1.default)({
        method: 'get',
        url: fileUrl,
        responseType: 'stream',
    });
    yield data.pipe(writer);
    return new Promise((resolve) => {
        writer.on('finish', resolve);
    });
});
exports.downloadFile = downloadFile;
