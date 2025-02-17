import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { AdminController } from './user-admin.controller';

@Module({
  controllers: [UserController, AdminController],
  providers: [UserService],
})
export class UserModule { }
