import { Controller, Get, Param, Query, Req } from "@nestjs/common";
import { ParkingVehicleService } from "./parkingVehicle.service";
import { Auth } from "src/auth/decorators/auth.decorator";
import { RoleEnum } from "src/common/enums/role.enum";
import { Request } from "express";
import { Payload } from "src/common/interfaces/payload";
import { AuthUser } from "src/auth/decorators/auth-user.decorator";

@Controller('metrics')
export class MetricsController {
    constructor(private readonly parkingVehicleService: ParkingVehicleService) {}
    @Auth(RoleEnum.ADMIN, RoleEnum.SOCIO)
    @Get('top-10-most-parked-vehicles')
    findTop10MostParkedVehicles(@AuthUser() user: Payload){
       return this.parkingVehicleService.findTop10MostParkedVehicles(user)
    }
    @Auth(RoleEnum.ADMIN, RoleEnum.SOCIO)
    @Get('top-10-most-parked-vehicles/parking/:id')
    findTop10MostParkedVehiclesByParking(@Param('id') id: number, @AuthUser() user: Payload){
       return this.parkingVehicleService.findTop10MostParkedVehiclesByParking(id, user)
    }
    @Auth(RoleEnum.ADMIN, RoleEnum.SOCIO)
    @Get('first-time-parked-vehicles/parking/:id')
    findFirstTimeParkedVehiclesByParking(@Param('id') id: number, @AuthUser() user: Payload){
       return this.parkingVehicleService.findFirstTimeParkedVehiclesByParking(id, user)
    }
    @Auth(RoleEnum.ADMIN, RoleEnum.SOCIO)
    @Get('vehicle')
    findVehicleByLicensePlate(@Query('licensePlate') licensePlate: string, @AuthUser() user: Payload){
       return this.parkingVehicleService.findVehicleByLicensePlate(licensePlate, user)
    }
    @Auth(RoleEnum.SOCIO)
    @Get('cash-income/parking/:id')
    findCashIncomeByParking(@Param('id') id: number, @AuthUser() user: Payload){
       return this.parkingVehicleService.findCashIncomeByParking(id, user)
    }
}