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
        id: common.getUriByObjectPath(objectPath, ctx, 'manifest'),
        type: 'Manifest',
        label: path.basename(objectPath),
        '@context': 'http://iiif.io/api/presentation/3/context.json',
        partOf: [{id: common.getUriByObjectPath(parentPath, ctx, 'collection'), type: 'Collection'}],
        thumbnail: mediaTypeAndFormat.thumbnail,
        metadata: common.getMetadata(objectPath)
    };

    if (mediaTypeAndFormat.type === 'Image') {
        const dimensions = imageSize(objectPath);
        const imageWith = dimensions.width;
        const imageHeight = dimensions.height;
        output.items = [{
            id: common.getUriByObjectPath(objectPath, ctx, 'canvas'),
            type: 'Canvas',
            width: imageWith,
            height: imageHeight,
            items: [{
                id: common.getUriByObjectPath(objectPath, ctx, 'annotationPage'),
                type: 'AnnotationPage',
                items: [{
                    id: common.getUriByObjectPath(objectPath, ctx, 'annotation'),
                    type: 'Annotation',
                    motivation: 'painting',
                    body: {
                        id: common.getIIIFThumbnail(objectPath, ctx, ),
                        type: 'Image',
                        format: 'image/jpeg',
                        width: imageWith,
                        height: imageHeight,
                        service: {
                            id: common.getUriByObjectPath(objectPath, ctx, 'image'),
                            type: 'ImageService3',
                            width: imageWith,
                            height: imageHeight,
                            sizes: [],
                            profile: 'level2'
                        }
                    },
                    target: common.getUriByObjectPath(objectPath, ctx, 'canvas')
                }]
            }]
        }]
    } else {
        output.items = [{
            id: common.getUriByObjectPath(parentPath, ctx, 'canvas'),
            type: 'Canvas',
            items: [{
                id: common.getUriByObjectPath(objectPath, ctx, 'annotationPage'),
                type: 'AnnotationPage',
                items: [{
                    id: common.getUriByObjectPath(objectPath, ctx, 'annotation'),
                    type: 'Annotation',
                    motivation: 'painting',
                    body: {
                        id: common.getFileId(ctx, objectPath),
                        type: mediaTypeAndFormat.type,
                        format: mediaTypeAndFormat.format,
                        rendering: {
                            id: common.getFileId(ctx, objectPath),
                            label: {en: ['Original copy'], de: ['Originalkopie']},
                            format: mediaTypeAndFormat.format
                        }
                    }
                }]
            }]
        }]
    }

    output = common.addMetadata(output, objectPath);

    ctx.body = output;

});

export default router.routes();
