import { BadRequestException, ConflictException, HttpException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { EntityManager, NotFoundError } from '@mikro-orm/mysql';
import { ErrorMessages } from '../../responses/error.response';
import { User, UserRole } from '../../entities/user.entity';
import { LoginDto } from './dto/login-auth.dto';
import { HashService } from './hashService/hash.service';
import { AccessTokenService } from './tokenService/accessToken.service';
import { RefreshTokenService } from './tokenService/refreshToken.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name)
  constructor(
    private readonly em: EntityManager,
    private readonly hashService: HashService,
    private readonly accessTokenService: AccessTokenService,
    private readonly refreshTokenService: RefreshTokenService
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
      throw new InternalServerErrorException(ErrorMessages.UNKNOWS_ERROR)
    }
  }


  private mikroOrmErrorHandler(err: Error) {
    if (err instanceof NotFoundError) {
      throw new NotFoundException(ErrorMessages.USER_NOTFOUND)
    }

    throw new InternalServerErrorException(ErrorMessages.UNKNOWS_ERROR)
  }

  async login({ password, username }: LoginDto) {
    try {

      const user = await this.em.findOneOrFail(User, { username });
      const validPass = await this.hashService.compare(password, user.password);

      if (!validPass)
        throw new BadRequestException(ErrorMessages.USER_NOTFOUND)

      // generate Tokens
      const [accessToken, refreshToken] = await Promise.all([
        this.accessTokenService.sign({ username: user.username, id: user.id, role: user.role }),
        this.refreshTokenService.sign({ id: user.id })
      ])

      return {
        accessToken,
        refreshToken
      }

    } catch (err) {
      if (err instanceof HttpException)
        throw err
      this.logger.error(err)
      this.mikroOrmErrorHandler(err as Error)
    }
  }

}
