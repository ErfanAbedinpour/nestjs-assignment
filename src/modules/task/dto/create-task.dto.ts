import { IsNotEmpty, IsString, MinLength } from "class-validator";
import { AttachDto } from "./attached.dto";
import { ApiProperty } from "@nestjs/swagger";

export class CreateTaskDto {
    @IsNotEmpty()
    @IsString()
    name: string;
    @IsNotEmpty()
    @IsString()
    @MinLength(8)
    description: string;
}

export class TaskDto {
    @ApiProperty()
    name: string;
    @ApiProperty()
    description: string;
    @ApiProperty({ type: [AttachDto], description: "files attached to task" })
    attached: AttachDto[]
}