import { ApiProperty } from "@nestjs/swagger"

export class ProfileDto {
    @ApiProperty({ description: "profile id" })
    "id": number;
    @ApiProperty({ description: "profile created date" })
    "createdAt": string
    @ApiProperty({ description: "profile updated date" })
    "updatedAt": string
    @ApiProperty({ description: "filename" })
    "src": string
    @ApiProperty({ description: "profile owner" })
    "user": number
}