import  Router from 'koa-router';

function getBaseUrl(ctx: Router.RouterContext): string {
    if (ctx.headers['x-forwarded-host']) {

        let protocol = 'http';
        if (ctx.headers['x-forwarded-proto']) {
            protocol = ctx.headers['x-forwarded-proto'].toString();
        }

        return protocol + '://' + ctx.headers['x-forwarded-host'];
    }

    return ctx.request.origin;
}

export default getBaseUrl;

