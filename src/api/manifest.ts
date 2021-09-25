import  Router from 'koa-router';
import  fs from 'fs';
import  path from 'path';
import common from './common';
import {imageSize} from "image-size";
import getBaseUrl from '../lib/BaseUrl';
import removeDiacritics from "./Diacritics";

const router: Router = new Router();

router.get('/iiif/manifest/:id', ctx => {

    const objectPath = common.decodeDataPath(ctx.params.id)
    if (!objectPath) {
        return ctx.throw(404);
    }

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

    output = common.addMetadata(output, objectPath);

    if (mediaTypeAndFormat.type === 'Image') {

        output.items = [getImageItem(objectPath, ctx)];
        const pagesDir = objectPath + '.iiif/pages';
        if (fs.existsSync(pagesDir)) {
            const pages = fs.readdirSync(pagesDir);
            pages.forEach(function (page) {
                output.items.push(getImageItem(pagesDir + '/' + page, ctx))
            });
        }
        output = common.addSearch(output, objectPath, ctx);

    } else {

        let rendering = [{
            id: common.getFileId(ctx, objectPath),
            label: {en: ['Original copy'], de: ['Originalkopie']},
            format: mediaTypeAndFormat.format
        }];
        if (output.hasOwnProperty('rendering')) {
            rendering = output.rendering;
            for(const r of rendering) {
                r.id = getBaseUrl(ctx) +  r.id
            }
            output.rendering = undefined;
        }

        output.items = [{
            id: common.getUriByObjectPath(objectPath, ctx, 'canvas'),
            type: 'Canvas',
            width: 1,
            height: 1,
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
                        format: mediaTypeAndFormat.format
                    },
                    target:  common.getUriByObjectPath(objectPath, ctx, 'canvas'),
                }]
            }],
            rendering,
        }];

        output = common.addTranscript(output, objectPath, ctx);
    }


    ctx.body = output;

});

router.get('/iiif/autocomplete/:id', ctx => {

    const objectPath = common.decodeDataPath(ctx.params.id)
    if (!objectPath) {
        return ctx.throw(404);
    }

    const searchFile = objectPath + '.iiif/search.json';
    if (!fs.existsSync(searchFile)) {
        return ctx.throw(404);
    }

    let searchData: {chars: string}[][] = JSON.parse(fs.readFileSync(searchFile, 'utf8'));

    const terms = [];
    let q = ctx.query.q.toString() ?? '';
    if (q !== '') {
        const qq = removeDiacritics(q);
        for (const p of searchData) {
            for (const w of p) {
                if(removeDiacritics(w.chars).includes(qq)) {
                    terms.push({
                        match: w.chars,
                        url: common.getUriByObjectPath(objectPath, ctx, 'search') + "?q=" + w.chars +
                            "&motivation=painting",
                        count: 1
                    });
                }
            }
        }
    }


    ctx.body = {
        "@context": "http://iiif.io/api/search/1/context.json",
        "@id": common.getUriByObjectPath(objectPath, ctx, 'autocomplete') + "?q=" + q + "&motivation=painting",
        "@type":"search:TermList",
        ignored: ["user"],
        terms
    }
});


router.get('/iiif/search/:id', ctx => {

    const objectPath = common.decodeDataPath(ctx.params.id)
    if (!objectPath) {
        return ctx.throw(404);
    }

    const searchFile = objectPath + '.iiif/search.json';
    if (!fs.existsSync(searchFile)) {
        return ctx.throw(404);
    }

    let searchData: {chars: string, on?: string}[][] = JSON.parse(fs.readFileSync(searchFile, 'utf8'));

    const hits = [];
    const resources = [];
    let q = ctx.query.q.toString() ?? '';
    if (q !== '') {
        let a = 0;
        const qq = removeDiacritics(q);
        for (const p of searchData) {
            let i = 0;
            for (const w of p) {
                if (removeDiacritics(w.chars).includes(qq)) {
                    let on = w.on ?? '';
                    on = on.startsWith('xywh') ? ctx.params.id + '#' + on : on;
                    on = getBaseUrl(ctx) + '/iiif/canvas/' + on;
                    const annotationId = common.getUriByObjectPath(objectPath, ctx, 'annotation') + '/' + a++;
                    resources.push({
                        "@type": "oa:Annotation",
                        "@id": annotationId,
                        motivation:	"sc:painting",
                        resource: {
                            "@type": "cnt:ContentAsText",
                            chars: w.chars
                        },
                        on
                    });

                    const before = p.slice(0, i).map((w => w.chars)).join(' ');
                    const after = p.slice(i+1, p.length).map((w => w.chars)).join(' ');
                    hits.push({
                        "@type": "search:Hit",
                        before,
                        after,
                        annotations: [annotationId]
                    });
                }
                i++;
            }
        }
    }


    ctx.body = {
        "@context": "http://iiif.io/api/search/1/context.json",
        "@id": common.getUriByObjectPath(objectPath, ctx, 'search') + "?q=" + q + "&motivation=painting",
        profile: "http://iiif.io/api/search/1/search",
        resources,
        hits
    }
});

function getImageItem(objectPath: string, ctx: Router.RouterContext) {
    const dimensions = imageSize(objectPath);
    const imageWith = dimensions.width;
    const imageHeight = dimensions.height;
    const sizes: any = [];

    return {
        id: common.getUriByObjectPath(objectPath, ctx, 'canvas'),
        type: 'Canvas',
        width: imageWith,
        height: imageHeight,
        items: [
            {
                id: common.getUriByObjectPath(objectPath, ctx, 'annotationPage'),
                type: 'AnnotationPage',
                items: [{
                    id: common.getUriByObjectPath(objectPath, ctx, 'annotation'),
                    type: 'Annotation',
                    motivation: 'painting',
                    body: {
                        id: common.getIIIFThumbnail(objectPath, ctx,),
                        type: 'Image',
                        format: 'image/jpeg',
                        width: imageWith,
                        height: imageHeight,
                        service: {
                            id: common.getUriByObjectPath(objectPath, ctx, 'image'),
                            type: 'ImageService3',
                            sizes,
                            width: imageWith,
                            height: imageHeight,
                            profile: 'level2'
                        }
                    },
                    target: common.getUriByObjectPath(objectPath, ctx, 'canvas')
                }]
            }
        ]
    }
}

export default router.routes();
