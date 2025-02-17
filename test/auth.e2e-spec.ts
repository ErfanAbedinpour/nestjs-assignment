import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { EntityManager, SqliteDriver } from '@mikro-orm/sqlite'
import { AuthModule } from '../src/modules/auth/auth.module';
import { User, UserRole } from '../src/entities/user.entity';
import { CreateUserDto } from '../src/modules/auth/dto/create-auth.dto';
import { ConfigModule } from '@nestjs/config';
import tokenConfig from '../src/modules/auth/config/token.config';
import { CacheModule } from '@nestjs/cache-manager';
import { JwtModule } from '@nestjs/jwt';
import { ErrorMessages } from '../src/responses/error.response';

describe('AppController (e2e)', () => {
    let server: App;
    let user: User;
    let app: INestApplication

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [
                AuthModule,
                ConfigModule.forFeature(tokenConfig), CacheModule.register({ isGlobal: true }), JwtModule.register({}),
                MikroOrmModule.forRoot({ ensureDatabase: { create: true }, entities: [User], driver: SqliteDriver, allowGlobalContext: true, dbName: ":memory:" })
            ],
            providers: [],
        }).compile();

        app = moduleFixture.createNestApplication();
        const em = moduleFixture.get(EntityManager);
        user = em.create(User, { username: "admin", password: "admin", email: "admin@gmail.com", phone: "0911", role: UserRole.ADMIN }, { persist: true })
        await em.flush();
        await app.init();
        server = app.getHttpServer();

    });

    describe("/auth/register", () => {
        it('should be created successfully', () => {
            const reqBody: CreateUserDto = {
                email: "test@gmail.com",
                password: "1234",
                phone: "hello",
                username: "salam"
            }

            return request(server)
                .post('/auth/register')
                .send(reqBody)
                .expect(HttpStatus.CREATED)
                .expect({ msg: "user registered successfully" });
        });


        it("should be throw Conflict Error", () => {
            const reqBody: CreateUserDto = {
                email: user.email,
                password: user.password,
                phone: user.phone,
                username: user.username
            }

            return request(server)
                .post('/auth/register')
                .send(reqBody)
                .expect(HttpStatus.CONFLICT)
        })
    })


    describe("/auth/login (POST)", () => {
        it("login successfully", () => {
            return request(server)
                .post('/auth/login')
                .send({ username: user.username, password: 'admin' })
                .expect(HttpStatus.OK)
                .then(res => {
                    expect(res.body).toHaveProperty("accessToken")
                    expect(res.body).toHaveProperty("refreshToken")
                })
        })

        it("should be thorw BadRequest for invalid credential", () => {
            return request(server)
                .post('/auth/login')
                .send({ username: "test", password: '1234' })
                .expect(HttpStatus.BAD_REQUEST)
                .then(res => {
                    expect(res.body.message).toStrictEqual(ErrorMessages.INVALID_CREDENTIAL)
                })
        })
    })


    describe("/auth/token (POST)", () => {
        it("should be thorw unAuth exception", () => {
            return request(server)
                .post('/auth/token')
                .send({ refreshToken: "fake jwt" })
                .expect(HttpStatus.UNAUTHORIZED)
        })

        it("generate new Tokens", async () => {
            const { refreshToken } = (await request(server).post("/auth/login").send({ username: user.username, password: "admin" })).body;
            return request(server)
                .post('/auth/token')
                .send({ refreshToken })
                .expect(HttpStatus.OK)
                .then(res => {
                    expect(res.body).toHaveProperty("newAccessToken")
                    expect(res.body).toHaveProperty("newRefreshToken")
                })
        })
    })


    afterAll(async () => {
        await app.close();
    })
});
