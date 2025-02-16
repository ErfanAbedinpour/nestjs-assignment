import { Type } from "class-transformer";
import { IsIn, IsInt, IsNumber, IsOptional, Min } from "class-validator";

export class PaginationDto {
    @Type(() => Number)
    @IsNumber()
    @IsOptional()
    @Min(1)
    page: string
}