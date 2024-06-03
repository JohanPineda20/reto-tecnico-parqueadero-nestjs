import { Injectable } from '@nestjs/common';
import { Vehicle } from './entities/vehicle.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class VehiclesService {
    constructor(
        @InjectRepository(Vehicle)
        private readonly vehiclesRepository: Repository<Vehicle>){}
  findByLicensePlate(licensePlate: string) {
    return this.vehiclesRepository.findOne({where: {licensePlate}})
  }
  save(licensePlate: string) {
    return this.vehiclesRepository.save({licensePlate})
  }
}
