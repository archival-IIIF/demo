import * as Router from 'koa-router';
import * as fs from 'fs';
import * as path from 'path';
import common from './common';

const router: Router = new Router();

router.get('/iiif/collection/:id', ctx => {

    let id = '/';
    if (ctx.params.id !== undefined) {
        id = common.decode(ctx.params.id);
    }
    if (id === 'demo') {
        id = '/';
    }

    const objectPath = path.join(common.getDemoDataPath(), id);


    if (!fs.existsSync(objectPath)) {
        ctx.throw(404)
    }

    if (!fs.lstatSync(objectPath).isDirectory()) {
        ctx.throw(404)
    }

    let output: any = {
        id: common.getUriByObjectPath(objectPath, ctx, 'collection'),
        type: 'Collection',
        label: path.basename(objectPath),
        '@context': 'http://iiif.io/api/presentation/3/context.json'
    };

    if (id !== '/') {
        const parentPath = path.resolve(objectPath, '..');
        output.partOf = [{id: common.getUriByObjectPath(parentPath, ctx, 'collection'), type: 'Collection'}];
    }

    fs.readdirSync(objectPath).map((name: string) => {

        const subObjectPath = path.join(objectPath, name);

        if (fs.lstatSync(subObjectPath).isDirectory()) {
            if (!output.hasOwnProperty('items')) {
                output.items = [];
            }

            output.items.push(
                {
                    id: common.getUriByObjectPath(subObjectPath, ctx, 'collection'),
                    type: 'Collection',
                    label: name,
                }
            );

        } else {
            if (name.endsWith('manifest.json')) {
                return;
            }

            if (name.startsWith('___')) {
                return;
            }

            if (!output.hasOwnProperty('items')) {
                output.items = [];
            }

            const mediaTypeAndFormat = common.getMediaTypeAndFormat(subObjectPath, ctx);

            let manifest = {
                'id': common.getUriByObjectPath(subObjectPath, ctx, 'manifest'),
                'type': 'Manifest',
                label: name,
                thumbnail: mediaTypeAndFormat.thumbnail,
            };

            manifest = common.addMetadata(manifest, subObjectPath);

            output.items.push(manifest);
        }
    });

    output = common.addMetadata(output, objectPath);

    ctx.body = output;

});

export default router.routes();
