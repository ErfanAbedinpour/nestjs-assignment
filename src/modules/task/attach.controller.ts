import { Controller, Delete, FileTypeValidator, Get, HttpStatus, MaxFileSizeValidator, Param, ParseFilePipe, ParseFilePipeBuilder, ParseIntPipe, Post, Res, UploadedFile, UseInterceptors } from "@nestjs/common";
import { TaskService } from "./task.service";
import { getUser } from "../auth/decorator/getUser.decorator";
import { Response } from "express";
import { FileInterceptor } from "@nestjs/platform-express";
import { Auth, AuthStrategy } from "../auth/decorator/auth.decorator";
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiNotFoundResponse, ApiOkResponse, ApiParam, ApiUnauthorizedResponse, ApiUnprocessableEntityResponse } from "@nestjs/swagger";
import { HttpErrorDto } from "../../dto/error.dto";

@Controller("task/:id/attach")
@Auth(AuthStrategy.Bearer)
@ApiUnauthorizedResponse({ description: "header is empty or token invalid", type: HttpErrorDto })
@ApiBearerAuth()
export class AttachController {

    constructor(private readonly taskService: TaskService) { }

    @Delete(":filename")
    @ApiParam({ name: "filename" })
    @ApiOkResponse({ description: "attach file remove successfully", schema: { type: "object", properties: { msg: { type: "string" } } } })
    @ApiNotFoundResponse({ description: "attach file not found", type: HttpErrorDto })
    removeAttachFile(@Param("id", ParseIntPipe) id: number, @Param("filename") filename: string, @getUser('id') userId: number) {
        return this.taskService.removeAttach(id, userId, filename)
    }

    @Get(":filename")
    @ApiParam({ name: "filename" })
    @ApiOkResponse({ description: "file downloaded successfully" })
    @ApiNotFoundResponse({ description: "attach file not found", type: HttpErrorDto })
    async getAttach(@Param("id", ParseIntPipe) id: number, @Param('filename') fileName: string, @getUser('id') userId: number, @Res() res: Response) {
        try {

            const { stream, filename } = await this.taskService.getAttach(id, userId, fileName)

            res.setHeader("Content-Disposition", `attachmend; filename=${filename}`)
            stream.pipe(res)
        } catch (err) {
            throw err;
        }
    }

    @Post()
    @ApiConsumes('multipart/form-data')
    @ApiOkResponse({
        description: "file uploaded successfully", schema: {
            type: "object",
            properties: {
                msg: { type: "string" },
                fileName: { type: "string" }
            }
        }
    })
    @ApiUnprocessableEntityResponse({ description: "file is invalid" })
    @ApiBody({
        schema: {
            type: "object",
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                }
            }
        }
    })
    @UseInterceptors(FileInterceptor("file"))
    addAttach(@UploadedFile("file",
        new ParseFilePipeBuilder().
            addFileTypeValidator({ fileType: /^image\/(jpeg|png|gif)$/ }).
            addMaxSizeValidator({ maxSize: 5 * 1024 * 1024, message: "file must be lower than 5Mb" })
            .build({ errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY })



    ) file: Express.Multer.File, @Param('id', ParseIntPipe) taskId: number, @getUser("id") userId: number) {
        return this.taskService.storeNewAttach(taskId, userId, file);
    }
}