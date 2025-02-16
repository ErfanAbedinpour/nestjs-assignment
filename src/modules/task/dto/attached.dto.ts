import { ApiProperty } from "@nestjs/swagger";

export class AttachDto {
    @ApiProperty()
    id: number
    @ApiProperty()
    src: string;
    @ApiProperty()
    createdAt: string
    @ApiProperty()
    updatedAt: string
}