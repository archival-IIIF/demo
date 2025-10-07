import {Context, ParameterizedContext} from "koa";

export default function getBaseUrl(ctx: Context | ParameterizedContext): string {
    if (ctx.headers['x-forwarded-host']) {

        let protocol = 'http';
        if (ctx.headers['x-forwarded-proto']) {
            protocol = ctx.headers['x-forwarded-proto'].toString();
        }

        return protocol + '://' + ctx.headers['x-forwarded-host'];
    }

    let protocol = 'http';

    return protocol + '://' + ctx.headers['host'];
}
