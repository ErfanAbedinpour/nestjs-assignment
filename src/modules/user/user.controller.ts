import { Controller, Get, Post, Body, Patch, Param, Delete, Put, UseInterceptors, UploadedFile, ParseFilePipeBuilder, HttpStatus, Res, ParseIntPipe, Query, UnauthorizedException } from '@nestjs/common';
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
import { ApiBadRequestResponse, ApiBearerAuth, ApiBody, ApiConsumes, ApiNotFoundResponse, ApiOkResponse, ApiParam, ApiSecurity, ApiTags, ApiUnauthorizedResponse, ApiUnprocessableEntityResponse } from '@nestjs/swagger';
import { HttpErrorDto } from '../../dto/error.dto';
import { CreateUserDto } from '../auth/dto/create-auth.dto';
import { UserDto } from './dto/user.dto';

@Controller('user')
@Auth([AuthStrategy.Bearer])
@ApiUnauthorizedResponse({ description: "header is empty or token invalid", type: HttpErrorDto })
@ApiBearerAuth()
export class UserController {
  constructor(private readonly userService: UserService) { }

  // download profile
  @Get("profile/:filename")
  @ApiOkResponse({ description: "profile downloaded directly" })
  @ApiNotFoundResponse({ description: "profile not found or you cannot access to this profile", type: HttpErrorDto })
  @ApiParam({ name: "filename", description: "name of file", example: "example.jpeg" })
  async getProfile(@Param('filename') filename: string, @getUser() user: AccessTokenPayload, @Res() response: Response) {
    try {
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
  @ApiConsumes('multipart/form-data')
  @ApiOkResponse({
    description: "profile uploaded successfully", schema: {
      type: "object",
      properties: {
        msg: { type: "string" },
        fileName: { type: "string" }
      }
    }
  })
  @ApiUnprocessableEntityResponse({ description: "file is invalid" })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        profile: {
          type: 'string',
          format: 'binary',
        }
      }
    }
  })
  @UseInterceptors(FileInterceptor('profile'))
  uploadProfile(@UploadedFile(
    new ParseFilePipeBuilder()
      .addFileTypeValidator({ fileType: /^image\/(jpeg|png|jpg)$/ })
      .addMaxSizeValidator({ maxSize: 3 * 1024 * 1024, message: "file must be lower than 3Mb" })
      .build({ errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY })
  ) profile: Express.Multer.File, @getUser('id') id: number) {
    return this.userService.storeProfilePicture(profile, id);
  }

  // admin permission
  // remove User Profile By Admin 
  @Delete('profile/:filename')
  @ApiParam({ name: "filename", description: "name of file", example: "example.jpeg" })
  @ApiOkResponse({ description: "file Removed successfully", schema: { type: "object", properties: { msg: { type: "string" } } } })
  @ApiNotFoundResponse({ description: "file Not Found", type: HttpErrorDto })
  @ApiSecurity("admin")
  @ApiTags("admin")
  @Role([UserRole.ADMIN])
  removeProfile(@Param('filename') filename: string) {
    return this.userService.removeFileName(filename);
  }


  // update 
  @Patch(':id')
  @ApiOkResponse({
    description: "user Updated successfully", type: CreateUserDto
  })
  @ApiBadRequestResponse({ description: "user cannot change its own username", type: HttpErrorDto })
  @ApiNotFoundResponse({ description: "user Not found", type: HttpErrorDto })
  @ApiTags("admin")
  @ApiSecurity("admin")
  @ApiSecurity("user")
  updateUser(@Param('id', ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserDto, @getUser("role") role: UserRole) {
    return this.userService.update(id, updateUserDto, role);
  }


  // get User List With Pagination
  @Get()
  @ApiOkResponse({ description: "users fetched successfully", type: [UserDto] })
  @ApiUnauthorizedResponse({ description: "you have not access to this route", type: HttpErrorDto })
  @ApiTags("admin")
  @ApiSecurity("admin")
  @Role([UserRole.ADMIN])
  findAll(@Query() query: findAllQuery) {
    return this.userService.findAll({ limit: query.limit, page: query.page }, query.sort, { username: query.username, email: query.email });
  }

  // get User By Id
  @Get(":userId")
  @ApiOkResponse({ description: "user fetched successfully", type: UserDto })
  @ApiNotFoundResponse({ description: "user Not found", type: HttpErrorDto })
  @ApiUnauthorizedResponse({ description: "you have not access to this route", type: HttpErrorDto })
  @ApiTags("admin")
  @ApiSecurity("admin")
  @Role([UserRole.ADMIN])
  findOne(@Param('userId', ParseIntPipe) id: number) {
    return this.userService.findOne(id);
  }

  // change User Role
  @Put(":userId/role")
  @ApiOkResponse({ description: "user role updated ", type: UserDto })
  @ApiBody({ type: UpdateRoleDto })
  @ApiNotFoundResponse({ description: "user not found", type: HttpErrorDto })
  @ApiUnauthorizedResponse({ description: "you have not access to this route", type: HttpErrorDto })
  @ApiTags("admin")
  @ApiSecurity("admin")
  @Role([UserRole.ADMIN])
  changeRole(@Body() role: UpdateRoleDto, @Param('userId', ParseIntPipe) userId: number) {
    return this.userService.changeRole(role, userId)
  }

  // delete User
  @Delete(':id')
  @ApiOkResponse({ description: "user removed successfully", })
  @ApiNotFoundResponse({ description: "user not found", })
  @ApiUnauthorizedResponse({ description: "you have not access to this route", type: HttpErrorDto })
  @ApiTags("admin")
  @ApiSecurity("admin")
  @Role([UserRole.ADMIN])
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.userService.remove(id);
  }

}
