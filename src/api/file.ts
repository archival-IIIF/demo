import Router from '@koa/router';
import  fs from 'node:fs';
import  path from 'node:path';
import download from '../lib/Download';
import common from './common';
import {serveImage} from "@archival-iiif/image-server-core";
import getBaseUrl from '../lib/BaseUrl';
import {imageSizeFromFile} from 'image-size/fromFile';

const router = new Router();

const MAX_IMAGE_SIZE = getMaxImageSize();

function getMaxImageSize(): number {
    const value = Number.parseInt(process.env.MAX_IMAGE_SIZE ?? '5000', 10);
    return value > 0 ? value : 5000;
}

/**
 * Accepts the IIIF Image API 3 size syntax without upscaling
 * ("max", "w,", ",h", "w,h", "!w,h", "pct:n") and rejects requested
 * dimensions above MAX_IMAGE_SIZE, so every request stays cheap to render
 * and the number of distinct cached tiles stays bounded.
 */
function isAllowedSize(size: string): boolean {
    if (size === 'max' || size === 'full') {
        return true;
    }

    const pct = /^pct:(\d+(\.\d+)?)$/.exec(size);
    if (pct) {
        const value = Number.parseFloat(pct[1]);
        return value > 0 && value <= 100;
    }

    const dims = /^!?(\d*),(\d*)$/.exec(size);
    if (!dims || (dims[1] === '' && dims[2] === '')) {
        return false;
    }

    return [dims[1], dims[2]]
        .filter((v) => v !== '')
        .every((v) => {
            const n = Number.parseInt(v, 10);
            return n > 0 && n <= MAX_IMAGE_SIZE;
        });
}

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
    // Upscaling ("^") is not advertised in info.json and is an easy way to exhaust CPU, memory and disk.
    if (size.startsWith('^') || !isAllowedSize(size)) {
        return ctx.throw(400);
    }

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
    const result = await serveImage(objectPath, null, {
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

router.get('/iiif/image/:image/info.json', async ctx => {
    const objectPath = common.decodeDataPath(ctx.params.image);
    if (!objectPath) {
        return ctx.throw(404);
    }
    const dimensions = await imageSizeFromFile(objectPath);
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
