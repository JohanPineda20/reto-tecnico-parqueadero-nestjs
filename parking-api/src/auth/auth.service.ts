import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { LoginDto } from './dto/login.dto';
import * as bcryptjs from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService
    ) {}

    async login(loginDto: LoginDto) {
        const user = await this.usersService.findOneByEmail(loginDto.email);
        if(!user){
            throw new UnauthorizedException(`email is wrong`);
        }
        const isPasswordValid = await bcryptjs.compare(loginDto.password, user.password);
        if(!isPasswordValid){
            throw new UnauthorizedException(`password is wrong`);
        }
        const payload = { sub: user.id, username: user.email, role: user.role.name };
        const token = await this.jwtService.signAsync(payload);
        this.usersService.saveToken(user, token);
        return {token};
    }
}
