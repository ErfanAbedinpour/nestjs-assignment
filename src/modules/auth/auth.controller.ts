import { Controller, Post, Body, HttpCode, HttpStatus, } from '@nestjs/common';
import { CreateUserDto } from './dto/create-auth.dto';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login-auth.dto';
import { TokenDto } from './dto/token-dto';
import { ApiBadRequestResponse, ApiConflictResponse, ApiCreatedResponse, ApiOkResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { HttpErrorDto } from '../../dto/error.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post("register")
  @ApiCreatedResponse({
    description: "user created successfully", schema: {
      type: 'object',
      properties: {
        msg: { type: "string" }
      }
    }
  })
  @ApiConflictResponse({ description: "some information is already taken", type: HttpErrorDto })
  create(@Body() user: CreateUserDto) {
    return this.authService.create(user);
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: "user login successfully", schema: {
      type: "object",
      properties: {
        accessToken: { type: 'string' },
        refreshToken: { type: "string" }
      }
    }
  })
  @ApiBadRequestResponse({ description: "invalid credential", type: HttpErrorDto })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto)
  }

  @Post("token")
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: "new token generated successfully", schema: {
      type: "object",
      properties: {
        newAccessToken: { type: "string" },
        newRefreshToken: { type: "string" }
      }
    }
  })
  @ApiUnauthorizedResponse({ description: "invalid token", type: HttpErrorDto })
  token(@Body() token: TokenDto) {
    return this.authService.token(token);
  }
}
