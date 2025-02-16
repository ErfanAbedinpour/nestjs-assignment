import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class LoginDto {
    @IsNotEmpty()
    @ApiProperty()
    @IsString()
    username: string

    @IsNotEmpty()
    @ApiProperty()
    @IsString()
    password: string
}