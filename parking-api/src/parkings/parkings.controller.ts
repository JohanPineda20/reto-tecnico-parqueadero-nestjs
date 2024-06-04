import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, Req } from '@nestjs/common';
import { ParkingsService } from './parkings.service';
import { CreateParkingDto } from './dto/create-parking.dto';
import { UpdateParkingDto } from './dto/update-parking.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { RoleEnum } from 'src/common/enums/role.enum';
import { Request } from 'express';
import { Payload } from 'src/common/interfaces/payload';
import { AuthUser } from 'src/auth/decorators/auth-user.decorator';

@Controller('parkings')
export class ParkingsController {
  constructor(private readonly parkingsService: ParkingsService) {}
  @Auth(RoleEnum.ADMIN)
  @Post()
  create(@Body() createParkingDto: CreateParkingDto) {
    return this.parkingsService.create(createParkingDto);
  }

  @Auth(RoleEnum.ADMIN)
  @Patch(':id')
  update(@Param('id') id: number, @Body() updateParkingDto: UpdateParkingDto) {
    return this.parkingsService.update(id, updateParkingDto);
  }

  @Auth(RoleEnum.ADMIN)
  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: number) {
    return this.parkingsService.remove(id);
  }

  @Auth(RoleEnum.ADMIN)
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.parkingsService.findOne(id);
  }
  @Auth(RoleEnum.ADMIN, RoleEnum.SOCIO)
  @Get()
  findAll(@AuthUser() user: Payload) {
    return this.parkingsService.findAll(user);
  }
}
