import { IsJWT, IsNotEmpty } from "class-validator";

export class TokenDto {
    @IsJWT()
    @IsNotEmpty()
    refreshToken: string
}