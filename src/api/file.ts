import * as Router from 'koa-router';
import * as fs from 'fs';
import * as path from 'path';
import download from '../lib/Download';
import common from './common';
import {serveImage} from "@archival-iiif/image-server-core";
import {imageSize} from 'image-size';
import getBaseUrl from '../lib/BaseUrl';

const router: Router = new Router();

router.get('/file/:id', async ctx => {

    const objectPath = common.decodeDataPath(ctx.params.id);
    if (!objectPath) {
        return ctx.throw(404);
    }

    if (fs.lstatSync(objectPath).isDirectory()) {
        ctx.throw(404);
    }

    await download(ctx, objectPath);



});

router.get('/iiif/image/:image/:region/:size/:rotation/:quality.:format', async ctx => {

    const image = common.basename(ctx.params.image);
    const region = common.basename(ctx.params.region);
    const size = common.basename(ctx.params.size);
    const rotation = common.basename(ctx.params.rotation);
    const quality = common.basename(ctx.params.quality);
    const format = common.basename(ctx.params.format);
    if (
        image.startsWith('.') ||
        region.startsWith('.') ||
        size.startsWith('.') ||
        rotation.startsWith('.') ||
        quality.startsWith('.') ||
        format.startsWith('.')
    ) {
        return ctx.throw(400);
    }

    const tilePath = path.join(
        common.getCachePath(),
        image,
        region,
        size,
        rotation,
        quality + '.' + format
    );

    if (fs.existsSync(tilePath)) {
        await download(ctx, tilePath);
        return;
    }

    const objectPath = common.decodeDataPath(ctx.params.image)
    if (!objectPath) {
        return ctx.throw(404);
    }
    let result = await serveImage(objectPath, null, {
        region,
        size,
        rotation,
        quality,
        format
    });

    ctx.body = result.image;
    //ctx.status = result.status;
    ctx.set('Content-Type', result.contentType);
    ctx.set('Content-Length', result.contentLength.toString());


    fs.mkdirSync(path.dirname(tilePath), {recursive: true});
    fs.writeFileSync(tilePath, result.image);

});

router.get('/iiif/image/:image/info.json', ctx => {
    const objectPath = common.decodeDataPath(ctx.params.image);
    if (!objectPath) {
        return ctx.throw(404);
    }
    const dimensions = imageSize(objectPath);
    const imageWith = dimensions.width;
    const imageHeight = dimensions.height;
    ctx.body = {
        id: getBaseUrl(ctx) + '/iiif/image/' + ctx.params.image,
        protocol: "http://iiif.io/api/image",
        width: imageWith,
        height: imageHeight,
        sizes: [],
        "@context": "http://iiif.io/api/image/3/context.json",
        profile: [
            "http://iiif.io/api/image/3/level2.json",
            {
                supports: ["canonicalLinkHeader", "profileLinkHeader", "mirroring", "rotationArbitrary", "regionSquare"],
                qualities: ["default", "color", "gray", "bitonal"],
                formats: ["jpg", "png", "gif", "webp"]
            }
        ]
    };
});

export default router.routes();
