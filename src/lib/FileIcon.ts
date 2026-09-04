import  fs from 'node:fs';
import  path from 'node:path';
import {promisify} from 'node:util';

export const readdirAsync = promisify(fs.readdir);

export const fileIconsPath = path.join(__dirname, '../../node_modules/file-icon-vectors/dist/icons/vivid');

const iconsByExtension: string[] = [];
readdirAsync(fileIconsPath).then((files: string[]) => {
    iconsByExtension.push(...files.map((file: string) => path.basename(file, '.svg')));
});
