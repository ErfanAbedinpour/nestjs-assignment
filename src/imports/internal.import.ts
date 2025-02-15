import { AuthModule } from "../modules/auth/auth.module";
import { UserModule } from "../modules/user/user.module";

export const internalImports = [AuthModule, UserModule]