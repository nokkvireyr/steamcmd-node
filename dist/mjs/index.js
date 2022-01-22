"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const console_1 = require("console");
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const misc_1 = require("./misc/misc");
const vdf = require('simple-vdf');
class SteamCMD {
    downloadLinks = {
        'win32': { url: 'https://steamcdn-a.akamaihd.net/client/installer/steamcmd.zip', ext: '.exe' },
        'darwin': { url: 'https://steamcdn-a.akamaihd.net/client/installer/steamcmd_osx.tar.gz', ext: '.sh' },
        'linux': { url: 'https://steamcdn-a.akamaihd.net/client/installer/steamcmd_linux.tar.gz', ext: '.sh' }
    };
    platform;
    fileName = '';
    cmd = null;
    constructor() {
        this.platform = process.platform;
    }
    /**
     * Download the steam cmd script
     */
    downloadCMD = async () => {
        if (!(await (0, fs_1.existsSync)(misc_1.rootFolder))) {
            await (0, fs_1.mkdirSync)(misc_1.rootFolder);
        }
        const dLink = this.downloadLinks[this.platform];
        if (dLink) {
            this.fileName = dLink.url.split('/')[dLink.url.split('/').length - 1];
            this.cmd = path_1.default.join(misc_1.rootFolder, this.fileName.split('.')[0] + dLink.ext);
            if (!(await (0, fs_1.existsSync)(path_1.default.join(misc_1.rootFolder, this.fileName)))) {
                await (0, misc_1.downloadFile)(dLink.url, this.fileName);
                const ab = await (0, misc_1.unpress)(this.fileName);
            }
        }
        else {
            throw new Error('You are running a unsupported platform.');
        }
        return true;
    };
    /**
     * Exec steamcmd commands
     */
    execRaw = async (commands, config) => {
        try {
            if (!this.cmd) {
                await this.downloadCMD();
            }
            var installdir = [];
            if (config && config.install_dir) {
                installdir = ['force_install_dir', config.install_dir];
            }
            const sp = await (0, child_process_1.spawn)(`${this.cmd}`, [...installdir, '+login', 'anonymous', ...commands, '+quit', '>', path_1.default.join(misc_1.rootFolder, 'output/')]);
            var data = '';
            for await (let std of sp.stdout) {
                data += std;
            }
            const exitCode = await new Promise((resolve, reject) => {
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
    };
    appInfo = async (conf) => {
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
        await this.execRaw(preCommand);
        const data = await this.execRaw(command);
        const start = data?.indexOf(`"${conf.appid}"`);
        const end = data?.indexOf('ConVars:');
        if (!start || !end) {
            throw new Error('Something went wrong, The data returned from steamCMD is invalid.');
        }
        const text = data?.substring(start, end);
        return vdf.parse(text);
    };
    /**
     *
     * @param cfg {Install location and appid}
     * @returns
     */
    updateApp = async (cfg) => {
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
        const cmd = await this.execRaw(command, { install_dir: cfg.path });
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
    };
    installApp = async (cfg) => {
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
        const cmd = await this.execRaw(command, { install_dir: cfg.path });
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
    };
}
exports.default = SteamCMD;
module.exports = SteamCMD;
