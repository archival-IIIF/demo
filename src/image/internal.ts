import {IProcessingInfo} from "./IProcessingInfo";
import getFullPath from '../lib/Item';

import ImageProcessing from './ImageProcessing';
import RegionRequest from './RegionRequest';
import SizeRequest from './SizeRequest';
import RotateRequest from './RotateRequest';
import QualityRequest from './QualityRequest';
import FormatRequest from './FormatRequest';
const {RequestError, NotImplementedError} = require('./errors');

interface IResult {
    image: null | Buffer;
    status: number;
    contentType: null | string;
    contentLength: null | number;
}

interface IParams {
    region: string;
    size: string;
    rotation: string;
    quality: string;
    format: string;
}

async function serveImage(item: any, {region, size, rotation, quality, format}: IParams) {
    const result: IResult = {
        image: null,
        status: 200,
        contentType: null,
        contentLength: null
    };

    try {
        const processingInfo: IProcessingInfo = {uri: getFullPath(item), size: {width: item.width, height: item.height}};
        const imageProcessing = new ImageProcessing(processingInfo, [
            new RegionRequest(region),
            new SizeRequest(size),
            new RotateRequest(rotation),
            new QualityRequest(quality),
            new FormatRequest(format)
        ]);

        const processedImage = await imageProcessing.process();
        result.image = processedImage.data;
        result.contentLength = processedImage.info.size;
        result.contentType = getContentType(format);
    }
    catch (err) {
        if (err instanceof RequestError)
            result.status = 400;
        else if (err instanceof NotImplementedError)
            result.status = 501;
        else
            throw err;
    }

    return result;
}

function getContentType(extension: string) {
    switch (extension) {
        case 'jpg':
        case 'jpeg':
            return 'image/jpeg';
        case 'tif':
        case 'tiff':
            return 'image/tiff';
        case 'png':
            return 'image/png';
        case 'webp':
            return 'image/webp';
        default:
            return null;
    }
}

export default serveImage;
