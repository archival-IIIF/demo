import  Router from 'koa-router';
import {createReadStream} from 'fs';
import  path from 'path';

const router: Router = new Router();


router.get('/', async ctx => {
    ctx.type = 'text/html';
    ctx.body = createReadStream(path.join(__dirname, 'homepage.html'));
});

export default router.routes();
