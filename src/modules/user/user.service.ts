import { BadGatewayException, BadRequestException, ConflictException, HttpException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { EntityManager, FilterQuery, NotFoundError, UniqueConstraintViolationException, wrap } from '@mikro-orm/mysql';
import { createReadStream, existsSync, ReadStream } from 'fs';
import { rm } from 'fs/promises'
import { ErrorMessages } from '../../responses/error.response';
import { Profile } from '../../entities/profile.entity';
import { User, UserRole } from '../../entities/user.entity';
import { UpdateRoleDto } from './dto/update-role.dt';
import { UtilService } from '../utils/util.service';

@Injectable()
export class UserService {
  private readonly baseProfilePath = `${process.cwd()}/src/public/profile/`;

  private readonly logger = new Logger(UserService.name);

  constructor(private readonly em: EntityManager, protected readonly util: UtilService) { }

  async getProfilePicture(filename: string, userId: number, role: UserRole): Promise<ReadStream> {
    // check User Role if Not Admin Authorize them

    if (role === UserRole.USER) {
      const isUserAccess = await this.em.findOne(Profile, { user: userId, src: filename });

      if (!isUserAccess)
        throw new BadRequestException("you have not access to this profile");
    }

    const filePath = this.baseProfilePath + filename;

    if (!existsSync(filePath))
      throw new NotFoundException("profile not found")

    const readStream = createReadStream(filePath);
    return readStream
  }

  async storeProfilePicture(profile: Express.Multer.File, user: number): Promise<{ msg: string, fileName: string }> {
    try {
      // working with stream
      const fileName = this.util.createUniqueFileName(profile);
      const filePath = this.baseProfilePath + fileName

      // write into File
      this.util.writeFile(filePath, profile.buffer);

      this.em.create(Profile, {
        src: fileName,
        user
      }, { persist: true })
      await this.em.flush();

      return { msg: "profile uploaded successfully", fileName: fileName }
    } catch (err) {
      this.logger.error(err)
      throw new InternalServerErrorException("error during upload profile. please try again later!")
    }
  }


  async findAll({ page, limit }: { page: number, limit: number }, sort?: 1 | 0, filter?: { email: string, username: string }): Promise<{ users: User[], meta: { count: number, allPages: number, countAll: number } }> {
    const limitRow = limit || 10;
    const offset = (page - 1) * limitRow;

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

      const [users, count] = await this.em.findAndCount(User, filterQuery, { offset, limit: limitRow, populate: ['profiles'], orderBy: { createdAt: sortBy } });


      return {
        users,
        meta: {
          count: users.length,
          allPages: Math.ceil(count / limitRow),
          countAll: count,
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

  async update(id: number, updateUserDto: UpdateUserDto, isAdmin?: boolean) {
    try {
      const user = await this.em.findOneOrFail(User, id);


      if (updateUserDto.username && !isAdmin)
        throw new BadRequestException("cannot change your own username");


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

    try {
      // remove file
      if (isFileExsist)
        await rm(filePath)

      const profile = await this.em.findOne(Profile, { src: filename })

      if (!profile && !isFileExsist)
        throw new NotFoundException("profile not found")

      // if profile exsist remove them
      profile && await this.em.removeAndFlush(profile)

      return { msg: "successfully Removed" }
    } catch (err) {
      this.logger.error(err)
      throw new BadRequestException("error During Remove File")
    }

  }
}
