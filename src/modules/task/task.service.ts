import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { EntityManager, NotFoundError } from '@mikro-orm/mysql';
import { Task } from '../../entities/task.entity';
import { ErrorMessages } from '../../responses/error.response';
import { createWriteStream } from 'fs';
import { extname } from 'path';
import { Attached } from '../../entities/attached.entity';

@Injectable()
export class TaskService {
  private readonly logger = new Logger(TaskService.name)
  private readonly basePath = `${process.cwd()}/src/public/attached/`

  constructor(private readonly em: EntityManager) { }
  async create({ description, name }: CreateTaskDto, fileAttached: Express.Multer.File, userId: number) {

    // create unique Name For each File and store as a stream
    const ext = extname(fileAttached.originalname);
    const fileName = `${Math.ceil(Math.random() * 1e8 * Date.now())}${ext}`
    const filePath = this.basePath + fileName
    const writeStream = createWriteStream(filePath)

    // store task into Db
    const task = this.em.create(Task, { description, name, user: userId }, { persist: true });
    this.em.create(Attached, { src: fileName, task }, { persist: true });


    try {
      await this.em.flush();
      writeStream.write(fileAttached.buffer);
      return { task, attach: task.attached };
    } catch (err) {
      this.logger.error(err)
      throw new InternalServerErrorException(ErrorMessages.UNKNOWS_ERROR)
    }
  }


  private mikroOrmErrorHandler(err: unknown) {
    if (err instanceof NotFoundError) {
      throw new NotFoundException(ErrorMessages.TASK_NOTFOUND)
    }
  }

  async findAll(page: number, userId: number) {
    const limit = 10;
    const offset = (page - 1) * limit;

    const [tasks, count] = await this.em.findAndCount(Task, { user: userId }, { offset, limit, populate: ['attached'] })

    return {
      tasks,
      meta: {
        allPages: Math.ceil(count / limit),
        count,
      }
    }
  }

  async findOne(id: number, userId: number) {
    const task = await this.em.findOne(Task, { $and: [{ id }, { user: userId }] }, { populate: ['user'] });
    if (!task)
      throw new BadRequestException(ErrorMessages.TASK_NOTFOUND)

    return task;

  }

  update(id: number, updateTaskDto: UpdateTaskDto) {
    return `This action updates a #${id} task`;
  }

  remove(id: number) {
    return `This action removes a #${id} task`;
  }
}
