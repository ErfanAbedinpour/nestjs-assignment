import { Controller, Get, Post, Body, Patch, Param, Delete, Put } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Auth, AuthStrategy } from '../auth/decorator/auth.decorator';
import { Role } from '../auth/decorator/role.decorator';
import { UserRole } from '../../entities/user.entity';

@Controller('user')
@Auth([AuthStrategy.Bearer])
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Post()
  uploadProfile() { }

  @Patch()
  update() { }

  // admin Permission
  @Patch(':id')
  @Role([UserRole.ADMIN])
  updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Get()
  @Role([UserRole.ADMIN])
  findAll() {
    return this.userService.findAll();
  }

  @Put("role")
  @Role([UserRole.ADMIN])
  changeRole() { }

  @Delete(':id')
  @Role([UserRole.ADMIN])
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
