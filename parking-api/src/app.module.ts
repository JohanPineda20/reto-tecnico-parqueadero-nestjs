import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesModule } from './roles/roles.module';
import { AuthModule } from './auth/auth.module';
import { ParkingsModule } from './parkings/parkings.module';
import { VehiclesModule } from './vehicles/vehicles.module';
import { ParkingVehicleModule } from './parking_vehicle/parkingVehicle.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
    type: 'mysql',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    autoLoadEntities: true,
    synchronize: true,
    logging: true
  }), 
  UsersModule, 
  RolesModule, 
  AuthModule, 
  ParkingsModule, 
  VehiclesModule, 
  ParkingVehicleModule],
})
export class AppModule {}
