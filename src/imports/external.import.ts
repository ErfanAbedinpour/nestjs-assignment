import { MikroOrmModule } from "@mikro-orm/nestjs";
import { ConfigModule } from "@nestjs/config";
import config from '../mikro-orm.config'
import { CacheModule } from "@nestjs/cache-manager";

export const externalImports = [
    ConfigModule.forRoot({
        envFilePath: `${process.cwd()}/.env`,
        isGlobal: true,
        cache: true,
    }),
    MikroOrmModule.forRoot(config),
    CacheModule.register({ isGlobal: true })
]