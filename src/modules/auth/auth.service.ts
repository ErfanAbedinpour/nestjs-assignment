import { BadRequestException, ConflictException, ForbiddenException, HttpException, Injectable, InternalServerErrorException, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { EntityManager, NotFoundError } from '@mikro-orm/mysql';
import { ErrorMessages } from '../../responses/error.response';
import { User, UserRole } from '../../entities/user.entity';
import { LoginDto } from './dto/login-auth.dto';
import { HashService } from './hashService/hash.service';
import { UserTokenService } from './tokenService/userToken.service';
import { TokenDto } from './dto/token-dto';
import { RefreshTokenService } from './tokenService/refreshToken.service';
import { JsonWebTokenError } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name)
  constructor(
    private readonly em: EntityManager,
    private readonly hashService: HashService,
    private readonly userTokenService: UserTokenService,
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
  }

  async login({ password, username }: LoginDto) {
    try {

      const user = await this.em.findOneOrFail(User, { username });
      const isValidPass = await this.hashService.compare(password, user.password);

      if (!isValidPass)
        throw new BadRequestException(ErrorMessages.USER_NOTFOUND)

      // generate Tokens

      const { accessToken, refreshToken } = await this.userTokenService.genTokens({ id: user.id, role: user.role, username: user.username });

      return {
        accessToken,
        refreshToken
      }

    } catch (err) {
      if (err instanceof HttpException)
        throw err
      this.mikroOrmErrorHandler(err as Error)
      this.logger.error(err)
      throw new NotFoundException(ErrorMessages.USER_NOTFOUND)
    }
  }

  async token({ refreshToken }: TokenDto) {
    try {
      const { id, tokenId } = await this.refreshTokenService.verify(refreshToken)
      const isValidToken = await this.userTokenService.isValid(id, tokenId, refreshToken);
      if (!isValidToken) {
        throw new UnauthorizedException(ErrorMessages.INVALID_TOKEN)
      }
      // get original User From DB
      const user = await this.em.findOneOrFail(User, id);
      // invalidte old token
      await this.userTokenService.invalidate(id, tokenId);
      // generate new 
      const { accessToken: newAccessToken, refreshToken: newRefreshToken } = await this.userTokenService.genTokens({ username: user.username, id: user.id, role: user.role });
      return { newAccessToken, newRefreshToken }
    } catch (err) {
      if (err instanceof JsonWebTokenError) {
        throw new UnauthorizedException(ErrorMessages.INVALID_TOKEN)
      }
      this.mikroOrmErrorHandler(err as Error)
      this.logger.error(err)
      throw new InternalServerErrorException(ErrorMessages.UNKNOWS_ERROR)
    }

  }
}

