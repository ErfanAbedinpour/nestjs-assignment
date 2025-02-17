import { defineConfig } from "@mikro-orm/core";
import { Migrator } from "@mikro-orm/migrations";
import { MySqlDriver } from "@mikro-orm/mysql";
import { SeedManager } from "@mikro-orm/seeder";
import { Logger } from "@nestjs/common";
import { DatabaseSeeder } from "./seeder/seed";
import 'dotenv/config'
import { Attached } from "./entities/attached.entity";
import { User } from "./entities/user.entity";
import { Profile } from "./entities/profile.entity";
import { Task } from "./entities/task.entity";


const logger = new Logger("MikroOrm")

const DB_URI = `mysql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}`

console.log('db uri is', DB_URI)

export default defineConfig({
    clientUrl: DB_URI,
    entities: ['./dist/entities/*.entity.js'],
    entitiesTs: [Attached, User, Profile, Task],
    port: +process.env.DB_PORT,
    extensions: [Migrator, SeedManager],
    dbName: process.env.DB_NAME,
    debug: true,
    baseDir: process.cwd(),
    driver: MySqlDriver,
    allowGlobalContext: true,
    logger: (msg) => logger.debug(msg),
    metadataCache: { enabled: true },
    migrations: {
        tableName: 'migrations',
        path: './dist/migrations',
        pathTs: "./src/migrations",
        glob: '!(*.d).{js,ts}',
        transactional: true,
        disableForeignKeys: true,
        allOrNothing: true,
        dropTables: true,
        emit: 'ts',
    },
    seeder: {
        path: "./src/seeder",
        defaultSeeder: DatabaseSeeder.name,
        glob: '!(*.d).{js,ts}',
        emit: 'ts',
    },
});