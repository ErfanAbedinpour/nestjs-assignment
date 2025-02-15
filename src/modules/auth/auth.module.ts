import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { HashService } from './hashService/hash.service';
import { ArgonService } from './hashService/argon.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, {
    provide: HashService,
    useClass: ArgonService
  }],
})
export class AuthModule { }
