import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, HttpStatus, ParseFilePipeBuilder, UploadedFile } from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Auth, AuthStrategy } from '../auth/decorator/auth.decorator';
import { getUser } from '../auth/decorator/getUser.decorator';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('task')
@Auth([AuthStrategy.Bearer])
export class TaskController {
  constructor(private readonly taskService: TaskService) { }

  @Post()
  @UseInterceptors(FileInterceptor('attached'))
  create(@UploadedFile(
    new ParseFilePipeBuilder()
      // .addFileTypeValidator({ fileType: "jpeg" })
      .addMaxSizeValidator({ maxSize: 3 * 1024 * 1024, message: "file must be lower than 3Mb" })
      .build({ errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY })
  ) attached: Express.Multer.File, @Body() createTaskDto: CreateTaskDto, @getUser("id") userId: number) {
    return this.taskService.create(createTaskDto, attached, userId);
  }

  @Get()
  findAll() {
    return this.taskService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.taskService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    return this.taskService.update(+id, updateTaskDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.taskService.remove(+id);
  }
}
