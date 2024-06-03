import { PartialType } from '@nestjs/mapped-types';
import { CreateParkingVehicleDto } from './create-parking_vehicle.dto';

export class UpdateParkingVehicleDto extends PartialType(CreateParkingVehicleDto) {}
