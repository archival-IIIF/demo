import type {Context, ParameterizedContext} from "koa";

// Hostname with optional port, e.g. "iiif.example.org" or "localhost:3334".
const HOST_PATTERN = /^[a-z0-9.-]+(:\d{1,5})?$/i;

function firstHeaderValue(value: string | string[] | undefined): string | undefined {
    if (!value) {
        return undefined;
    }
    const str = Array.isArray(value) ? value[0] : value;
    return str.split(',')[0].trim();
}

export default function getBaseUrl(ctx: Context | ParameterizedContext): string {
    // A fixed base URL is the safest option behind a reverse proxy.
    const configured = process.env.BASE_URL;
    if (configured) {
        return configured.replace(/\/+$/, '');
    }

    const forwardedHost = firstHeaderValue(ctx.headers['x-forwarded-host']);
    const host = forwardedHost ?? firstHeaderValue(ctx.headers.host) ?? '';
    if (!HOST_PATTERN.test(host)) {
        ctx.throw(400, 'Invalid host');
    }

    let protocol = 'http';
    if (forwardedHost) {
        const forwardedProto = firstHeaderValue(ctx.headers['x-forwarded-proto'])?.toLowerCase();
        if (forwardedProto === 'https' || forwardedProto === 'http') {
            protocol = forwardedProto;
        }
    }

    return protocol + '://' + host;
}
