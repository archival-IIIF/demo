import * as Sharp from 'sharp';
import {AvailableFormatInfo, OutputOptions} from "sharp";
import {JpegOptions} from "sharp";
import {PngOptions} from "sharp";
import {WebpOptions} from "sharp";
import {TiffOptions} from "sharp";

const {NotImplementedError, RequestError} = require('./errors');


interface IAllOutputOptions {
    [key: string]:  OutputOptions | JpegOptions | PngOptions | WebpOptions | TiffOptions
}

class FormatRequest {

    private request: string;
    private format: string;
    private outputOptions: OutputOptions | JpegOptions | PngOptions | WebpOptions | TiffOptions;
    public allOutputOptions: IAllOutputOptions = {
        jpg: {
            quality: 80,
            progressive: false
        },
        png: {
            compressionLevel: 6,
            progressive: false
        },
        webp: {
            quality: 80
        },
        tif: {
            quality: 80
        }
    };

    constructor(request: string) {
        this.request = request;
        this.outputOptions = null;
    }

    parseImageRequest() {
        switch (this.request) {
            case 'jpg':
                this.format = 'jpeg';
                break;
            case 'png':
            case 'webp':
            case 'tif':
                this.format = this.request;
                this.outputOptions = this.allOutputOptions[this.request];
                break;
            case 'gif':
            case 'jp2':
            case 'pdf':
                throw new NotImplementedError(`Format ${this.request} not supported`);
            default:
                throw new RequestError(`Incorrect format request: ${this.request}`);
        }
    }

    requiresImageProcessing() {
        return (this.outputOptions !== undefined && this.outputOptions !== null);
    }

    executeImageProcessing(image: Sharp.Sharp) {
        if (this.requiresImageProcessing()) {
            image.toFormat(this.format, this.outputOptions);
        }
    }
}

export default FormatRequest;
