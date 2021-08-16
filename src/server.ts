import * as Koa from 'koa';
import homepage from './homepage/homepage';
import * as path from "path";
import api from './api/routes';
const serve = require('koa-static-server');

const app: Koa = new Koa();
const {fileIconsPath} = require('./lib/FileIcon');
const config = require('./lib/Config');
const bodyParser = require('koa-bodyparser');


app.use(async (ctx: Koa.Context, next: Function) => {
    ctx.set('Access-Control-Allow-Origin', '*');
    ctx.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

    if (ctx.method === 'OPTIONS')
        ctx.status = 204;
    else
        await next();
});


app.use(bodyParser());

app.use(homepage);
app.use(api);
app.use(serve({rootDir: fileIconsPath, rootPath: '/file-icon'}));
app.use(serve({rootDir: path.join(__dirname, './../viewer/'), rootPath: '/static'}));
app.use(serve({
    rootDir: path.join(__dirname, './../node_modules/@archival-iiif/viewer/dist'),
    rootPath: '/archival-iiif'
}));


app.keys = ['secret'];


app.listen(config.port);
console.info(`Listening to http://localhost:${config.port} 🚀`);
