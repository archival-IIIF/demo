import dotenv from 'dotenv';

dotenv.config();

export function getPort(): number {
    const port = parseInt(process.env.PORT ?? '3333');
    return (port >= 0) ? port : 3333;
}
