import { Controller, Get, Post, Body, Patch, Param, UseInterceptors, UploadedFile, ParseFilePipeBuilder, HttpStatus, Res, } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { Auth, AuthStrategy } from '../auth/decorator/auth.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { getUser } from '../auth/decorator/getUser.decorator';
import { Response } from 'express';
import { AccessTokenPayload } from '../auth/tokenService/token.service';
import { ApiBadRequestResponse, ApiBearerAuth, ApiBody, ApiConsumes, ApiNotFoundResponse, ApiOkResponse, ApiParam, ApiTags, ApiUnauthorizedResponse, ApiUnprocessableEntityResponse } from '@nestjs/swagger';
import { HttpErrorDto } from '../../dto/error.dto';
import { CreateUserDto } from '../auth/dto/create-auth.dto';

@Controller('user')
@Auth(AuthStrategy.Bearer)
@ApiUnauthorizedResponse({ description: "header is empty or token invalid", type: HttpErrorDto })
@ApiBearerAuth()
export class UserController {
  constructor(private readonly userService: UserService) { }

  // download profile
  @Get("profile/:filename")
  @ApiOkResponse({ description: "profile downloaded directly" })
  @ApiNotFoundResponse({ description: "profile not found or you cannot access to this profile", type: HttpErrorDto })
  @ApiTags("Admin")
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

  // update by user
  @Patch()
  @ApiOkResponse({
    description: "user Updated successfully", type: CreateUserDto
  })
  @ApiBadRequestResponse({ description: "user cannot change your own username", type: HttpErrorDto })
  @ApiNotFoundResponse({ description: "user Not found", type: HttpErrorDto })
  updateUser(@Body() updateUserDto: UpdateUserDto, @getUser('id') userId: number) {
    return this.userService.update(userId, updateUserDto);
  }
}
