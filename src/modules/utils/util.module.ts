import { Global, Module } from "@nestjs/common";
import { UtilService } from "./util.service";

@Global()
@Module({
    exports: [UtilService],
    providers: [UtilService]
})
export class UtilModule { }