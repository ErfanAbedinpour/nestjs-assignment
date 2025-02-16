import { BadGatewayException, BadRequestException, ConflictException, HttpException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { EntityManager, FilterQuery, NotFoundError, UniqueConstraintViolationException, wrap } from '@mikro-orm/mysql';
import { createReadStream, createWriteStream, existsSync, ReadStream } from 'fs';
import { rm } from 'fs/promises'
import { extname } from 'path';
import { ErrorMessages } from '../../responses/error.response';
import { Profile } from '../../entities/profile.entity';
import { User, UserRole } from '../../entities/user.entity';
import { UpdateRoleDto } from './dto/update-role.dt';
import { findAllQuery } from './dto/get-user.dto';

@Injectable()
export class UserService {
  private readonly baseProfilePath = `${process.cwd()}/src/public/profile/`;

  private readonly logger = new Logger(UserService.name);

  constructor(private readonly em: EntityManager) { }

  async getProfilePicture(filename: string, userId: number, role: UserRole): Promise<ReadStream> {
    // check User Role if Not Admin Authorize them
    if (role === UserRole.USER) {
      const isUserAccess = await this.em.findOne(Profile, { user: userId, src: filename });

      if (!isUserAccess)
        throw new BadGatewayException("user doesnt have this profile");
    }

    const filePath = this.baseProfilePath + filename;

    if (!existsSync(filePath))
      throw new NotFoundException("file not found.")

    const readStream = createReadStream(filePath);
    return readStream
  }

  async storeProfilePicture(profile: Express.Multer.File, user: number): Promise<{ msg: string, fileName: string }> {
    try {
      // working with stream
      const ext = extname(profile.originalname);

      const fileName = `${Math.ceil(Math.random() * 1e8 * Date.now())}${ext}`
      const filePath = this.baseProfilePath + fileName

      const stream = createWriteStream(filePath)
      stream.write(profile.buffer)

      this.em.create(Profile, {
        src: fileName,
        user
      }, { persist: true })
      await this.em.flush();

      return { msg: "profile uploaded successfully", fileName: fileName }
    } catch (err) {

      this.logger.error(err)
      throw new InternalServerErrorException(ErrorMessages.UNKNOWS_ERROR)
    }
  }


  async findAll(page: number, sort?: 1 | 0, filter?: { email: string, username: string }): Promise<{ users: User[], meta: { count: number, allPages: number } }> {
    const limit = 10;
    const offset = (page - 1) * limit;

    try {
      // if sort query exsist sort
      const sortBy = sort === 1 ? "ASC" : "DESC"

      let filterQuery: FilterQuery<User> = {}

      // if filter exsist filter on them
      for (const key in filter) {
        if (filter[key]) {
          filterQuery[key] = { $like: `%${filter[key]}%` }
        }
      }

      const [users, count] = await this.em.findAndCount(User, filterQuery, { offset, limit, populate: ['profiles'], orderBy: { createdAt: sortBy } });

      return {
        users,
        meta: {
          allPages: Math.ceil(count / limit),
          count: count,
        }
      };
    } catch (err) {
      this.mikroOrmErrorHandler(err)

      this.logger.error(err)
      throw new InternalServerErrorException(ErrorMessages.UNKNOWS_ERROR)
    }
  }

  async findOne(id: number): Promise<User> {
    try {
      const user = await this.em.findOneOrFail(User, id, { populate: ['profiles'] });
      return user

    } catch (err) {
      this.mikroOrmErrorHandler(err)
      this.logger.error(err)
      throw new InternalServerErrorException(ErrorMessages.UNKNOWS_ERROR)
    }
  }

  async update(id: number, updateUserDto: UpdateUserDto, role: UserRole) {
    try {
      const user = await this.em.findOneOrFail(User, id);


      if (updateUserDto.username && role !== UserRole.ADMIN) {
        throw new BadRequestException("cannot change you own username");
      }

      const newUser = wrap(user).assign(updateUserDto)
      await this.em.flush();
      return newUser

    } catch (err) {
      if (err instanceof HttpException)
        throw err

      this.mikroOrmErrorHandler(err)

      this.logger.error(err)
      throw new InternalServerErrorException(ErrorMessages.UNKNOWS_ERROR)
    }

  }

  mikroOrmErrorHandler(err: unknown) {
    // handler MirkOrm Error
    if (err instanceof NotFoundError)
      throw new NotFoundException(ErrorMessages.USER_NOTFOUND)

    if (err instanceof UniqueConstraintViolationException)
      throw new ConflictException('files taken by another user. please chose another one')
  }

  async remove(id: number): Promise<{ msg: string, user: User }> {
    try {

      const user = await this.em.findOneOrFail(User, id);
      this.em.remove(user);
      this.em.flush();

      return { msg: "user removed successfully", user };

    } catch (err) {
      this.mikroOrmErrorHandler(err)
      this.logger.error(err)
      throw new InternalServerErrorException(ErrorMessages.UNKNOWS_ERROR)
    }
  }

  async changeRole({ role }: UpdateRoleDto, userId: number): Promise<User> {
    try {
      const user = await this.em.findOneOrFail(User, userId);

      user.role = role;

      await this.em.flush();
      return user;
    } catch (err) {
      this.mikroOrmErrorHandler(err)

      this.logger.error(err)
      throw new InternalServerErrorException(ErrorMessages.UNKNOWS_ERROR)
    }

  }


  async removeFileName(filename: string): Promise<{ msg: string }> {
    const filePath = this.baseProfilePath + filename;
    const isFileExsist = existsSync(filePath)

    if (!isFileExsist)
      throw new BadRequestException("profile not found")

    try {
      await rm(filePath)
      const profile = await this.em.findOne(Profile, { src: filename })

      if (profile)
        await this.em.removeAndFlush(profile)

      return { msg: "successfully Removed" }
    } catch (err) {
      this.logger.error(err)
      throw new BadRequestException("error During Remove File")
    }

  }
}
