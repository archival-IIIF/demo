import * as Router from 'koa-router';
import * as fs from 'fs';
import * as path from 'path';
import download from '../lib/Download';
import common from './common';
import serveImage from '../image/internal';
import {imageSize} from 'image-size';
import getBaseUrl from '../lib/BaseUrl';

const router: Router = new Router();

router.get('/file/:id', async ctx => {

    const id = common.decode(ctx.params.id);
    const objectPath = path.join(common.getDemoDataPath(), id);


    if (!fs.existsSync(objectPath)) {
        ctx.throw(404)
    }

    if (fs.lstatSync(objectPath).isDirectory()) {
        ctx.throw(404);
    }

    await download(ctx, objectPath);
});

router.get('/iiif/image/:image/:region/:size/:rotation/:quality.:format', async ctx => {

    const tilePath = path.join(
        common.getCachePath(),
        ctx.params.image,
        ctx.params.region,
        ctx.params.size,
        ctx.params.rotation,
        ctx.params.quality + '.' + ctx.params.format
    );

    if (fs.existsSync(tilePath)) {
        await download(ctx, tilePath);
        return;
    }

    const id = common.decode(ctx.params.image);
    const objectPath = path.join(common.getDemoDataPath(), id);
    const item = {
        uri: objectPath
    };
    let result = await serveImage(item, {
        region: ctx.params.region,
        size: ctx.params.size,
        rotation: ctx.params.rotation,
        quality: ctx.params.quality,
        format: ctx.params.format
    });

    ctx.body = result.image;
    ctx.status = result.status;
    ctx.set('Content-Type', result.contentType);
    ctx.set('Content-Length', result.contentLength.toString());


    fs.mkdirSync(path.dirname(tilePath), {recursive: true});
    fs.writeFileSync(tilePath, result.image);

});

router.get('/iiif/image/:image/info.json', ctx => {
    const dimensions = imageSize(common.getFullPath(ctx.params.image));
    const imageWith = dimensions.width;
    const imageHeight = dimensions.height;
    ctx.body = {
        '@id': getBaseUrl(ctx) + '/iiif/image/' + ctx.params.image,
        "protocol": "http://iiif.io/api/image",
        "width": imageWith,
        "height": imageHeight,
        "sizes": [],
        "@context": "http://iiif.io/api/image/2/context.json",
        "profile": [
            "http://iiif.io/api/image/2/level2.json",
            {
                "supports": ["canonicalLinkHeader", "profileLinkHeader", "mirroring", "rotationArbitrary", "regionSquare"],
                "qualities": ["default", "color", "gray", "bitonal"],
                "formats": ["jpg", "png", "gif", "webp"]
            }
        ]
    };
});

export default router.routes();
