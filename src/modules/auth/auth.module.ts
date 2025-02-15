import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { HashService } from './hashService/hash.service';
import { ArgonService } from './hashService/argon.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import tokenConfig from './config/token.config';
import { AccessTokenService } from './tokenService/accessToken.service';
import { RefreshTokenService } from './tokenService/refreshToken.service';

@Module({
  imports: [ConfigModule.forFeature(tokenConfig), JwtModule.register({})],
  controllers: [AuthController],
  providers: [
    AuthService,
    {
      provide: HashService,
      useClass: ArgonService
    },
    AccessTokenService,
    RefreshTokenService,
  ],
})
export class AuthModule { }
