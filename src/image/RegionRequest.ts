import {IProcessingInfo} from "./IProcessingInfo";

const {RequestError} = require('./errors');
import * as Sharp from 'sharp';


class RegionRequest {

    private request: any;
    private left: number;
    private top: number;
    private width: number;
    private height: number;
    private isSquare: boolean;
    private isFull: boolean;


    public REGION_IN_PIXELS: RegExp = /^([0-9]+),([0-9]+),([0-9]+),([0-9]+)$/;
    public REGION_IN_PERCENTAGES: RegExp = /^pct:([0-9]+\.?[0-9]*),([0-9]+\.?[0-9]*),([0-9]+\.?[0-9]*),([0-9]+\.?[0-9]*)$/;


    constructor(request: any) {
        this.request = request;
        this.left = 0;
        this.top = 0;
        this.width = 0;
        this.height = 0;
        this.isSquare = false;
        this.isFull = false;
    }

    parseImageRequest(processingInfo: IProcessingInfo) {
        if (this.request === 'full') {
            this.isFull = true;
            return;
        }

        if (this.request === 'square') {
            this.isSquare = true;

            if (processingInfo.size.width === processingInfo.size.height)
                this.isFull = true;
            else {
                const shortestDimension = Math.min(processingInfo.size.width, processingInfo.size.height);
                processingInfo.size = {width: shortestDimension, height: shortestDimension};
            }

            return;
        }

        const imageSize = processingInfo.size;

        let result;
        if ((result = this.REGION_IN_PIXELS.exec(this.request)) !== null) {
            [, this.left, this.top, this.width, this.height] = result.map(i => parseInt(i));
        }
        else if ((result = this.REGION_IN_PERCENTAGES.exec(this.request)) !== null) {
            [, this.left, , this.width] = result.map(i => Math.round((imageSize.width / 100) * parseFloat(i)));
            [, , this.top, , this.height] = result.map(i => Math.round((imageSize.height / 100) * parseFloat(i)));
        }
        else
            throw new RequestError(`Incorrect region request: ${this.request}`);

        if (this.left < 0) this.left = 0;
        if (this.top < 0) this.top = 0;

        if ((this.width + this.left) > imageSize.width) this.width = imageSize.width - this.left;
        if ((this.height + this.top) > imageSize.height) this.height = imageSize.height - this.top;

        if ((this.width === 0) || (this.height === 0))
            throw new RequestError('Region width and/or height should not be zero');

        if ((this.left > imageSize.width) || (this.top > imageSize.height))
            throw new RequestError('Region is entirely outside the bounds');

        const isUpperLeftCorner = ((this.left === 0) && (this.top === 0));
        const isFullWidthAndHeight = ((this.width === imageSize.width) && (this.height === imageSize.height));
        if (isUpperLeftCorner && isFullWidthAndHeight)
            this.isFull = true;
        else
            processingInfo.size = {width: this.width, height: this.height};
    }

    requiresImageProcessing() {
        return !this.isFull;
    }

    executeImageProcessing(image: Sharp.Sharp) {
        if (this.requiresImageProcessing()) {
            if (this.isSquare)
                image.resize(null, null, {
                    fit: 'cover',
                    position: Sharp.strategy.entropy
                });
            else
                image.extract({left: this.left, top: this.top, width: this.width, height: this.height});
        }
    }
}

export default RegionRequest;
