import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, IsStrongPassword, MaxLength, MinLength } from "class-validator";

export class CreateUserDto {
    @ApiProperty()
    @IsNotEmpty()
    @MinLength(3)
    @IsString()
    username!: string;

    @IsEmail()
    @ApiProperty()
    @IsNotEmpty()
    email!: string

    @IsStrongPassword({ minLength: 8, minSymbols: 0 })
    @ApiProperty()
    password!: string

    @MinLength(11)
    @ApiProperty()
    @IsString()
    phone!: string
}
