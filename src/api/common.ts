import * as Router from 'koa-router';
import Pronoms from './pronoms';
import * as fs from 'fs';
import * as path from 'path';
import getBaseUrl from '../lib/BaseUrl';
import {throws} from "assert";

const filesize = require('filesize');

class Common {


    static getMediaTypeAndFormat(objectPath: string, ctx: Router.RouterContext) {

        const extension = path.extname(objectPath);

        if (extension === '.mp3') {
            return {
                type: 'dctypes:Sound',
                format: 'audio/mpeg',
                thumbnail: {
                    'id': getBaseUrl(ctx) + '/file-icon/mp3.svg',
                    format: 'image/svg+xml'
                }
            };
        }

        if (extension === '.ogg') {
            return {
                type: 'dctypes:Sound',
                format: 'audio/mpeg',
                thumbnail: {
                    'id': getBaseUrl(ctx)  + '/file-icon/ogg.svg',
                    format: 'image/svg+xml'
                }
            };
        }

        if (extension === '.jpg') {
            const relativePath = this.getRelativePath(objectPath);
            return {
                type: 'Image',
                format: 'image/jpeg',
                thumbnail: {
                    'id': this.getIIIFThumbnail(relativePath, ctx),
                    format: 'image/jpeg'
                }
            };
        }

        if (extension === '.png') {
            const relativePath = this.getRelativePath(objectPath);
            return {
                type: 'Image',
                format: 'image/png',
                thumbnail: {
                    'id': this.getIIIFThumbnail(relativePath, ctx),
                    format: 'image/png'
                }
            };
        }

        if (extension === '.m4v' || extension === '.mp4') {
            return {
                type: 'dctypes:Document',
                format: 'video/mp4',
                thumbnail: {
                    'id': getBaseUrl(ctx) + '/file-icon/mp4.svg',
                    format: 'image/svg+xml'
                }
            };
        }

        if (extension === '.ogv') {
            return {
                type: 'dctypes:Document',
                format: 'video/ogg',
                thumbnail: {
                    'id': getBaseUrl(ctx) + '/file-icon/ogv.svg',
                    format: 'image/svg+xml'
                }
            };
        }

        if (extension === '.webm') {
            return {
                type: 'dctypes:Document',
                format: 'video/webm',
                thumbnail: {
                    'id': getBaseUrl(ctx) + '/file-icon/webm.svg',
                    format: 'image/svg+xml'
                }
            };
        }

        if (extension === '.docx') {
            return {
                type: 'foaf:Document',
                format: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                thumbnail: {
                    'id': getBaseUrl(ctx) + '/file-icon/docx.svg',
                    format: 'image/svg+xml'
                }
            };
        }

        if (extension === '.pdf') {
            return {
                type: 'foaf:Document',
                format: 'application/pdf',
                thumbnail: {
                    'id': getBaseUrl(ctx) + '/file-icon/pdf.svg',
                    format: 'image/svg+xml'
                }
            };
        }

        return {
            type: 'foaf:Document',
            format: 'text/plain',
            thumbnail: undefined
        };
    }

    static getRelativePath(objectPath: string) {
        return this.encode(objectPath.substr(this.getDemoDataPath().length + 1));
    }

    static getIIIFThumbnail(relativePath: string, ctx: Router.RouterContext) {
        return getBaseUrl(ctx) + '/iiif/image/' + relativePath + '/full/!100,100/0/default.jpg'
    }

    static getUriByObjectPath(objectPath: string, ctx: Router.RouterContext, type: string) {

        if (!type) {
            type = 'collection';
        }

        let relativePath = this.getRelativePath(objectPath);
        if (relativePath === '') {
            relativePath = 'demo';
        }

        return getBaseUrl(ctx) + '/iiif/' + type + '/' + this.encode(relativePath);
    }

    static getFileId(ctx: Router.RouterContext, objectPath: string) {
        const relativePath = this.getRelativePath(objectPath);

        return getBaseUrl(ctx) + '/file/' + relativePath;
    }

    static getDemoPath() {
        return path.join(__dirname, '..', '..');
    }

    static getCachePath() {
        return path.join(this.getDemoPath(), 'cache');
    }

    static getDemoDataPath() {
        return path.join(this.getDemoPath(), 'data');
    }

    static decodeDataPath(input?: string): string | false {
        return this.decodePath(this.getDemoDataPath(), input);
    }

    static decodeCachePath(input?: string): string | false {
        return this.decodePath(this.getCachePath(), input);
    }

    static decodePath(root: string, input?: string): string | false {

        let output = root;
        if (!input) {
            input = '';
        }

        const tmpArray =  input.replace(/__/g, ' ').split('--');
        for (let dirName of tmpArray) {
            dirName = this.basename(dirName);
            if (dirName.startsWith('.')) {
                return false;
            }

            output = path.join(output, dirName);
            if (!fs.existsSync(output)) {
                return false;
            }
        }

        return output;
    }

    static encode(input: string) {
        input = input.replace(/\\/g, '--');
        input = input.replace(/\//g, '--');
        input = input.replace(/ /g, '__');
        return input;
    }

    static addMetadata(output: any, objectPath: string) {
        const globalMetadataPath = this.getDemoPath() + '/manifest.json';
        if (fs.existsSync(globalMetadataPath)) {
            let additionalMetadata = JSON.parse(fs.readFileSync(globalMetadataPath, 'utf8'));
            output = Object.assign(output, additionalMetadata);
        }

        let metadataPath;
        if (fs.lstatSync(objectPath).isDirectory()) {
            metadataPath =  objectPath + '/manifest.json';
        } else {
            metadataPath =  objectPath + '.manifest.json';
        }

        if (fs.existsSync(metadataPath)) {
            let additionalMetadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
            output = Object.assign(output, additionalMetadata);
        }


        return output;
    }

    static getMetadata(objectPath: string) {

        let metadata = [];

        const extension = path.extname(objectPath).substr(1);

        if (Pronoms.has(extension)) {
            const pronom = Pronoms.get(extension);
            metadata.push({
                label: {en: ["File type"], de: ['Dateityp']},
                value: '<a href=\"https://www.nationalarchives.gov.uk/PRONOM/Format/proFormatSearch.aspx?status='+
                'detailReport&id=' + pronom.id + '\"> '+pronom.name+' (.' + extension + ')</a>'
            });
        }

        const stats = fs.statSync(objectPath);
        metadata.push({
            label: {en: ["File size"], de: ['Dateigrösse']},
            value: filesize(stats.size)
        });
        metadata.push({
            label: {en: ["Modification date"], de: ['Veränderungsdatum']},
            value: stats.mtime.toLocaleString()
        });

        return metadata;
    }

    static basename(path: string) {
        return path.split('/').reverse()[0];
    }

}

export default Common;

