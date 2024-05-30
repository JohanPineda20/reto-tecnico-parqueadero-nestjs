import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { RolesService } from 'src/roles/roles.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private readonly rolesService: RolesService
  ) {}
  async create(createUserDto: CreateUserDto) {
    const userDni = await this.usersRepository.findOneBy({dni: createUserDto.dni});
    if (userDni) {
      throw new ConflictException(`user already exists with dni: ${createUserDto.dni}`);
    }
    const userEmail = await this.usersRepository.findOneBy({email: createUserDto.email});
    if (userEmail) {
      throw new ConflictException(`user already exists with email: ${createUserDto.email}`);
    }
    const role = await this.rolesService.findById(2);
    if (!role) {
      throw new NotFoundException("role not found");
    }
    return this.usersRepository.save({...createUserDto, role});
  }
}
