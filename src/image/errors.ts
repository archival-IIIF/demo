class MyRequestError extends Error {
    constructor(...params: any) {
        super(params);

        if (Error.captureStackTrace)
            Error.captureStackTrace(this, MyRequestError);
    }
}

class MyNotImplementedError extends Error {
    constructor(...params: any) {
        super(params);

        if (Error.captureStackTrace)
            Error.captureStackTrace(this, MyNotImplementedError);
    }
}

module.exports = {MyRequestError, MyNotImplementedError};
