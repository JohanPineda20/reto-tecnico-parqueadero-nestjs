import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { RoleEnum } from 'src/common/enums/role.enum';

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
        { name: RoleEnum.ADMIN, description: "role for an admin user" },
        { name: RoleEnum.SOCIO, description: "role for an socio user" },
      ];
      await this.rolesRepository.save(rolesToSeed);
    }
  }

  async findByName(name: RoleEnum) {
    return await this.rolesRepository.findOneBy({name})
  }
}
