if (process.env.NODE_ENV !== 'production')
    require('dotenv').load();

module.exports = {

    port: (() => {
        const port = parseInt(process.env.PORT);
        return (port >= 0) ? port : 3333;
    })()
};
