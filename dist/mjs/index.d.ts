import { iExecRaw, iConfig } from "./misc/misc";
declare class SteamCMD {
    downloadLinks: {
        win32: {
            url: string;
            ext: string;
        };
        darwin: {
            url: string;
            ext: string;
        };
        linux: {
            url: string;
            ext: string;
        };
        [key: string]: {
            url: string;
            ext: string;
        };
    };
    platform: string;
    fileName: string;
    cmd: string | null;
    constructor();
    /**
     * Download the steam cmd script
     */
    downloadCMD: () => Promise<void>;
    /**
     * Exec steamcmd commands
     */
    execRaw: (commands: Array<any>, config?: iExecRaw | undefined) => Promise<string>;
    getAppInfo: (conf: iConfig) => Promise<any>;
    /**
     *
     * @param cfg {Install location and appid}
     * @returns
     */
    updateApp: (cfg: iConfig) => Promise<{
        message: string;
        updated: boolean;
        update?: undefined;
    } | {
        message: string;
        update: boolean;
        updated?: undefined;
    }>;
    installApp: (cfg: iConfig) => Promise<{
        message: string;
        updated: boolean;
        update?: undefined;
    } | {
        message: string;
        update: boolean;
        updated?: undefined;
    }>;
}
export default SteamCMD;
