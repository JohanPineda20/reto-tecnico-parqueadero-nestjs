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
import * as moment from 'moment';

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
    const parking = await this.isSocioParking(user, createParkingVehicleDto.parkingId)

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
    await this.isSocioParking(user, id)
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
    const parking = await this.isSocioParking(user, createParkingVehicleDto.parkingId)

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
        const res = await firstValueFrom(this.httpService.post(process.env.EMAIL_API_URL,{email: parking.ownerEmail, licensePlate: vehicle.licensePlate, message: `vehiculo ${vehicle.licensePlate} salió del parqueadero ${parking.name}` }))
        this.logger.log("message sent: " + JSON.stringify(res.data))
    }catch (err) {
        this.logger.error("email-api error: " + err.message)
    }

    return {mensaje: "salida registrada"}
  }
  async findTop10MostParkedVehicles(user: Payload) {
    if(user.role === RoleEnum.ADMIN) return await this.parkingVehiclesRepository.createQueryBuilder('pv')
      .select('pv.vehicle.id', 'vehicleId')
      .addSelect('v.licensePlate', 'licensePlate')
      .addSelect('COUNT(pv.vehicle.id)', 'count')
      .innerJoin('pv.vehicle', 'v')
      .groupBy('pv.vehicle.id')
      .addGroupBy('v.licensePlate')
      .orderBy('count', 'DESC')
      .limit(10)
      .getRawMany();
    return await this.parkingVehiclesRepository.createQueryBuilder('pv')
    .innerJoin('pv.parking', 'p')
    .innerJoin('pv.vehicle', 'v')
    .innerJoin('p.user', 'u')
    .select('pv.vehicle.id', 'vehicleId')
    .addSelect('v.licensePlate', 'licensePlate')
    .addSelect('COUNT(pv.vehicle.id)', 'count')
    .where('u.id = :socioId', { socioId: user.sub })
    .groupBy('pv.vehicle.id')
    .addGroupBy('v.licensePlate')
    .orderBy('count', 'DESC')
    .limit(10)
    .getRawMany();
  }
  async findTop10MostParkedVehiclesByParking(id: number, user: Payload) {
    await this.isSocioParking(user, id)
    return await this.parkingVehiclesRepository.createQueryBuilder('pv')
    .select('pv.vehicle.id', 'vehicleId')
    .addSelect('v.licensePlate', 'licensePlate')
    .addSelect('COUNT(pv.vehicle.id)', 'count')
    .innerJoin('pv.vehicle', 'v')
    .where('pv.parking.id = :parkingId', { parkingId: id })
    .groupBy('pv.vehicle.id')
    .addGroupBy('v.licensePlate')
    .orderBy('count', 'DESC')
    .limit(10)
    .getRawMany();
  }
  async findFirstTimeParkedVehiclesByParking(id: number, user: Payload) {
    await this.isSocioParking(user, id)
    return await this.parkingVehiclesRepository.createQueryBuilder('pv')
    .select('pv.vehicle.id', 'vehicleId')
    .addSelect('v.licensePlate', 'licensePlate')
    .innerJoin('pv.vehicle', 'v')
    .where('pv.parking.id = :parkingId', { parkingId: id })
    .groupBy('pv.vehicle.id')
    .addGroupBy('v.licensePlate')
    .having('COUNT(pv.vehicle.id) = 1')
    .getRawMany();
  }
  async findVehicleByLicensePlate(licensePlate: string, user: Payload) {
    if(user.role === RoleEnum.ADMIN) return await this.parkingVehiclesRepository.createQueryBuilder('pv')
      .select('pv.vehicle.id', 'vehicleId')
      .addSelect('v.licensePlate', 'licensePlate')
      .innerJoin('pv.parking', 'p')
      .innerJoin('pv.vehicle', 'v')
      .where('v.licensePlate LIKE :licensePlate', { licensePlate: `%${licensePlate}%` })
      .andWhere('pv.departureDate IS NULL')
      .getRawMany();
    return await this.parkingVehiclesRepository.createQueryBuilder('pv')
    .select('pv.vehicle.id', 'vehicleId')
    .addSelect('v.licensePlate', 'licensePlate')
    .innerJoin('pv.parking', 'p')
    .innerJoin('pv.vehicle', 'v')
    .innerJoin('p.user', 'u')
    .where('u.id = :socioId', { socioId: user.sub })
    .andWhere('v.licensePlate LIKE :licensePlate', { licensePlate: `%${licensePlate}%` })
    .andWhere('pv.departureDate IS NULL')
    .getRawMany();
  }
  async findCashIncomeByParking(id: number, user: Payload) {
    await this.isSocioParking(user, id)
    const date = moment();
    const today = date.format("yyyy-MM-DD")
    const week = date.week() - 1
    const month = date.month() + 1
    const year = date.year()

    const today1 = await await this.parkingVehiclesRepository.createQueryBuilder('pv')
    .select('SUM(pv.payment)', 'totalPayment')
    .where('pv.parking.id = :parkingId', { parkingId: id })
    .andWhere('DATE(pv.departureDate) = :today', { today })
    .getRawOne();

    const week1 = await this.parkingVehiclesRepository.createQueryBuilder('pv')
    .select('SUM(pv.payment)', 'totalPayment')
    .where('pv.parking.id = :parkingId', { parkingId: id })
    .andWhere('WEEK(pv.departureDate) = :week', { week })
    .andWhere('YEAR(pv.departureDate) = :year', { year })
    .getRawOne();

    const month1 = await this.parkingVehiclesRepository.createQueryBuilder('pv')
    .select('SUM(pv.payment)', 'totalPayment')
    .where('pv.parking.id = :parkingId', { parkingId: id })
    .andWhere('MONTH(pv.departureDate) = :month', { month })
    .andWhere('YEAR(pv.departureDate) = :year', { year })
    .getRawOne();

    const year1 = await this.parkingVehiclesRepository.createQueryBuilder('pv')
    .select('SUM(pv.payment)', 'totalPayment')
    .where('pv.parking.id = :parkingId', { parkingId: id })
    .andWhere('YEAR(pv.departureDate) = :year', { year })
    .getRawOne();
 
    return {
      today: today1?.totalPayment ?? 0,
      week: week1?.totalPayment?? 0,
      month: month1?.totalPayment?? 0,
      year: year1?.totalPayment?? 0,
    }
  }
    
  private async isSocioParking(user: Payload, id: number){
    const parking = await this.parkingsService.findOne(id);
    if (user.role === RoleEnum.SOCIO && user.username !== parking.ownerEmail) {
      throw new ConflictException('user is not a socio of the parking')
    }
    return parking;
  }
}
