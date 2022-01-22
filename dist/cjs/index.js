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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SteamCMD = void 0;
const child_process_1 = require("child_process");
const console_1 = require("console");
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const misc_1 = require("./misc/misc");
const vdf = require('simple-vdf');
class SteamCMD {
    constructor() {
        this.downloadLinks = {
            'win32': { url: 'https://steamcdn-a.akamaihd.net/client/installer/steamcmd.zip', ext: '.exe' },
            'darwin': { url: 'https://steamcdn-a.akamaihd.net/client/installer/steamcmd_osx.tar.gz', ext: '.sh' },
            'linux': { url: 'https://steamcdn-a.akamaihd.net/client/installer/steamcmd_linux.tar.gz', ext: '.sh' }
        };
        this.fileName = '';
        this.cmd = null;
        /**
         * Download the steam cmd script
         */
        this.downloadCMD = () => __awaiter(this, void 0, void 0, function* () {
            if (!(yield (0, fs_1.existsSync)(misc_1.rootFolder))) {
                yield (0, fs_1.mkdirSync)(misc_1.rootFolder);
            }
            const dLink = this.downloadLinks[this.platform];
            if (dLink) {
                this.fileName = dLink.url.split('/')[dLink.url.split('/').length - 1];
                this.cmd = path_1.default.join(misc_1.rootFolder, this.fileName.split('.')[0] + dLink.ext);
                if (!(yield (0, fs_1.existsSync)(path_1.default.join(misc_1.rootFolder, this.fileName)))) {
                    yield (0, misc_1.downloadFile)(dLink.url, this.fileName);
                    const ab = yield (0, misc_1.unpress)(this.fileName);
                }
            }
            else {
                throw new Error('You are running a unsupported platform.');
            }
            return true;
        });
        /**
         * Exec steamcmd commands
         */
        this.execRaw = (commands, config) => __awaiter(this, void 0, void 0, function* () {
            var e_1, _a;
            try {
                if (!this.cmd) {
                    yield this.downloadCMD();
                }
                var installdir = [];
                if (config && config.install_dir) {
                    installdir = ['force_install_dir', config.install_dir];
                }
                const sp = yield (0, child_process_1.spawn)(`${this.cmd}`, [...installdir, '+login', 'anonymous', ...commands, '+quit', '>', path_1.default.join(misc_1.rootFolder, 'output/')]);
                var data = '';
                try {
                    for (var _b = __asyncValues(sp.stdout), _c; _c = yield _b.next(), !_c.done;) {
                        let std = _c.value;
                        data += std;
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (_c && !_c.done && (_a = _b.return)) yield _a.call(_b);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
                const exitCode = yield new Promise((resolve, reject) => {
                    sp.on('close', resolve);
                });
                if (exitCode && exitCode != 7) {
                    throw new Error(`Command line error ${exitCode}, ${console_1.error}`);
                }
                return data;
            }
            catch (e) {
                throw e;
            }
        });
        this.appInfo = (conf) => __awaiter(this, void 0, void 0, function* () {
            // The first call to app_info_print from a new install will return nothing,
            // and it will instead prep an entry for the info and request it.
            // It won't block though, and if the session closes before it can save,
            // the same issue will be present on next run.
            // Thus we use `app_update` to force the session to wait long enough to save.
            const preCommand = [
                '+app_info_print', conf.appid,
                '+force_install_dir', './4',
                '+app_update', 4,
            ];
            // The output from app_update can collide with that of app_info_print,
            // so after ensuring the info is available we must re-run without app_update.
            var command = [
                '+app_info_update', 1,
                '+app_info_print', conf.appid,
                '+find', 'e' // fill the buffer so info's not truncated on Windows
            ];
            yield this.execRaw(preCommand);
            const data = yield this.execRaw(command);
            const start = data === null || data === void 0 ? void 0 : data.indexOf(`"${conf.appid}"`);
            const end = data === null || data === void 0 ? void 0 : data.indexOf('ConVars:');
            if (!start || !end) {
                throw new Error('Something went wrong, The data returned from steamCMD is invalid.');
            }
            const text = data === null || data === void 0 ? void 0 : data.substring(start, end);
            return vdf.parse(text);
        });
        /**
         *
         * @param cfg {Install location and appid}
         * @returns
         */
        this.updateApp = (cfg) => __awaiter(this, void 0, void 0, function* () {
            //Make sure the path is absolute.
            if (!cfg.path) {
                throw new Error('Please provide a installation locagion!');
            }
            if (!path_1.default.isAbsolute(cfg.path))
                throw Error(`The installation path must be absolute, your path now is: ${cfg.path}`);
            //Commands
            const command = [
                '+app_update', cfg.appid
            ];
            const cmd = yield this.execRaw(command, { install_dir: cfg.path });
            if (!cmd) {
                throw new Error('Something went wrong, The data returned from steamCMD is invalid.');
            }
            if (cmd.indexOf(`Success! App '${cfg.appid}' fully installed`) !== -1) {
                return { message: 'App was successfully updated!', updated: true };
            }
            if (cmd.indexOf(`Success! App '${cfg.appid}' already up to date.`) !== -1) {
                return { message: 'App is already up to date!', update: false };
            }
            return Promise.reject(new Error('Something went wrong, The data returned from steamCMD is invalid.'));
        });
        this.installApp = (cfg) => __awaiter(this, void 0, void 0, function* () {
            //Make sure the path is absolute.
            if (!cfg.path) {
                throw new Error('Please provide a installation locagion!');
            }
            if (!path_1.default.isAbsolute(cfg.path))
                throw Error(`The installation path must be absolute, your path now is: ${cfg.path}`);
            //Commands
            const command = [
                '+app_update', cfg.appid, '+validate'
            ];
            const cmd = yield this.execRaw(command, { install_dir: cfg.path });
            if (!cmd) {
                throw new Error('Something went wrong, The data returned from steamCMD is invalid.');
            }
            if (cmd.indexOf(`Success! App '${cfg.appid}' fully installed`) !== -1) {
                return { message: 'App was successfully updated!', updated: true };
            }
            if (cmd.indexOf(`Success! App '${cfg.appid}' already up to date.`) !== -1) {
                return { message: 'App is already up to date!', update: false };
            }
            return Promise.reject(new Error('Something went wrong, The data returned from steamCMD is invalid.'));
        });
        this.platform = process.platform;
    }
}
exports.SteamCMD = SteamCMD;
