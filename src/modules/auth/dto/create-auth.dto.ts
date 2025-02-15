import { IsEmail, IsNotEmpty, IsString, IsStrongPassword, MaxLength, MinLength } from "class-validator";

export class CreateAuthDto {
    @IsNotEmpty()
    @MinLength(3)
    @IsString()
    username!: string;

    @IsEmail()
    @IsNotEmpty()
    email!: string

    @IsStrongPassword({ minLength: 8, minSymbols: 0 })
    password!: string

    @MinLength(11)
    @IsString()
    phone!: string
}
