import { ConflictException, HttpException, Injectable, Logger } from '@nestjs/common';
import { CreateParkingVehicleDto } from './dto/create-parking_vehicle.dto';
import { Payload } from 'src/common/interfaces/payload';
import { ParkingVehicle } from './entities/parkingVehicle.entity';
import { IsNull, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { RoleEnum } from 'src/common/enums/role.enum';
import { ParkingsService } from 'src/parkings/parkings.service';
import { VehiclesService } from 'src/vehicles/vehicles.service';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ParkingVehicleService {
  private readonly logger = new Logger(ParkingVehicleService.name);
  constructor(
    @InjectRepository(ParkingVehicle)
    private readonly parkingVehiclesRepository: Repository<ParkingVehicle>,
    private readonly parkingsService: ParkingsService,
    private readonly vehiclesService: VehiclesService,
    private readonly httpService: HttpService,
  ) {}
  async registerEntry(createParkingVehicleDto: CreateParkingVehicleDto, user:Payload) {
    const parking = await this.parkingsService.findOne(createParkingVehicleDto.parkingId);
    if (user.role === RoleEnum.SOCIO && user.username !== parking.ownerEmail) {
      throw new ConflictException('user is not a socio of the parking')
    }

    let vehicle = await this.vehiclesService.findByLicensePlate(createParkingVehicleDto.licensePlate);
    if(vehicle && await this.parkingVehiclesRepository.findOne({where: {vehicle:{id: vehicle.id}, departureDate: IsNull()}})) {
        throw new ConflictException('vehicle is already in the parking')
    }

    const parkingVehicles = await this.parkingVehiclesRepository.find({where: {parking: {id: createParkingVehicleDto.parkingId}, departureDate: IsNull()}});
    if(parking.capacity - parkingVehicles.length <= 0) throw new ConflictException('Parking is full');

    if(!vehicle) {
        vehicle = await this.vehiclesService.save(createParkingVehicleDto.licensePlate);
    }
    const parkingVehicle = await this.parkingVehiclesRepository.save({
      parking,
      vehicle,
      entryDate: new Date()
    });
    return {id: parkingVehicle.id};
  }

  async findAllVehiclesInParking(id: number, user: Payload) {
    const parking = await this.parkingsService.findOne(id);
    if (user.role === RoleEnum.SOCIO && user.username !== parking.ownerEmail) {
      throw new ConflictException('user is not a socio of the parking')
    }
    const parkingVehicles = await this.parkingVehiclesRepository.find({
      where: {
        parking: { id },
        departureDate: IsNull()
      },
      relations: ['vehicle'],
    });
    return parkingVehicles.map(parkingVehicle => ({
      vehicleId: parkingVehicle.vehicle.id,
      licensePlate: parkingVehicle.vehicle.licensePlate,
      entryDate: parkingVehicle.entryDate
    }));
  }
  async registerDeparture(createParkingVehicleDto: CreateParkingVehicleDto, user:Payload) {
    const parking = await this.parkingsService.findOne(createParkingVehicleDto.parkingId);
    if (user.role === RoleEnum.SOCIO && user.username !== parking.ownerEmail) {
      throw new ConflictException('user is not a socio of the parking')
    }

    const vehicle = await this.vehiclesService.findByLicensePlate(createParkingVehicleDto.licensePlate);
    if(!vehicle) {
        throw new ConflictException('vehicle is not in the parking')
    }
    const parkingVehicle = await this.parkingVehiclesRepository.findOne({where: {vehicle: {id: vehicle.id}, parking: {id: parking.id}, departureDate: IsNull()}});
    if(!parkingVehicle) throw new ConflictException('vehicle is not in the parking');

    const entryDate = parkingVehicle.entryDate
    const departureDate = new Date();
    const hours = (departureDate.getTime() - entryDate.getTime()) / (1000*60*60)
    const payment = hours * parking.costPerHour;

    parkingVehicle.departureDate = departureDate;
    parkingVehicle.payment = payment;

    await this.parkingVehiclesRepository.save(parkingVehicle)

    try {
        await firstValueFrom(this.httpService.post('http://localhost:3001/api/email',{email: parking.ownerEmail, licensePlate: vehicle.licensePlate, message: `vehiculo ${vehicle.licensePlate} salió del parqueadero ${parking.name}` }))
        this.logger.log("message sent")
    }catch (err) {
        this.logger.error("email-api error: " + err.message)
    }

    return {mensaje: "salida registrada"}
  }
}
