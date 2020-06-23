import * as Router from 'koa-router';

const router: Router = new Router();

import manifest from './manifest';
import file from './file';
import collection from './collection';
import zip from "./zip";

router.use(manifest);
router.use(file);
router.use(collection);
router.use(zip);

export default router.routes();
