import { SetMetadata } from "@nestjs/common";


export const AUTH_TOKEN = "auth"

export enum AuthStrategy {
    Bearer,
    NONE
}

export const Auth = (...strategy: AuthStrategy[]) => SetMetadata(AUTH_TOKEN, strategy)
