import { AuthModule } from "../moduels/auth/auth.module";
import { TaskModule } from "../moduels/task/task.module";
import { UserModule } from "../moduels/user/user.module";


export const internalImports = [AuthModule, UserModule, TaskModule]