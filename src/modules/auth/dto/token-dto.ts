import { ApiProperty } from "@nestjs/swagger";
import { IsJWT, IsNotEmpty } from "class-validator";

export class TokenDto {
    @IsJWT()
    @ApiProperty()
    @IsNotEmpty()
    refreshToken: string
}