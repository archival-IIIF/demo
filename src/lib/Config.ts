import dotenv from 'dotenv';

dotenv.config();

export function getPort(): number {
    const port = parseInt(process.env.PORT ?? '3334', 10);
    return (port >= 0) ? port : 3334;
}
