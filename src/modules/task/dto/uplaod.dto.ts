import { ApiProperty } from "@nestjs/swagger";

export class UploadDto {
    @ApiProperty({ type: 'string', description: 'Name of the upload', example: 'Project Files' })
    name: string;

    @ApiProperty({ type: 'string', description: 'Description of the upload', example: 'This is an important document' })
    description: string;

    @ApiProperty({
        type: 'string',
        format: 'binary',
        description: 'Attached images (Max: 4)',
        isArray: true,
    })
    attached: Express.Multer.File[];
}