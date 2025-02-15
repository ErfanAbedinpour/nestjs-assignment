import { Inject, Injectable, OnApplicationBootstrap } from "@nestjs/common";
import { AccessTokenPayload, TokenService } from "./token.service";
import { JwtService } from "@nestjs/jwt";
import { ConfigType } from "@nestjs/config";
import tokenConfig from "../config/token.config";

@Injectable()
export class AccessTokenService extends TokenService {

    constructor(
        private readonly jwt: JwtService,
        @Inject(tokenConfig.KEY)
        private readonly configuratoin: ConfigType<typeof tokenConfig>,
    ) {
        super()
    }
    sign(payload: AccessTokenPayload): Promise<string> {
        return this.jwt.signAsync(payload, {
            secret: this.configuratoin.ACCESS_TOKEN_KEY,
            expiresIn: this.configuratoin.ACCESS_TOKEN_EXPIRE + "min"
        })
    }

    verify(token: string): Promise<AccessTokenPayload> {
        return this.jwt.verifyAsync<AccessTokenPayload>(token, {
            secret: this.configuratoin.ACCESS_TOKEN_KEY,
        })
    }

}