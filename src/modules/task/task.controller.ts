import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, Query, ParseIntPipe, Res, UploadedFiles, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator, Put, UploadedFile } from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Auth, AuthStrategy } from '../auth/decorator/auth.decorator';
import { getUser } from '../auth/decorator/getUser.decorator';
import { FilesInterceptor } from '@nestjs/platform-express';
import { PaginationDto } from '../user/dto/get-user.dto';

@Controller('task')
@Auth([AuthStrategy.Bearer])
export class TaskController {
  constructor(private readonly taskService: TaskService) { }

  @Post()
  @UseInterceptors(FilesInterceptor("attached", 4))
  create(@UploadedFiles(
    new ParseFilePipe({
      validators: [
        new FileTypeValidator({ fileType: /^image\/(jpeg|png|gif)$/ }),
        new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024, message: "file must be lower than 5Mb" })
      ]
    })
  ) attached: Express.Multer.File[], @Body() createTaskDto: CreateTaskDto, @getUser("id") userId: number) {
    return this.taskService.create(createTaskDto, attached, userId);
  }

  @Get()
  findAll(@Query() { page }: PaginationDto, @getUser("id") userId: number) {
    return this.taskService.findAll(Number(page ?? 1), userId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @getUser("id") userId: number) {
    return this.taskService.findOne(+id, userId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto, @getUser("id") userId: number) {
    return this.taskService.update(+id, userId, updateTaskDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @getUser("id") userId: number) {
    return this.taskService.remove(+id, userId);
  }

}
