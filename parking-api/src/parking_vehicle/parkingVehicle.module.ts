import { Module } from '@nestjs/common';
import { ParkingVehicleService } from './parkingVehicle.service';
import { ParkingVehicleController } from './parkingVehicle.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParkingVehicle } from './entities/parkingVehicle.entity';
import { ParkingsModule } from 'src/parkings/parkings.module';
import { UsersModule } from 'src/users/users.module';
import { VehiclesModule } from 'src/vehicles/vehicles.module';
import { HttpModule } from '@nestjs/axios';
import { MetricsController } from './metrics.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ParkingVehicle]), 
            ParkingsModule, 
            UsersModule, 
            VehiclesModule, 
            HttpModule],
  controllers: [ParkingVehicleController, MetricsController],
  providers: [ParkingVehicleService],
})
export class ParkingVehicleModule {}
