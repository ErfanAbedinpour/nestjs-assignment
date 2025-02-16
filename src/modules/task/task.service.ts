import { Injectable, InternalServerErrorException, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { EntityManager, NotFoundError, wrap } from '@mikro-orm/mysql';
import { Task } from '../../entities/task.entity';
import { ErrorMessages } from '../../responses/error.response';
import { createReadStream, existsSync, ReadStream } from 'fs';
import { Attached } from '../../entities/attached.entity';
import { rm } from 'fs/promises';
import { UtilService } from '../utils/util.service';

@Injectable()
export class TaskService {
  private readonly logger = new Logger(TaskService.name)
  private readonly basePath = `${process.cwd()}/src/public/attached/`

  constructor(private readonly em: EntityManager, private readonly util: UtilService) { }

  // create new Task With multiple Attached Files
  async create({ description, name }: CreateTaskDto, fileAttached: Express.Multer.File[], userId: number) {

    // get task
    const task = this.em.create(Task, { description, name, user: userId }, { persist: true });
    // create unique Name For each File and store as a stream
    for (const file of fileAttached) {
      // store in Storage
      this.addAtach(file);
      // get ext from File
      const fileName = this.util.createUniqueFileName(file);
      this.em.create(Attached, { src: fileName, task }, { persist: true });
    }
    // store task into Db
    try {
      await this.em.flush();
      return task;
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

  // findAll Task
  async findAll(page: number, userId: number) {
    const limit = 10;
    const offset = (page - 1) * limit;

    const [tasks, count] = await this.em.findAndCount(Task, { user: userId }, { offset, limit, populate: ['attached'] })

    return {
      tasks,
      meta: {
        count: tasks.length,
        allPages: Math.ceil(count / limit),
        countAll: count,
      }
    }
  }

  // findOne Task
  async findOne(id: number, userId: number) {
    try {
      const task = await this.em.findOneOrFail(Task, { $and: [{ id }, { user: userId }] }, { populate: ['user'] });
      return task;
    } catch (err) {
      this.mikroOrmErrorHandler(err)
    }
  }

  // update task
  async update(id: number, userId: number, updateTaskDto: UpdateTaskDto) {
    try {
      const task = await this.em.findOneOrFail(Task, { $and: [{ id }, { user: userId }] });
      const newTask = wrap(task).assign(updateTaskDto)
      await this.em.flush();
      return newTask;
    } catch (err) {
      this.mikroOrmErrorHandler(err)
      this.logger.error(err)
      throw new InternalServerErrorException(ErrorMessages.UNKNOWS_ERROR)
    }
  }

  // remove task
  async remove(id: number, userId: number) {
    try {
      const task = await this.em.findOneOrFail(Task, { $and: [{ id }, { user: userId }] }, { populate: ['attached'] });
      // remove task attached from Storage
      for (const attach of task.attached) {
        const filePath = this.basePath + attach.src;
        await this.removeFile(filePath);
      }
      await this.em.removeAndFlush(task);
      return task;
    } catch (err) {
      this.mikroOrmErrorHandler(err)
      this.logger.error(err)
      throw new InternalServerErrorException(ErrorMessages.UNKNOWS_ERROR)
    }
  }


  // private method for store file into Attach Directory
  private addAtach(attach: Express.Multer.File) {
    const filePath = this.basePath + this.util.createUniqueFileName(attach)
    // write into file
    this.util.writeFile(filePath, attach.buffer);
    return;
  }

  // getAttach
  async getAttach(taskId: number, userId: number, filename: string): Promise<{ stream: ReadStream, filename: string }> {
    // find Task
    const attach = await this.em.findOne(Attached, { $and: [{ task: taskId }, { src: filename }, { task: { user: userId } }] });
    // get attach name from Db
    if (!attach)
      throw new NotFoundException("attach not found");

    // check file is exsist or not
    const filePath = this.basePath + attach.src
    // check if exsist in storage
    const isFileExsist = existsSync(filePath);

    if (!isFileExsist)
      throw new NotFoundException("attach not found");

    const readStram = createReadStream(filePath);


    return { stream: readStram, filename: attach.src }

  }

  // update User Attach Files
  async storeNewAttach(taskId: number, userId: number, attach: Express.Multer.File) {
    try {
      console.log('user id  ', userId)
      const task = await this.em.findOneOrFail(Task, { $and: [{ id: taskId }, { user: userId }] });
      // store in Storage
      this.addAtach(attach);
      // get ext from File
      const fileName = this.util.createUniqueFileName(attach);

      this.em.create(Attached, { src: fileName, task }, { persist: true });
      await this.em.flush();
      return { msg: "added successfully" }
    } catch (err) {
      throw this.mikroOrmErrorHandler(err)
    }
  }

  // remove Task Attach
  async removeAttach(taskId: number, userId: number, fileName: string) {
    // get attach name from Db
    const attach = await this.em.findOne(Attached, { $and: [{ src: fileName }, { task: taskId }, { task: { user: userId } }] }, { populate: ["src"] });

    if (!attach)
      throw new NotFoundException("attach not Found")

    try {
      const filePath = this.basePath + attach.src
      // remove from Storage
      await this.removeFile(filePath);

      // remove from DB
      this.em.removeAndFlush(attach)
      return { msg: `${fileName} removed` }
    } catch (err) {
      this.mikroOrmErrorHandler(err)
      this.logger.error(err)
      throw new InternalServerErrorException(ErrorMessages.UNKNOWS_ERROR)
    }
  }

  // remvoe File From Storage
  private async removeFile(filePath: string) {
    try {

      const isFileExsist = existsSync(filePath);
      if (isFileExsist)
        await rm(filePath)

    } catch (err) {
      this.logger.error(err)
      throw new UnauthorizedException(err)
    }
  }
}
