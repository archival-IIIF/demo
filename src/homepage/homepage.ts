import {createReadStream} from 'node:fs';
import Router from "@koa/router";
import  path from 'node:path';
import fs from 'node:fs';

const router = new Router();


router.get('/', async ctx => {
    ctx.type = 'text/html';
    ctx.body = createReadStream(path.join(__dirname, 'homepage.html'));
});

router.all('/favicon.ico', async (ctx) => {
    if ('GET' !== ctx.method && 'HEAD' !== ctx.method) {
        ctx.status = 'OPTIONS' === ctx.method ? 200 : 405;
        ctx.set('Allow', 'GET, HEAD, OPTIONS');
    } else {
        const icon = fs.readFileSync(__dirname + '/iiif.ico');
        ctx.set('Cache-Control', 'public, max-age=86400');
        ctx.type = 'image/x-icon';
        ctx.body = icon;
    }
});

export default router.routes();
