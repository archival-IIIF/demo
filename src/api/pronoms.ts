interface IData {
    [key: string]: {id: number, name: string}
}

const data: IData = {
    mp3: {
        id: 687,
        name: 'MPEG 1/2 Audio Layer 3'
    },
    jpg: {
        id: 667,
        name: 'JPEG File Interchange Format'
    },
    txt: {
        id: 163,
        name: 'Plain Text File'
    },
    mp4: {
        id: 924,
        name: 'MPEG-4 Media File'
    }
};

class Pronoms {
    static has(extension: string) {
        return data.hasOwnProperty(extension);
    }

    static get(extension: string) {
        if (!data.hasOwnProperty(extension)) {
            return null;
        }

        return data[extension];
    }
}

export default Pronoms
