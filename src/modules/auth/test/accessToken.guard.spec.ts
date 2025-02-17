import { Test } from "@nestjs/testing"
import { AccessTokenService } from "../tokenService/accessToken.service"
import { RefreshTokenService } from "../tokenService/refreshToken.service"
import { JwtModule } from "@nestjs/jwt"
import { AccessTokenGuard } from "../guard/accessToken.guard"
import { ConfigModule } from "@nestjs/config"
import tokenConfig from "../config/token.config"
import { UserRole } from "../../../entities/user.entity"
import { ExecutionContext, UnauthorizedException } from "@nestjs/common"



describe("AccessToken Guard", () => {

    let validToken;
    let service: AccessTokenService;
    let guard: AccessTokenGuard;
    const mockExecContext = {
        switchToHttp: jest.fn()
    }

    beforeAll(async () => {
        const module = await Test.createTestingModule({
            imports: [JwtModule.register({ secret: "test" }), ConfigModule.forFeature(tokenConfig)],
            providers: [
                AccessTokenService,
                AccessTokenGuard
            ]
        }).compile()

        guard = module.get<AccessTokenGuard>(AccessTokenGuard);
        service = module.get<AccessTokenService>(AccessTokenService);
        validToken = await service.sign({ id: 1, role: UserRole.USER, username: "testUserName" })
    })


    it("should be defiend", () => {
        expect(guard).toBeDefined()
        expect(service).toBeDefined()
    })


    it("should be throw unAuthorized for invaid header", () => {

        jest.spyOn(mockExecContext, 'switchToHttp').mockReturnValue({
            getRequest: () => ({ headers: { authorization: validToken } })
        })

        const resPromise = guard.canActivate(mockExecContext as unknown as ExecutionContext);
        expect(resPromise).rejects.toThrow(UnauthorizedException)
        expect(resPromise).rejects.toThrow("please enter bearer Header")
    })


    it("should be throw unAuth For invaid Token", () => {
        jest.spyOn(mockExecContext, 'switchToHttp').mockReturnValue({
            getRequest: () => ({ headers: { authorization: `bearer fakeToken` } })
        })

        const resPromise = guard.canActivate(mockExecContext as unknown as ExecutionContext);
        expect(resPromise).rejects.toThrow(UnauthorizedException)
        expect(resPromise).rejects.toThrow("token invalid or expired.")
    })


    it("should be returned true for valid and fetch user", async () => {

        jest.spyOn(mockExecContext, 'switchToHttp').mockReturnValue({
            getRequest: () => ({ headers: { authorization: `bearer ${validToken}` } })
        })

        const resPromise = guard.canActivate(mockExecContext as unknown as ExecutionContext);
        expect(resPromise).resolves.toBeTruthy()
        expect(resPromise).resolves.toStrictEqual(true)
    })
})