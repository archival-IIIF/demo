import Router from '@koa/router';
import fs from 'node:fs';
import path from 'node:path';
import common from './common';
import {ZipArchive} from 'archiver';
import download from "../lib/Download";

const router = new Router();

router.get('/zip/:id', async ctx => {

    const id = ctx.params.id;

    let source: string | false = common.getDemoDataPath();
    if (id !== 'demo') {
        source = common.decodeDataPath(id);
        if (!source || !fs.lstatSync(source).isDirectory()) {
            return ctx.throw(404);
        }
    }

    // Derive the cache file name from the validated path, never from the raw request parameter.
    // This also makes the key canonical, so "Images", "Images--" etc. share one cached zip.
    const relativePath = common.getRelativePath(source);
    const cachePath = path.resolve(common.getCachePath());
    const dest = path.resolve(cachePath, (relativePath === '' ? 'demo' : relativePath) + '.zip');
    if (!dest.startsWith(cachePath + path.sep)) {
        return ctx.throw(400);
    }

    if (!fs.existsSync(dest)) {
        fs.mkdirSync(cachePath, {recursive: true});
        const tmp = `${dest}.${process.pid}.${Date.now()}.tmp`;
        try {
            await new Promise<void>((resolve, reject) => {
                const output = fs.createWriteStream(tmp);
                const archive = new ZipArchive({zlib: {level: 9}});
                output.on('close', () => resolve());
                output.on('error', reject);
                archive.on('error', reject);
                archive.pipe(output);
                archive.directory(source, '/');
                archive.finalize().catch(reject);
            });
            fs.renameSync(tmp, dest);
        } catch (_err) {
            fs.rmSync(tmp, {force: true});
            return ctx.throw(500);
        }
    }

    await download(ctx, dest);
});

export default router.routes();
