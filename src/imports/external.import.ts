import { MikroOrmModule } from "@mikro-orm/nestjs";
import { ConfigModule } from "@nestjs/config";
import config from '../mikro-orm.config'

export const externalImports = [
    ConfigModule.forRoot({
        envFilePath: `${process.cwd()}/.env`,
        isGlobal: true,
        cache: true,
    }),
    MikroOrmModule.forRoot(config)
]