import * as Router from 'koa-router';
import * as fs from 'fs';
import common from './common';
import Common from "./common";
import * as archiver from 'archiver';
import download from "../lib/Download";

const router: Router = new Router();

router.get('/zip/:id', async ctx => {
    try {
        const id = ctx.params.id;
        const dest = Common.getCachePath() + '/' + id + '.zip';

        if (fs.existsSync(dest)) {
            return await download(ctx, dest)
        }

        let source = Common.getDemoDataPath();
        if (id !== 'demo') {
            source = common.decodeDir(Common.getDemoDataPath(), ctx.params.id);
        }
        const output = fs.createWriteStream(dest);
        const archive = archiver('zip', {zlib: { level: 9 }});
        archive.pipe(output);
        archive.directory(source, '/');
        await (new Promise((resolve, reject) => {
            archive.finalize().then(() => {
                resolve();
            })
        }));

        if (fs.existsSync(dest)) {
            await download(ctx, dest)
        }

        ctx.body = 'Error 3';
        ctx.status = 400;
    } catch (e) {
        ctx.body = e.message;
        ctx.status = 400;
    }
});

export default router.routes();
