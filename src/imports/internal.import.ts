import { AuthModule } from "../modules/auth/auth.module";
import { TaskModule } from "../modules/task/task.module";
import { UserModule } from "../modules/user/user.module";
import { UtilModule } from "../modules/utils/util.module";

export const internalImports = [AuthModule, UserModule, TaskModule, UtilModule]