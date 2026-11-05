import type {RouterContext} from '@koa/router';
import  path from 'node:path';
import  mime from 'mime-types';
import  fs from 'node:fs';
import {promisify} from 'node:util';
const readFileAsync = promisify(fs.readFile);
import HttpError from '../lib/HttpError';


async function download(ctx: RouterContext, filePath: string, fileName?: string) {
    try {
        if (!fileName) {
            fileName = path.basename(filePath);
        }
        const contentType = mime.lookup(filePath);
        if (contentType) {
            ctx.set('Content-Type', contentType);
        }
        ctx.set('X-Content-Type-Options', 'nosniff');
        // Never render active content (HTML, SVG, XML) inline on this origin.
        const isActiveContent = contentType &&
            /^(text\/html|application\/xhtml\+xml|image\/svg\+xml|text\/xml|application\/xml)$/.test(contentType);
        const disposition = isActiveContent ? 'attachment' : 'inline';
        const safeFileName = fileName.replace(/["\\\r\n]/g, '_');
        ctx.set('Content-Disposition', disposition + '; filename="' + safeFileName + '"');
        ctx.body = await readFileAsync(filePath);
    }
    catch (_err) {
        throw new HttpError(404);
    }
}

export default download;
