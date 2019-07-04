const {RequestError} = require('./errors');
import * as Sharp from 'sharp';

class QualityRequest {

    private request: string;
    private setQuality: boolean;

    constructor(request: string) {
        this.request = request;
        this.setQuality = false;
    }

    parseImageRequest() {
        switch (this.request) {
            case 'color':
            case 'default':
                this.setQuality = false;
                break;
            case 'gray':
            case 'bitonal':
                this.setQuality = true;
                break;
            default:
                throw new RequestError(`Incorrect quality request: ${this.request}`);
        }
    }

    requiresImageProcessing() {
        return this.setQuality;
    }

    executeImageProcessing(image: Sharp.Sharp) {
        if (this.request === 'gray')
            image.gamma().grayscale();
        else if (this.request === 'bitonal')
            image.threshold();
    }
}

export default QualityRequest;
