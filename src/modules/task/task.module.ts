import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { AttachController } from './attach.controller';

@Module({
  controllers: [TaskController, AttachController],
  providers: [TaskService],
})
export class TaskModule { }
