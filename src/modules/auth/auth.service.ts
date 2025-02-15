import { BadRequestException, ConflictException, Injectable, Logger } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { EntityManager } from '@mikro-orm/mysql';
import { ErrorMessages } from '../../responses/error.response';
import { User, UserRole } from '../../entities/user.entity';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name)
  constructor(
    private readonly em: EntityManager
  ) { }

  async create({ email, password, phone, username }: CreateAuthDto): Promise<{ msg: string }> {
    // check information is valid or not
    const isValidInformation = await this.em.findOne(User, { $or: [{ username }, { email }, { phone }] });

    if (isValidInformation)
      throw new ConflictException(ErrorMessages.INVALID_INFORMATION);

    try {

      this.em.create(User, { email, username, password, phone, role: UserRole.USER }, { persist: true });

      await this.em.flush();
      return { msg: "user registered successfully" }
    } catch (err) {
      this.logger.error(err)
      throw new BadRequestException("something went wrong")
    }
  }

}
