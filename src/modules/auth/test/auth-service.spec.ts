import { AuthService } from "../auth.service"
import { Test } from '@nestjs/testing'
import { JwtModule } from "@nestjs/jwt"
import { MikroOrmModule } from "@mikro-orm/nestjs"
import { User, UserRole } from "../../../entities/user.entity"
import { EntityManager, SqliteDriver } from '@mikro-orm/sqlite'
import { UserTokenService } from "../tokenService/userToken.service"
import { AccessTokenService } from "../tokenService/accessToken.service"
import { RefreshTokenService } from "../tokenService/refreshToken.service"
import { HashService } from "../hashService/hash.service"
import { ArgonService } from "../hashService/argon.service"
import { ConfigModule } from "@nestjs/config"
import { CacheModule } from "@nestjs/cache-manager"
import tokenConfig from "../config/token.config"
import { BadRequestException, ConflictException, UnauthorizedException } from "@nestjs/common"
import { ErrorMessages } from "../../../responses/error.response"

describe("Auth Service", () => {
    let service: AuthService
    let em: EntityManager
    let fakeUser: User;

    beforeAll(async () => {
        const module = await Test.createTestingModule({
            imports: [ConfigModule.forFeature(tokenConfig), CacheModule.register(), JwtModule.register({}),
            MikroOrmModule.forRoot({ ensureDatabase: { create: true }, entities: [User], driver: SqliteDriver, allowGlobalContext: true, dbName: ":memory:" })],
            providers: [
                AuthService,
                UserTokenService,
                AccessTokenService,
                RefreshTokenService,
                {
                    provide: HashService,
                    useClass: ArgonService
                },
            ]
        }).compile()

        service = module.get<AuthService>(AuthService)
        em = module.get<EntityManager>(EntityManager)

        fakeUser = em.create(User, { email: "testmail@gmail.com", password: "testpass", phone: "0911888888", role: UserRole.USER, username: "testusername" })
        await em.persistAndFlush(fakeUser)
    })

    it("expected instance", () => {
        expect(AuthService).toBeDefined()
        expect(em).toBeDefined()
        expect(fakeUser).toBeDefined()
    })


    describe("register user", () => {
        it("should be throw ConflictException For invalid inofrmation", () => {
            const user = {
                email: fakeUser.email,
                password: 'test',
                phone: fakeUser.phone,
                username: fakeUser.username
            }

            const resPromise = service.create(user)


            expect(resPromise).rejects.toThrow(ConflictException)
            expect(resPromise).rejects.toThrow(ErrorMessages.INVALID_INFORMATION)
        })

        it("should be register successfully", () => {
            const user = {
                email: "testFakeMail",
                password: 'test',
                phone: "081234123",
                username: 'TestFakeUserName'
            }

            const resPromise = service.create(user)

            expect(resPromise).resolves.toBeTruthy()
            expect(resPromise).resolves.toStrictEqual({ msg: "user registered successfully" })
        })
    })

    describe("login User", () => {
        let validRefreshToken;
        it("should be thorw BadRequest for invalid user", () => {
            const resPromise = service.login({
                username: "wrong username",
                password: "wrong pass"
            })

            expect(resPromise).rejects.toThrow(BadRequestException)
            expect(resPromise).rejects.toThrow(ErrorMessages.INVALID_CREDENTIAL)
        })

        it("login successfully", async () => {
            const resPromise = service.login({
                password: "testpass",
                username: fakeUser.username
            })

            expect(resPromise).resolves.toBeTruthy()
            expect(resPromise).resolves.toHaveProperty("accessToken")

            expect(resPromise).resolves.toHaveProperty("refreshToken")
            validRefreshToken = (await resPromise).refreshToken
        })

        it("should be throw unAuth Error for invalid token", () => {
            const resPromise = service.token({ refreshToken: "some fake token" });

            expect(resPromise).rejects.toThrow(UnauthorizedException)
            expect(resPromise).rejects.toThrow(ErrorMessages.INVALID_TOKEN)
        })


        it("should be returned new tokens", () => {
            const resPromise = service.token({ refreshToken: validRefreshToken });

            expect(resPromise).resolves.toBeTruthy()
            expect(resPromise).resolves.toHaveProperty('newAccessToken')
            expect(resPromise).resolves.toHaveProperty('newRefreshToken')

        })
    })





})