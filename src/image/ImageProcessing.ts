import * as Sharp from 'sharp'
import {OutputInfo} from "sharp";
import {IProcessingInfo} from "./IProcessingInfo";

class ImageProcessing {

    private processingInfo: IProcessingInfo;
    private requests: any;

    constructor(processingInfo: IProcessingInfo, requests: any) {
        this.processingInfo = processingInfo;
        this.requests = requests;

        this.requests.forEach((request: any) => request.parseImageRequest(this.processingInfo));
    }


    async process(): Promise<{ data: Buffer, info: OutputInfo }> {
        const image = Sharp(this.processingInfo.uri);
        if (this.requests.filter((request: any) => request.requiresImageProcessing()).length > 0)
            this.requests.forEach((request:any) => request.executeImageProcessing(image));
        return await image.toBuffer({resolveWithObject: true});
    }
}

export default ImageProcessing;
