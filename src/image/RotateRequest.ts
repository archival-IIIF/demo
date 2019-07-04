import * as Sharp from 'sharp';

const {RequestError} = require('./errors');

class RotateRequest {

    private isMirrored: boolean;
    private degrees: number;
    private request: string;

    constructor(request: string) {
        this.request = request;
        this.degrees = 0;
        this.isMirrored = false;
    }

    parseImageRequest() {
        let request = this.request;
        if (request.startsWith('!')) {
            request = request.substr(1);
            this.isMirrored = true;
        }

        this.degrees = parseFloat(request);
        if (isNaN(this.degrees))
            throw new RequestError(`Incorrect rotation request: ${this.request}`);

        this.degrees = Math.round(this.degrees);
        if ((this.degrees < 0) || (this.degrees >= 360))
            throw new RequestError('Degrees should be between 0 and 360');

        this.degrees = Math.floor(this.degrees / 90) * 90;
    }

    requiresImageProcessing() {
        return this.isMirrored || (this.degrees > 0);
    }

    executeImageProcessing(image: Sharp.Sharp) {
        if (this.isMirrored) {
            image.flop();
        }
        if (this.degrees > 0) {
            image.rotate(this.degrees);
        }
    }
}

export default RotateRequest;
