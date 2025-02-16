import { Type } from "class-transformer";
import { IsIn, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class findAllQuery {
    @Type(() => Number)
    @IsNumber()
    @IsOptional()
    @Min(1)
    page: string

    @IsOptional()
    @Type(() => Number)
    @IsIn([1, 0], { message: "value for sort must be 0 or 1" })
    @IsNumber()
    sort: 1 | 0

    @IsOptional()
    @IsString()
    email: string

    @IsOptional()
    username: string
}