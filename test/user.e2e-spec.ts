import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { EntityManager, SqliteDriver } from '@mikro-orm/sqlite'
import { AuthModule } from '../src/modules/auth/auth.module';
import { UserModule } from '../src/modules/user/user.module'
import { UtilModule } from '../src/modules/utils/util.module'
import { User, UserRole } from '../src/entities/user.entity';
import { ConfigModule } from '@nestjs/config';
import tokenConfig from '../src/modules/auth/config/token.config';
import { CacheModule } from '@nestjs/cache-manager';
import { JwtModule } from '@nestjs/jwt';
import { Profile } from '../src/entities/profile.entity';
import { join } from 'path';

describe('AppController (e2e)', () => {
    let server: App;
    let normalUser: User, adminUser: User;
    let userAccessToken: string, adminAccessToken: string;
    let app: INestApplication;


    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [
                AuthModule,
                UserModule,
                UtilModule,
                ConfigModule.forFeature(tokenConfig), CacheModule.register({ isGlobal: true }), JwtModule.register({}),
                MikroOrmModule.forRoot({ ensureDatabase: { create: true }, entities: [User, Profile], driver: SqliteDriver, allowGlobalContext: true, dbName: ":memory:" })
            ],
            providers: [],
        }).compile();

        app = moduleFixture.createNestApplication();
        const em = moduleFixture.get(EntityManager);
        normalUser = em.create(User, { username: "test", password: "test", email: "test@gmail.com", phone: "09117", role: UserRole.USER }, { persist: true })
        adminUser = em.create(User, { username: "admin", password: "admin", email: "admin@gmail.com", phone: "0911", role: UserRole.ADMIN }, { persist: true })

        await em.flush();
        await app.init();
        server = app.getHttpServer();

    });


    it("login", async () => {
        const userLoginRes = (await request(server)
            .post("/auth/login")
            .send({ username: normalUser.username, password: "test" })).body

        const adminLoginRes = (await request(server)
            .post("/auth/login")
            .send({ username: adminUser.username, password: "admin" })).body

        userAccessToken = userLoginRes.accessToken
        adminAccessToken = adminLoginRes.accessToken
    })

    describe("/user/profile/:filename (GET)", () => {
        it("should be throw unAuthorized for header empty", () => {
            return request(server)
                .get("/user/profile/filename")
                .expect(HttpStatus.UNAUTHORIZED)
                .then(res => {
                    const errMsg = res.body.message;
                    expect(errMsg).toStrictEqual("please enter bearer Header")
                })
        })

        it("shoule be throw BadRequest for invalid access", () => {
            return request(server)
                .get("/user/profile/filename")
                .set('Authorization', `Bearer ${userAccessToken}`)
                .expect(HttpStatus.BAD_REQUEST)
                .then(res => {
                    const errMsg = res.body.message;
                    expect(errMsg).toStrictEqual("you have not access to this profile")
                })
        })


        it("should be throw not found", () => {
            return request(server)
                .get("/user/profile/filename")
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .expect(HttpStatus.NOT_FOUND)
                .then(res => {
                    const errMsg = res.body.message;
                    expect(errMsg).toStrictEqual("profile not found")
                })
        })

    })

    describe("/user/:id (PATCH)", () => {
        it("should be throw BadRequest for update username ", () => {
            return request(server)
                .patch(`/user`)
                .set('Authorization', `Bearer ${userAccessToken}`)
                .send({ username: "something" })
                .expect(HttpStatus.BAD_REQUEST)
                .then(res => {
                    const errMsg = res.body.message;
                    expect(errMsg).toStrictEqual("cannot change your own username")
                })
        })

        it("should be updated by admin", () => {
            return request(server)
                .patch(`/admin/user/${normalUser.id}`)
                .set('Authorization', `Bearer ${adminAccessToken}`)
                .send({ username: "something" })
                .expect(HttpStatus.OK)
                .then(res => {
                    expect(res.body.username).toStrictEqual('something')
                })
        })

        it("should be updated email by user", () => {
            return request(server)
                .patch(`/user/`)
                .set('Authorization', `Bearer ${userAccessToken}`)
                .send({ email: "newMail@gmail.com" })
                .expect(HttpStatus.OK)
                .then(res => {
                    expect(res.body.email).toStrictEqual('newMail@gmail.com')
                })
        })

    })

    afterAll(async () => {
        await app.close();
    })
});

