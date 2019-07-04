import * as Router from 'koa-router';
import serveImage from './internal';
import getBaseUrl from '../lib/BaseUrl';

const router: Router = new Router();
const imageWith = 1840;
const imageHeight = 1450;


router.get('/collection/image', ctx => {

    let arielPresentation = getArielPresentation(ctx);
    arielPresentation.within = undefined;
    arielPresentation.thumbnail = undefined;

    ctx.body = {
        '@id': getBaseUrl(ctx) + '/collection/image',
        '@type': 'sc:Collection',
        label: 'Image test case',
        '@context': 'http://iiif.io/api/collection/2/context.json',
        license: 'http://creativecommons.org/licenses/by-sa/3.0/',
        manifests: [
            {
                '@id': getBaseUrl(ctx) + '/manifest/ariel',
                '@type': 'sc:Manifest',
                label: 'Ariel_-_LoC_4a15521.jpg',
                thumbnail: {
                    '@id': getBaseUrl(ctx) + '/image/ariel/full/!100,100/0/default.jpg',
                    '@type': "dctypes:Image",
                    format: "image/jpeg",
                    service: {
                        '@id': getBaseUrl(ctx) + '/image/ariel',
                        protocol: "http://iiif.io/api/image",
                        width: imageWith,
                        height: imageHeight,
                        sizes: [],
                        profile: "http://iiif.io/api/image/2/level2.json"
                    }
                }
            },
        ]
    };
});

router.get('/manifest/ariel', ctx => {
    ctx.body = getArielPresentation(ctx);
});

function getArielPresentation(ctx: Router.RouterContext) {
    return {
        '@id': getBaseUrl(ctx) + '/manifest/ariel',
        '@type': 'sc:Manifest',
        label: 'Ariel_-_LoC_4a15521.jpg',
        '@context': 'http://iiif.io/api/collection/2/context.json',
        within: getBaseUrl(ctx) + '/collection/image',
        thumbnail: {
            '@id': getBaseUrl(ctx) + '/image/ariel/full/!100,100/0/default.jpg',
            '@type': "dctypes:Image",
            format: "image/jpeg",
            service: {
                '@id': getBaseUrl(ctx) + '/image/ariel',
                protocol: "http://iiif.io/api/image",
                width: imageWith,
                height: imageHeight,
                profile: "http://iiif.io/api/image/2/level2.json"
            }
        },
        metadata: [
            {
                label: "Original file type",
                value: "<a href=\"https://www.nationalarchives.gov.uk/PRONOM/Format/proFormatSearch.aspx?status=detailReport&id=729\">Windows Bitmap (.bmp, .dib)</a>"
            },
            {
                label: "Original file size",
                value: "1.28 MB"
            },
            {
                label: "Original modification date",
                value: "March 1st 2012"
            }
        ],
        sequences: [{
            '@id': getBaseUrl(ctx) + '/sequence/ariel',
            '@type': 'sc:Sequence',
            canvases: [{
                '@id': getBaseUrl(ctx) + '/canvas/ariel',
                '@type': 'sc:Canvas',
                width: imageWith,
                height: imageHeight,
                images: [{
                    '@id': getBaseUrl(ctx) + '/annotation/ariel/',
                    '@type': 'oa:Annotation',
                    motivation: 'sc:painting',
                    resource: {
                        '@id': getBaseUrl(ctx) + '/image/ariel/full/full/0/default.jpg',
                        '@type': 'dctypes:Image',
                        format: 'image/jpeg',
                        width: imageWith,
                        height: imageHeight,
                        service: {
                            '@id': getBaseUrl(ctx) + '/image/ariel',
                            protocol: 'http://iiif.io/api/image',
                            width: imageWith,
                            height: imageHeight,
                            profile: 'http://iiif.io/api/image/2/level2.json'
                        }
                    },
                    "on": getBaseUrl(ctx) + '/canvas/ariel'
                }]
            }]
        }]
    };
}


router.get('/image/ariel/info.json', ctx => {
    ctx.body = {
        '@id': getBaseUrl(ctx) + '/image/ariel',
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


router.get('/image/ariel/:region/:size/:rotation/:quality.:format', async ctx => {


    const item = {
        uri: __dirname + '/Ariel_-_LoC_4a15521.jpg',
        width: imageWith,
        height: imageHeight
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
});

export default router.routes();
