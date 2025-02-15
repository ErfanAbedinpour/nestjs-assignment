import { Inject, Injectable } from "@nestjs/common";
import { RefreshTokenPayload, TokenService } from "./token.service";
import { JwtService } from "@nestjs/jwt";
import tokenConfig from "../config/token.config";
import { ConfigType } from "@nestjs/config";

@Injectable()
export class RefreshTokenService extends TokenService {
    constructor(private readonly jwt: JwtService,
        @Inject(tokenConfig.KEY)
        private readonly configuratoin: ConfigType<typeof tokenConfig>,
    ) { super() }

    sign(payload: RefreshTokenPayload): Promise<string> {
        return this.jwt.signAsync(payload, {
            secret: this.configuratoin.REFRESH_TOKEN_KEY,
            expiresIn: this.configuratoin.REFRESH_TOKEN_EXPIRE + "min"
        })

    }
    verify(token: string): Promise<RefreshTokenPayload> {
        return this.jwt.verifyAsync<RefreshTokenPayload>(token, {
            secret: this.configuratoin.REFRESH_TOKEN_KEY,
        })
    }
}