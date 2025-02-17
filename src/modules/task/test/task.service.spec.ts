
import { Test } from "@nestjs/testing"
import { TaskService } from "../task.service";
import { EntityManager, SqliteDriver } from '@mikro-orm/sqlite'
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Task } from "../../../entities/task.entity";
import { UtilService } from "../../utils/util.service";
import { User, UserRole } from "../../../entities/user.entity";
import { Attached } from "../../../entities/attached.entity";
import { NotFoundException } from "@nestjs/common";
import { ErrorMessages } from "../../../responses/error.response";

describe("AccessToken Guard", () => {

    let service: TaskService;
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
                TaskService
            ]
        }).compile()

        service = module.get<TaskService>(TaskService);
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


    describe("create Task", () => {
        it("should be created task ", () => {
            const buf = Buffer.from("helloWorold")
            let multerFakeFile = [{
                buffer: buf, mimetype: "image/jpeg",
                originalname: "test.jpeg",
            }]

            const resPromise = service.create({
                description: "this is a test description",
                name: "this is a name for test",
            }, multerFakeFile as unknown as Express.Multer.File[], regularUser.id)

            expect(resPromise).resolves.toBeTruthy()
            expect(resPromise).resolves.toBeInstanceOf(Task)
        })
    })

    describe("remove task", () => {
        it("should be throw not found for task not exsist", () => {
            const delPromise = service.remove(122, regularUser.id);
            expect(delPromise).rejects.toThrow(NotFoundException)
            expect(delPromise).rejects.toThrow(ErrorMessages.TASK_NOTFOUND)
        })

        it("should be remvoe task", () => {
            const delPromise = service.remove(1, regularUser.id);
            expect(delPromise).resolves.toBeTruthy()
            expect(delPromise).resolves.toBeInstanceOf(Task)
        })
    })

    describe("findAll Task", () => {
        beforeAll(async () => {
            // insert 20 task
            for (let i = 1; i < 20; i++) {
                em.create(Task, {
                    description: `test${i}`,
                    name: `test${i}`,
                    // if number is odd user is normal else admin
                    user: i % 2 === 0 ? adminUser.id : regularUser.id,
                }, { persist: true })
            }

            await em.flush();
        })

        it("shold be returned by limit 5", async () => {
            const tasks = await service.findAll({ page: 1, limit: 5 }, regularUser.id)

            expect(tasks.tasks.length).toStrictEqual(5)
        })
        it("should be retrun by page ", async () => {
            const tasks = await service.findAll({ page: 2, limit: 5 }, regularUser.id)

            expect(tasks.tasks.length).toStrictEqual(5)
            expect(tasks.meta.page).toStrictEqual(2)
        })

        it("should be returned by filter ", async () => {
            const tasks = await service.findAll(
                { page: 1, limit: 100 },
                regularUser.id,
                undefined,
                { name: "11" }
            )

            expect(tasks.tasks.length).toStrictEqual(1)
            expect(tasks.tasks[0].name).toStrictEqual("test11")
        })
    })

    describe("findOne", () => {
        it("should be thorw not found", () => {
            const findTaskPromise = service.findOne(122, regularUser.id);
            expect(findTaskPromise).rejects.toThrow(NotFoundException)
            expect(findTaskPromise).rejects.toThrow(ErrorMessages.TASK_NOTFOUND)
        })


        it("should be returnd task ", () => {
            const findTaskPromise = service.findOne(2, regularUser.id);
            expect(findTaskPromise).resolves.toBeTruthy()
            expect(findTaskPromise).resolves.toBeInstanceOf(Task)
        })
    })

    describe("update", () => {
        it("should be updated successfully", async () => {
            const updatePromise = service.update(2, regularUser.id, {
                description: "this is new description",
                name: "this is new name"
            })
            expect(updatePromise).resolves.toBeTruthy()
            expect(updatePromise).resolves.toBeInstanceOf(Task)
            // find and check is it updated or not
            const newTask = await service.findOne(2, regularUser.id)
            expect(newTask!.name).toStrictEqual("this is new name")
            expect(newTask!.description).toStrictEqual("this is new description")
        })
    })


})