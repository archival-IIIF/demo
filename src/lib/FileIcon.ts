import  fs from 'fs';
import  path from 'path';
import {promisify} from 'util';

export const readdirAsync = promisify(fs.readdir);

export const fileIconsPath = path.join(__dirname, '../../node_modules/file-icon-vectors/dist/icons/vivid');

const iconsByExtension: string[] = [];
readdirAsync(fileIconsPath).then((files: string[]) => {
    iconsByExtension.push(...files.map((file: string) => path.basename(file, '.svg')));
});
