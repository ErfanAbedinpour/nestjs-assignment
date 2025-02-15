import { defineConfig } from "@mikro-orm/core";
import { Migrator } from "@mikro-orm/migrations";
import { MySqlDriver } from "@mikro-orm/mysql";
import { Logger } from "@nestjs/common";


const logger = new Logger("MikroOrm")

const DB_URI = `mysql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}`

export default defineConfig({
    clientUrl: DB_URI,
    entities: ['./dist/entities/*.entity.js'],
    port: +process.env.DB_PORT,
    extensions: [Migrator],
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
});