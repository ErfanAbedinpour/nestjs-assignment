import { UserRole } from "../../../entities/user.entity";
import { CreateUserDto } from "../../auth/dto/create-auth.dto";
import { ProfileDto } from "./profiles-dto";
import { ApiProperty } from "@nestjs/swagger";

export class UserDto extends CreateUserDto {
    @ApiProperty({ description: "user Role", enum: UserRole })
    role: UserRole
    @ApiProperty({ description: "user profiles", type: [ProfileDto] })
    profiles: ProfileDto[]

}