import { BadGatewayException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { EntityManager, NotFoundError } from '@mikro-orm/mysql';
import { createReadStream, createWriteStream, existsSync, ReadStream } from 'fs';
import { extname } from 'path';
import { ErrorMessages } from '../../responses/error.response';
import { Profile } from '../../entities/profile.entity';
import { User, UserRole } from '../../entities/user.entity';
import { UpdateRoleDto } from './dto/update-role.dt';
import { throwDeprecation } from 'process';

@Injectable()
export class UserService {
  private readonly baseProfilePath = `${process.cwd()}/src/public/profile/`;

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

  async storeProfilePicture(profile: Express.Multer.File, user: number) {
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
      throw new InternalServerErrorException(ErrorMessages.UNKNOWS_ERROR)
    }
  }


  findAll() {
    return `This action returns all user`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  mikroOrmErrorhandler(err: unknown) {
    // handler MirkOrm Error
    if (err instanceof NotFoundError)
      throw new NotFoundException(ErrorMessages.USER_NOTFOUND)
  }

  async remove(id: number) {
    try {

      const user = await this.em.findOneOrFail(User, id);
      this.em.remove(user);
      this.em.flush();

      return { msg: "user removed successfully", user };

    } catch (err) {
      this.mikroOrmErrorhandler(err)
      throw new InternalServerErrorException(ErrorMessages.UNKNOWS_ERROR)
    }
  }

  async changeRole({ role }: UpdateRoleDto, userId: number) {
    try {
      const user = await this.em.findOneOrFail(User, userId);

      user.role = role;

      await this.em.flush();
      return user;
    } catch (err) {
      this.mikroOrmErrorhandler(err)
      throw new InternalServerErrorException(ErrorMessages.UNKNOWS_ERROR)
    }

  }
}
