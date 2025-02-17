
import { Test } from "@nestjs/testing"
import { EntityManager, SqliteDriver } from '@mikro-orm/sqlite'
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Task } from "../../../entities/task.entity";
import { UtilService } from "../../utils/util.service";
import { User, UserRole } from "../../../entities/user.entity";
import { Attached } from "../../../entities/attached.entity";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { ErrorMessages } from "../../../responses/error.response";
import { UserService } from "../user.service";

describe("AccessToken Guard", () => {

    let service: UserService;
    let em: EntityManager;
    let regularUser: User;
    let adminUser: User;


    beforeAll(async () => {
        const module = await Test.createTestingModule({
            imports: [MikroOrmModule.forRoot({
                ensureDatabase: { create: true }, entities: [Task, User, Attached],
                driver: SqliteDriver, dbName: ":memory:",
                allowGlobalContext: true,
            })],
            providers: [
                UtilService,
                UserService
            ]
        }).compile()

        service = module.get<UserService>(UserService);
        em = module.get<EntityManager>(EntityManager).fork();
        // create Normal User
        regularUser = em.create(User,
            {
                email: "test@gmail.com",
                password: "test",
                phone: "09117923432",
                role: UserRole.USER,
                username: 'user1'
            }, { persist: true })
        //create Admin User
        adminUser = em.create(User,
            {
                email: "test1@gmail.com",
                password: "test1",
                phone: "091179234322",
                role: UserRole.ADMIN,
                username: 'user2'
            }, { persist: true })

        await em.flush();
    })


    it("should be defiend", () => {
        expect(service).toBeDefined()
        expect(em).toBeDefined()
    })

    describe("Update User", () => {

        it("should be throw NotFound for invaid userId", () => {
            const updatePromise = service.update(12, {
                username: "this is new username"
            }, regularUser.role)

            expect(updatePromise).rejects.toThrow(NotFoundException)
            expect(updatePromise).rejects.toThrow(ErrorMessages.USER_NOTFOUND)

        })

        it("should be throw BadRequest for Update username by Normal User", () => {
            const updatePromise = service.update(regularUser.id, {
                username: "this is new username"
            }, regularUser.role)

            expect(updatePromise).rejects.toThrow(BadRequestException)
            expect(updatePromise).rejects.toThrow("cannot change your own username")
        })


        it("should be updated successfully by normal User", async () => {
            const updatePromise = service.update(regularUser.id, {
                email: "newMail@gmail.com"
            }, regularUser.role)

            expect(updatePromise).resolves.toBeTruthy()
            expect(updatePromise).resolves.toBeInstanceOf(User)
            const user = await service.findOne(regularUser.id);

            expect(user.email).toStrictEqual("newMail@gmail.com");
        })

        it("should be updated user username by admin", async () => {
            const updatePromise = service.update(regularUser.id, {
                username: "newUsername"
            }, adminUser.role)

            expect(updatePromise).resolves.toBeTruthy()
            expect(updatePromise).resolves.toBeInstanceOf(User)
            const user = await service.findOne(regularUser.id);

            expect(user.username).toStrictEqual("newUsername");
        })
    })


    describe("remove and update", () => {
        let user: User;
        beforeAll(async () => {
            user = em.create(User, { email: "", username: "", password: "", phone: "", role: UserRole.USER })
            await em.persistAndFlush(user)
        })

        it("should be remove user", () => {
            const promise = service.remove(user.id);
            expect(promise).resolves.toBeTruthy()
            expect(promise).resolves.toHaveProperty("msg")
            expect(promise).resolves.toHaveProperty("user")
        })

        it("should be updated user role", async () => {
            const promise = service.changeRole({ role: UserRole.ADMIN }, user.id)
            expect(promise).resolves.toBeTruthy()
            expect(promise).resolves.toBeInstanceOf(User)

            const newUser = await service.findOne(user.id);

            expect(newUser.role).toStrictEqual("admin");
        })
    })



})