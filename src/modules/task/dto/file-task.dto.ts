import { Type } from "class-transformer";
import { IsIn, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class FindAllTaskQuery {
    @Min(1)
    @Type(() => Number)
    @IsOptional()
    page: number

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    limit: number

    @IsOptional()
    @IsString()
    name: string

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @IsIn([1, 0], { message: "sort must be 1 or 0" })
    sort: 1 | 0
}