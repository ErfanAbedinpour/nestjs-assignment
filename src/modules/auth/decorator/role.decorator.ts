import { SetMetadata } from "@nestjs/common";
import { UserRole } from "../../../entities/user.entity";


export const ROLE_TOKEN = "role"



export const Role = (role: UserRole[]) => SetMetadata(ROLE_TOKEN, role)

