import { Controller, Post, Body, } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login-auth.dto';
import { TokenDto } from './dto/token-dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post("register")
  create(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.create(createAuthDto);
  }

  @Post("login")
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto)
  }

  @Post("token")
  token(@Body() token: TokenDto) {
    return this.authService.token(token);
  }
}
