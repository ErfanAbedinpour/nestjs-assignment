import { registerAs } from "@nestjs/config";

export default registerAs("token", () => ({
    ACCESS_TOKEN_KEY: process.env.ACCESS_TOKEN_KEY ?? "fake token",
    REFRESH_TOKEN_KEY: process.env.REFRESH_TOKEN_KEY ?? 'fake token 2',
    ACCESS_TOKEN_EXPIRE: process.env.ACCESS_EXPIRE ?? "30",
    REFRESH_TOKEN_EXPIRE: process.env.REFRESH_EXPIRE ?? "6"
}))