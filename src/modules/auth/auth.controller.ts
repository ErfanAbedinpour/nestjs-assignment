import { Controller, Post, Body, HttpCode, HttpStatus, } from '@nestjs/common';
import { CreateUserDto } from './dto/create-auth.dto';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login-auth.dto';
import { TokenDto } from './dto/token-dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post("register")
  create(@Body() user: CreateUserDto) {
    return this.authService.create(user);
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto)
  }

  @Post("token")
  @HttpCode(HttpStatus.OK)
  token(@Body() token: TokenDto) {
    return this.authService.token(token);
  }
}
