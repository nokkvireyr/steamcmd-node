import axios from "axios";
import { createWriteStream } from "fs";
import path from "path";
import decompress from 'decompress';
export const rootFolder = path.join('./files');
export const unpress = async (name) => {
    return new Promise((resolve) => decompress(path.join(rootFolder, name), rootFolder).then((files) => resolve(files)));
};
export const downloadFile = async (fileUrl, filename) => {
    const writer = createWriteStream(path.join(rootFolder, filename));
    const { data } = await axios({
        method: 'get',
        url: fileUrl,
        responseType: 'stream',
    });
    await data.pipe(writer);
    return new Promise((resolve) => {
        writer.on('finish', resolve);
    });
};
