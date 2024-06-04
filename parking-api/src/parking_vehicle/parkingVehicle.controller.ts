import { Controller, Get, Post, Body, Param, Req, Patch } from '@nestjs/common';
import { ParkingVehicleService } from './parkingVehicle.service';
import { CreateParkingVehicleDto } from './dto/create-parking_vehicle.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { RoleEnum } from 'src/common/enums/role.enum';
import { Payload } from 'src/common/interfaces/payload';
import { AuthUser } from 'src/auth/decorators/auth-user.decorator';

@Controller('parking-vehicle')
export class ParkingVehicleController {
  constructor(private readonly parkingVehicleService: ParkingVehicleService) {}
  @Auth(RoleEnum.SOCIO)
  @Post('register-entry')
  registerEntry(@Body() createParkingVehicleDto: CreateParkingVehicleDto, @AuthUser() user: Payload) {
    return this.parkingVehicleService.registerEntry(createParkingVehicleDto, user);
  }

  @Auth(RoleEnum.ADMIN, RoleEnum.SOCIO)
  @Get('parking/:id/vehicle')
  findAllVehiclesInParking(@Param('id') id: number, @AuthUser() user: Payload) {
    return this.parkingVehicleService.findAllVehiclesInParking(id, user);
  }

  @Auth(RoleEnum.SOCIO)
  @Patch('register-departure')
  registerDeparture(@Body() createParkingVehicleDto: CreateParkingVehicleDto, @AuthUser() user: Payload) {
    return this.parkingVehicleService.registerDeparture(createParkingVehicleDto, user);
  }
}
