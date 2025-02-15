import { registerAs } from "@nestjs/config";

export default registerAs('database', () => ({
    DB_PASSWORD: process.env.DB_PORT ?? 3306,
    DB_USER: process.env.DB_USER ?? "root",
    DB_HOST: process.env.DB_HOST ?? 'localhost',
    DB_NAME: process.env.DB_NAME ?? "adin-soft"
}))