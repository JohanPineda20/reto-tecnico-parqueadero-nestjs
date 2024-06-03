import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Request } from 'express';
import { Auth } from './decorators/auth.decorator';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}
    @HttpCode(HttpStatus.OK)
    @Post('/login')
    login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }
    @Auth()
    @HttpCode(HttpStatus.NO_CONTENT)
    @Get('/logout')
    logout(@Req() req: Request) {
        return this.authService.logout(req.headers.authorization);
    }
}
