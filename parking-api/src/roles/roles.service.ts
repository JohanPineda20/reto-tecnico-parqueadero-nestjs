import { Injectable, OnModuleInit } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';

@Injectable()
export class RolesService implements OnModuleInit{
  constructor(
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
  ) {}

  async onModuleInit() {
    const count = await this.rolesRepository.count();
    if (count === 0) {
      const rolesToSeed = [
        { name: 'ADMIN', description: "role for an admin user" },
        { name: 'SOCIO', description: "role for an socio user" },
      ];
      await this.rolesRepository.save(rolesToSeed);
    }
  }

  async findById(id: number) {
    return await this.rolesRepository.findOneBy({id})
  }
}
