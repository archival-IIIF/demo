import * as Router from 'koa-router';
import * as fs from 'fs';
import * as path from 'path';
import common from './common';
import {imageSize} from "image-size";
import getBaseUrl from '../lib/BaseUrl';
import * as mime from 'mime-types';

const router: Router = new Router();

router.get('/iiif/manifest/:id', ctx => {

    const id = common.decode(ctx.params.id);
    const objectPath = path.join(common.getDemoDataPath(), id);


    if (!fs.existsSync(objectPath)) {
        ctx.throw(404)
    }


    if (fs.lstatSync(objectPath).isDirectory()) {
        ctx.throw(404);
    }

    const parentPath = path.resolve(objectPath, '..');
    const mediaTypeAndFormat = common.getMediaTypeAndFormat(objectPath, ctx);

    let output: any = {
        '@id': common.getUriByObjectPath(objectPath, ctx, 'manifest'),
        '@type': 'sc:Manifest',
        label: path.basename(objectPath),
        '@context': 'http://iiif.io/api/collection/2/context.json',
        within: common.getUriByObjectPath(parentPath, ctx, 'collection'),
        thumbnail: mediaTypeAndFormat.thumbnail,
        metadata: common.getMetadata(objectPath)
    };

    if (mediaTypeAndFormat.type === 'dctypes:Image') {
        const dimensions = imageSize(objectPath);
        const imageWith = dimensions.width;
        const imageHeight = dimensions.height;
        output.sequences = [{
            '@id': common.getUriByObjectPath(objectPath, ctx, 'sequence'),
            '@type': 'sc:Sequence',
            canvases: [{
                '@id': common.getUriByObjectPath(objectPath, ctx, 'canvas'),
                '@type': 'sc:Canvas',
                width: imageWith,
                height: imageHeight,
                images: [{
                    '@id': common.getUriByObjectPath(objectPath, ctx, 'annotation'),
                    '@type': 'oa:Annotation',
                    motivation: 'sc:painting',
                    resource: {
                        '@id': common.getIIIFThumbnail(objectPath, ctx, ),
                        '@type': 'dctypes:Image',
                        format: 'image/jpeg',
                        width: imageWith,
                        height: imageHeight,
                        service: {
                            '@id': common.getUriByObjectPath(objectPath, ctx, 'image'),
                            protocol: 'http://iiif.io/api/image',
                            width: imageWith,
                            height: imageHeight,
                            sizes: [],
                            profile: 'http://iiif.io/api/image/2/level2.json'
                        }
                    },
                    "on": common.getUriByObjectPath(objectPath, ctx, 'canvas')
                }]
            }]
        }]
    } else {
        output.mediaSequences = [{
            '@id': common.getUriByObjectPath(parentPath, ctx, 'sequence'),
            '@type': 'ixif:MediaSequence',
            'elements': [{
                '@id': common.getFileId(ctx, objectPath),
                '@type': mediaTypeAndFormat.type,
                'format': mediaTypeAndFormat.format,
                'rendering': {
                    '@id': common.getFileId(ctx, objectPath),
                    'label': 'Original copy',
                    'format': mediaTypeAndFormat.format
                }
            }]
        }]
    }

    output = common.addMetadata(output, objectPath);

    ctx.body = output;

});

export default router.routes();
