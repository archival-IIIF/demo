import  Router from 'koa-router';
import  fs from 'fs';
import  path from 'path';
import common from './common';
import getBaseUrl from "../lib/BaseUrl";
import {Collection, Manifest, Resource} from "@archival-iiif/presentation-builder/v3";

const router: Router = new Router();

router.get('/iiif/collection/:id', ctx => {
    const isRoot = ctx.params.id === 'demo';
    const objectPath = common.decodeDataPath(isRoot ? '': ctx.params.id);
    if (!objectPath) {
       return ctx.throw(404);
    }

    if (!fs.lstatSync(objectPath).isDirectory()) {
        ctx.throw(404)
    }

    let collection = new Collection(
        common.getUriByObjectPath(objectPath, ctx, 'collection'),
        path.basename(objectPath)
    );
    collection.setContext();

    if (!isRoot) {
        const parentPath = path.resolve(objectPath, '..');
        collection.setParent(
            common.getUriByObjectPath(parentPath, ctx, 'collection')
        );
    }

    fs.readdirSync(objectPath).map((name: string) => {

        const subObjectPath = path.join(objectPath, name);

        if (name.startsWith('.') || name === 'manifest.json' || name.endsWith('.iiif')) {
            return;
        }

        if (fs.lstatSync(subObjectPath).isDirectory()) {

            const subCollection = new Collection(
                common.getUriByObjectPath(subObjectPath, ctx, 'collection'),
                name
            );
            collection.setItems(subCollection)
        } else {
            const mediaTypeAndFormat = common.getMediaTypeAndFormat(subObjectPath, ctx);

            let manifest = new Manifest(
                common.getUriByObjectPath(subObjectPath, ctx, 'manifest'),
                name
            );
            if (mediaTypeAndFormat.thumbnail) {
                manifest.setThumbnail(new Resource(
                    mediaTypeAndFormat.thumbnail.id,
                    'image',
                    undefined,
                    mediaTypeAndFormat.thumbnail.format,
                ));
            }

            manifest = common.addMetadata(manifest, subObjectPath);
            collection.setItems(manifest);
        }
    });

    collection.setRendering({
        id: getBaseUrl(ctx) + '/zip/' + ctx.params.id,
        label: {en: ['Download folder'], de: ['Ordner herunterladen']},
        format: 'application/zip'
    });

    collection = common.addMetadata(collection, objectPath);

    ctx.body = collection;

});

export default router.routes();
