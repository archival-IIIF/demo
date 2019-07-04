class HttpError extends Error {

    public status: number;

    constructor(status: number, ...params: any) {
        super(...params);

        if (Error.captureStackTrace)
            Error.captureStackTrace(this, HttpError);

        this.status = status;
    }
}

export default HttpError;
