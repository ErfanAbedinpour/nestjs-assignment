import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, Query, ParseIntPipe, UploadedFiles, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator } from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto, TaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Auth, AuthStrategy } from '../auth/decorator/auth.decorator';
import { getUser } from '../auth/decorator/getUser.decorator';
import { FilesInterceptor } from '@nestjs/platform-express';
import { FindAllTaskQuery } from './dto/file-task.dto';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiNotAcceptableResponse, ApiNotFoundResponse, ApiOkResponse, ApiParam, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { UploadDto } from './dto/uplaod.dto';
import { HttpErrorDto } from '../../dto/error.dto';

@Controller('task')
@Auth([AuthStrategy.Bearer])
@ApiUnauthorizedResponse({ description: "header is empty or token invalid", type: HttpErrorDto })
@ApiBearerAuth()
export class TaskController {
  constructor(private readonly taskService: TaskService) { }

  @Post()
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    type: UploadDto
  })
  @ApiOkResponse({ description: "task created successfully", type: TaskDto })
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
  @ApiOkResponse({ description: "taks fetched successfully", type: [TaskDto] })
  findAll(@Query() query: FindAllTaskQuery, @getUser("id") userId: number) {
    return this.taskService.findAll({ page: query.page, limit: query.limit }, userId, query.sort, { name: query.name });
  }

  @Get(':id')
  @ApiParam({ name: "id", description: "taskId" })
  @ApiOkResponse({ description: "task fetched successfully", type: TaskDto })
  @ApiNotFoundResponse({ description: "task not found", type: HttpErrorDto })
  findOne(@Param('id', ParseIntPipe) id: number, @getUser("id") userId: number) {
    return this.taskService.findOne(+id, userId);
  }

  @Patch(':id')
  @ApiParam({ name: "id", description: "taskId" })
  @ApiBody({ type: UpdateTaskDto })
  @ApiOkResponse({ description: "task updated successfully", type: TaskDto })
  @ApiNotFoundResponse({ description: "task not found", type: HttpErrorDto })
  update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto, @getUser("id") userId: number) {
    return this.taskService.update(+id, userId, updateTaskDto);
  }

  @Delete(':id')
  @ApiParam({ name: "id", description: "taskId" })
  @ApiOkResponse({ description: "task remove successfully", type: TaskDto })
  @ApiNotFoundResponse({ description: "task not found", type: HttpErrorDto })
  remove(@Param('id', ParseIntPipe) id: number, @getUser("id") userId: number) {
    return this.taskService.remove(+id, userId);
  }

}
