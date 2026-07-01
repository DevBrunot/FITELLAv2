// file: src/modules/auth/auth.controller.ts
import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  AuthLoginDto, AuthRegisterDto, StudentRegisterDto, StudentLoginDto,
} from './dto/auth.dto';

@Controller('api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /** POST /api/auth/register — cadastro do personal trainer */
  @Post('register')
  register(@Body() dto: AuthRegisterDto) {
    return this.authService.registerTrainer(dto);
  }

  /** POST /api/auth/login — login do personal trainer */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: AuthLoginDto) {
    return this.authService.loginTrainer(dto);
  }

  /** POST /api/auth/student/register — cadastro da aluna via link */
  @Post('student/register')
  studentRegister(@Body() dto: StudentRegisterDto) {
    return this.authService.registerStudent(dto);
  }

  /** POST /api/auth/student/login — login da aluna */
  @Post('student/login')
  @HttpCode(HttpStatus.OK)
  studentLogin(@Body() dto: StudentLoginDto) {
    return this.authService.loginStudent(dto);
  }
}
