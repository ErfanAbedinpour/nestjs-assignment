import { Controller, Get, Post, Body, Patch, Param, Delete, Put, UseInterceptors, UploadedFile, ParseFilePipeBuilder, HttpStatus, Res, ParseIntPipe, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { Auth, AuthStrategy } from '../auth/decorator/auth.decorator';
import { Role } from '../auth/decorator/role.decorator';
import { UserRole } from '../../entities/user.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { getUser } from '../auth/decorator/getUser.decorator';
import { Response } from 'express';
import { AccessTokenPayload } from '../auth/tokenService/token.service';
import { UpdateRoleDto } from './dto/update-role.dt';
import { findAllQuery } from './dto/get-user.dto';

@Controller('user')
@Auth([AuthStrategy.Bearer])
export class UserController {
  constructor(private readonly userService: UserService) { }

  // download profile
  @Get("profile/:filename")
  async getProfile(@Param('filename') filename: string, @getUser() user: AccessTokenPayload, @Res() response: Response) {
    try {
      console.log("role is ", user.role)
      const stream = await this.userService.getProfilePicture(filename, user.id, user.role)
      // donwload file directly
      response.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      stream.pipe(response);
    } catch (err) {
      throw err
    }
  }

  // upload profile
  @Post("profile")
  @UseInterceptors(FileInterceptor('profile'))
  uploadProfile(@UploadedFile(
    new ParseFilePipeBuilder()
      .addFileTypeValidator({ fileType: /^image\/(jpeg|png|jpg)$/ })
      .addMaxSizeValidator({ maxSize: 3 * 1024 * 1024, message: "file must be lower than 3Mb" })
      .build({ errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY })
  ) profile: Express.Multer.File, @getUser('id') id: number) {
    return this.userService.storeProfilePicture(profile, id);
  }


  // update 
  @Patch(':id')
  updateUser(@Param('id', ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserDto, @getUser("role") role: UserRole) {
    return this.userService.update(id, updateUserDto, role);
  }


  // get User List With Pagination
  @Get()
  @Role([UserRole.ADMIN])
  findAll(@Query() query: findAllQuery) {
    return this.userService.findAll({ limit: query.limit, page: query.page }, query.sort, { username: query.username, email: query.email });
  }

  // get User By Id
  @Get(":userId")
  @Role([UserRole.ADMIN])
  findOne(@Param('userId', ParseIntPipe) id: number) {
    return this.userService.findOne(id);
  }

  // change User Role
  @Put(":userId/role")
  @Role([UserRole.ADMIN])
  changeRole(@Body() role: UpdateRoleDto, @Param('userId', ParseIntPipe) userId: number) {
    return this.userService.changeRole(role, userId)
  }

  // delete User
  @Delete(':id')
  @Role([UserRole.ADMIN])
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.userService.remove(id);
  }

  @Delete('profile/:filename')
  @Role([UserRole.ADMIN])
  removeProfile(@Param('filename') filename: string) {
    return this.userService.removeFileName(filename);
  }

}
