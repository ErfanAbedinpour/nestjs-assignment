import { Controller, Get, Post, Body, Patch, Param, Delete, Put, UseInterceptors, UploadedFile, ParseFilePipeBuilder, HttpStatus, Res, ParseIntPipe } from '@nestjs/common';
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

@Controller('user')
@Auth([AuthStrategy.Bearer])
export class UserController {
  constructor(private readonly userService: UserService) { }


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

  @Post("profile")
  @UseInterceptors(FileInterceptor('profile'))
  uploadProfile(@UploadedFile(
    new ParseFilePipeBuilder()
      .addFileTypeValidator({ fileType: "jpeg" })
      .addMaxSizeValidator({ maxSize: 3 * 1024 * 1024, message: "file must be lower than 3Mb" })
      .build({ errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY })
  ) profile: Express.Multer.File, @getUser('id') id: number) {
    return this.userService.storeProfilePicture(profile, id);
  }

  @Patch()
  update(@Body() body: UpdateUserDto, @getUser("id") id: number) {
    return this.userService.update(id, body)
  }

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

  @Put(":userId/role")
  @Role([UserRole.ADMIN])
  changeRole(@Body() role: UpdateRoleDto) { }

  @Delete(':id')
  @Role([UserRole.ADMIN])
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }


}
