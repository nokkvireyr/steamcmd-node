import { spawn } from "child_process";
import { error } from "console";
import { existsSync, mkdirSync } from "fs";
import path from "path";
import { downloadFile, iExecRaw, iConfig, rootFolder, unpress } from "./misc/misc.js";
import * as vdf from 'vdf-parser';
import { config } from "process";

export class SteamCMD {

    downloadLinks:{win32: {url: string, ext: string}, darwin: {url: string, ext: string}, linux: {url: string, ext: string}, [key: string]: {url:string, ext: string}} = {
        'win32': {url: 'https://steamcdn-a.akamaihd.net/client/installer/steamcmd.zip', ext: '.exe'},
        'darwin': {url: 'https://steamcdn-a.akamaihd.net/client/installer/steamcmd_osx.tar.gz', ext: '.sh'},
        'linux': {url: 'https://steamcdn-a.akamaihd.net/client/installer/steamcmd_linux.tar.gz', ext: '.sh'}
    }

    platform: string;
    fileName: string = '';
    cmd: string | null = null;
    constructor () {
        this.platform = process.platform;
    }

    /**
     * Download the steam cmd script
     */
    downloadCMD = async () => {
        if(!(await existsSync(rootFolder))) {
            await mkdirSync(rootFolder);
        }
        const dLink = this.downloadLinks[this.platform];
        if(dLink) {
            this.fileName = dLink.url.split('/')[dLink.url.split('/').length - 1]; 
            this.cmd = path.join(rootFolder, this.fileName.split('.')[0] + dLink.ext);
            if(!(await existsSync(path.join(rootFolder, this.fileName)))) {
                await downloadFile(dLink.url, this.fileName);
                const ab = await unpress(this.fileName);
            }
        } else {
            throw new Error('You are running a unsupported platform.');
        }
        return true;
    }

    /**
     * Exec steamcmd commands
     */
    public execRaw = async (commands:Array<any>, config?:iExecRaw) => {
        try {
            if(!this.cmd) {
                await this.downloadCMD();
            } 
            var installdir:Array<any> = [];
            if(config && config.install_dir) {
                installdir = ['force_install_dir', config.install_dir]
            }
            const sp = await spawn(`${this.cmd}`, 
            [...installdir, '+login', 'anonymous', ...commands, '+quit', '>',path.join(rootFolder, 'output/')]);
            var data = '';
            for await (let std of sp.stdout) {
                data += std;
            }
            const exitCode = await new Promise( (resolve, reject) => {
                sp.on('close', resolve);
            });
            if( exitCode && exitCode != 7) {
                throw new Error( `Command line error ${exitCode}, ${error}`);
            }
            return data;
        } catch(e) {
            throw e;
        }
    }

    public appInfo = async (conf:iConfig) => {

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
            '+app_info_update', 1, // force data update
            '+app_info_print', conf.appid,
            '+find', 'e' // fill the buffer so info's not truncated on Windows
        ]
        console.log(`[STEAMCMD] Getting app info for ${conf.appid}, This may take upto a minute!`);
        await this.execRaw(preCommand);
        const data = await this.execRaw(command);
        const start = data?.indexOf(`"${conf.appid}"`);
        const end = data?.indexOf('ConVars:');
        if(!start || !end) {
            throw new Error('Something went wrong, The data returned from steamCMD is invalid.');
        }
        const text = data?.substring(start, end);
        return vdf.parse(text);
    }

    /**
     * 
     * @param cfg {Install location and appid}
     * @returns 
     */
    public updateApp = async (cfg:iConfig) => {
        //Make sure the path is absolute.
        if(!cfg.path) {throw new Error('Please provide a installation location!')}
        if(!path.isAbsolute(cfg.path)) throw Error(`The installation path must be absolute, your path now is: ${cfg.path}`);

        //Commands
        const command = [
            '+app_update', cfg.appid
        ];
        console.log(`[STEAMCMD] Updating ${cfg.appid}`)
        const cmd = await this.execRaw(command, {install_dir: cfg.path});
        if(!cmd) {
            throw new Error('Something went wrong, The data returned from steamCMD is invalid.');
        }
        if(cmd.indexOf(`Success! App '${cfg.appid}' fully installed`) !== -1) {
            return {message: 'App was successfully updated!', updated: true};
        }
        if(cmd.indexOf(`Success! App '${cfg.appid}' already up to date.`) !== -1) {
            return {message: 'App is already up to date!', update: false};
        }
        return Promise.reject(new Error('Something went wrong, The data returned from steamCMD is invalid.'));
    }

    public installApp = async (cfg:iConfig) => {
        //Make sure the path is absolute.
        if(!cfg.path) {throw new Error('Please provide a installation location!')}
        if(!path.isAbsolute(cfg.path)) throw Error(`The installation path must be absolute, your path now is: ${cfg.path}`);

        //Commands
        const command = [
            '+app_update', cfg.appid, '+validate'
        ];
        console.log(`[STEAMCMD] installing ${cfg.appid}`)
        const cmd = await this.execRaw(command, {install_dir: cfg.path});
        if(!cmd) {
            throw new Error('Something went wrong, The data returned from steamCMD is invalid.');
        }
        if(cmd.indexOf(`Success! App '${cfg.appid}' fully installed`) !== -1) {
            return {message: 'App was successfully updated!', updated: true};
        }
        if(cmd.indexOf(`Success! App '${cfg.appid}' already up to date.`) !== -1) {
            return {message: 'App is already up to date!', update: false};
        }
        return Promise.reject(new Error('Something went wrong, The data returned from steamCMD is invalid.'));
    }
}
