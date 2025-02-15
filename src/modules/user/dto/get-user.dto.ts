import { Type } from "class-transformer";
import { IsIn, IsInt, IsNumber, IsOptional, Min } from "class-validator";

export class GetUserDto {
    @Type(() => Number)
    @IsNumber()
    @IsOptional()
    @Min(1)
    page: string
}