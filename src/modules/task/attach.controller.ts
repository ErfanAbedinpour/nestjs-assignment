import { Controller, Delete, FileTypeValidator, Get, MaxFileSizeValidator, Param, ParseFilePipe, ParseIntPipe, Post, Res, UploadedFile, UseInterceptors } from "@nestjs/common";
import { TaskService } from "./task.service";
import { getUser } from "../auth/decorator/getUser.decorator";
import { Response } from "express";
import { FileInterceptor } from "@nestjs/platform-express";
import { Auth, AuthStrategy } from "../auth/decorator/auth.decorator";

@Controller("task/:id/attach")
@Auth([AuthStrategy.Bearer])
export class AttachController {

    constructor(private readonly taskService: TaskService) { }
    @Delete(":filename")
    removeAttachFile(@Param("id", ParseIntPipe) id: number, @Param("filename") filename: string, @getUser('id') userId: number) {
        return this.taskService.removeAttach(id, userId, filename)
    }

    @Get(":filename")
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
    @UseInterceptors(FileInterceptor("file"))
    addAttach(@UploadedFile("file",
        new ParseFilePipe({
            validators: [
                new FileTypeValidator({ fileType: /^image\/(jpeg|png|gif)$/ }),
                new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024, message: "file must be lower than 5Mb" })
            ]
        })
    ) file: Express.Multer.File, @Param('id', ParseIntPipe) taskId: number, @getUser("id") userId: number) {
        return this.taskService.storeNewAttach(taskId, userId, file);
    }
}