import { Inject, Injectable } from "@nestjs/common";
import { UserRole } from "../../../entities/user.entity";
import { AccessTokenService } from "./accessToken.service";
import { RefreshTokenService } from "./refreshToken.service";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";

@Injectable()
export class UserTokenService {
    constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache, private readonly accessTokenService: AccessTokenService, private readonly refreshTokenService: RefreshTokenService) { }


    async genTokens(user: { username: string, id: number, role: UserRole }) {

        const tokenId = crypto.randomUUID()

        const [accessToken, refreshToken] = await Promise.all([
            this.accessTokenService.sign({ id: user.id, role: user.role, username: user.username }),
            this.refreshTokenService.sign({ id: user.id, tokenId: tokenId })
        ])
        await this.insert(user.id, tokenId, refreshToken)
        return { accessToken, refreshToken }
    }

    async insert(userId: number, tokenId: string, token: string): Promise<void> {
        this.cacheManager.set(this.genKeys(userId, tokenId), token, 30 * 60);
    }

    async isValid(userId: number, tokenId: string, token: string): Promise<boolean> {
        const userToken = await this.cacheManager.get(this.genKeys(userId, tokenId))
        return userToken === token;
    }

    invalidate(userId: number, tokenId: string) {
        return this.cacheManager.del(this.genKeys(userId, tokenId))
    }

    private genKeys(userId: number, tokenId: string) {
        return `user:${userId}:${tokenId}`
    }
}