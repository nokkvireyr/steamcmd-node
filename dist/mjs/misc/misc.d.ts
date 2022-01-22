export declare const rootFolder: string;
export declare const unpress: (name: string) => Promise<unknown>;
export declare const downloadFile: (fileUrl: string, filename: string) => Promise<unknown>;
export interface iExecRaw {
    install_dir: string;
}
export interface iConfig {
    path?: string;
    appid: string | number;
}
