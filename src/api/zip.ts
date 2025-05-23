import Router from 'koa-router';
import fs from 'fs';
import common from './common';
import archiver from 'archiver';
import download from "../lib/Download";

const router: Router = new Router();

router.get('/zip/:id', async ctx => {

    const id = ctx.params.id;
    const dest = common.getCachePath() + '/' + id + '.zip';

    if (fs.existsSync(dest)) {
        return await download(ctx, dest)
    }

    let source: string | false = common.getDemoDataPath();
    if (id !== 'demo') {
        source = common.decodeDataPath(ctx.params.id);
        if (!source) {
            return ctx.throw(404);
        }
    }
    const output = fs.createWriteStream(dest);
    const archive = archiver('zip', {zlib: { level: 9 }});
    archive.pipe(output);
    archive.directory(source, '/');
    await (new Promise((resolve, reject) => {
        archive.finalize().then(() => {
            resolve('done');
        })
    }));

    if (fs.existsSync(dest)) {
        await download(ctx, dest)
    }

    ctx.body = 'Error q';
    ctx.status = 400;
});

export default router.routes();
