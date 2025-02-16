import { ApiProperty } from "@nestjs/swagger";

export class HttpErrorDto {
    @ApiProperty({ description: "error Message" })
    "message": string;
    @ApiProperty({ description: "typeof Error" })
    "error": string
    @ApiProperty({ description: "http Status Code" })
    "statusCode": number
}