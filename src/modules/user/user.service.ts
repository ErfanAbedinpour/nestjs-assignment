import { BadGatewayException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { EntityManager } from '@mikro-orm/mysql';
import { createReadStream, createWriteStream, existsSync, ReadStream } from 'fs';
import { extname } from 'path';
import { ErrorMessages } from '../../responses/error.response';
import { Profile } from '../../entities/profile.entity';

@Injectable()
export class UserService {
  private readonly baseProfilePath = `${process.cwd()}/src/public/profile/`;

  constructor(private readonly em: EntityManager) { }

  async getProfilePicture(filename: string, userId: number): Promise<ReadStream> {
    const isUserAccess = await this.em.findOne(Profile, { user: userId, src: filename });

    if (!isUserAccess)
      throw new BadGatewayException("user doesnt have this profile");

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

  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
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

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  changeRole(newRole) { }
}
