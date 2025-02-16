import { ApiProperty } from "@nestjs/swagger";

export class MetaDto {
    @ApiProperty({ description: "count of All Row" })
    countAll: number
    @ApiProperty({ description: "count of row fetched" })
    count: number

    @ApiProperty({ description: "number of all pages can be fetched" })
    allPages: number
}