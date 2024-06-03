import { Module } from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { Vehicle } from './entities/vehicle.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports:[TypeOrmModule.forFeature([Vehicle])],
  providers: [VehiclesService],
  exports: [VehiclesService]
})
export class VehiclesModule {}
