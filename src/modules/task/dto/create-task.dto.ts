import { IsNotEmpty, IsString, MinLength } from "class-validator";

export class CreateTaskDto {
    @IsNotEmpty()
    @IsString()
    name: string;
    @IsNotEmpty()
    @IsString()
    @MinLength(8)
    description: string;
}
