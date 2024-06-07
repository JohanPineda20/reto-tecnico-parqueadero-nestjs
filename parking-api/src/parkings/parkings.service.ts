import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateParkingDto } from './dto/create-parking.dto';
import { UpdateParkingDto } from './dto/update-parking.dto';
import { Repository } from 'typeorm';
import { Parking } from './entities/parking.entity';
import { UsersService } from 'src/users/users.service';
import { RoleEnum } from 'src/common/enums/role.enum';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Payload } from 'src/common/interfaces/payload';
import { PaginationRequestDto } from 'src/common/dto/pagination.request.dto';

@Injectable()
export class ParkingsService {
  constructor(
    @InjectRepository(Parking)
    private readonly parkingsRepository: Repository<Parking>,
    private readonly usersService: UsersService
  )
  {}
  async create(createParkingDto: CreateParkingDto) {
    const parking = await this.parkingsRepository.findOneBy({name: createParkingDto.name})
    if(parking){
      throw new ConflictException(`parking already exists with name: ${createParkingDto.name}`);
    }
    const user = await this.usersService.findOneById(createParkingDto.userId);
    if (user.role.name !== RoleEnum.SOCIO){
      throw new ConflictException(`user is not a socio`);
    }
    const { user: { email }, ...parkingSaved} = await this.parkingsRepository.save({
      name: createParkingDto.name,
      capacity: createParkingDto.capacity,
      costPerHour: createParkingDto.costPerHour,
      user
    });
    
    return { ...parkingSaved, ownerEmail: email };
  }

  async update(id: number, updateParkingDto: UpdateParkingDto) {
    const parking = await this.parkingsRepository.findOne({
      where: { id },
      relations: ['user','parkingVehicles']
    })
    if(!parking){
      throw new NotFoundException(`parking not found`);
    }
    if(updateParkingDto.name && parking.name !== updateParkingDto.name) {
      const parking1 = await this.parkingsRepository.findOneBy({name: updateParkingDto.name})
      if(parking1){
        throw new ConflictException(`parking already exists with name: ${updateParkingDto.name}`);
      }
    }

    let user: User;
    if (updateParkingDto.userId) {
      user = await this.usersService.findOneById(updateParkingDto.userId);
      if(user.role.name !== RoleEnum.SOCIO){
        throw new ConflictException(`user is not a socio`);
      }
    }
    const vehiclesInParking = parking.parkingVehicles.filter(parkingVehicle => parkingVehicle.departureDate === null);
    if(updateParkingDto.capacity < vehiclesInParking.length ) throw new ConflictException(`capacity must be greater than or equal to the number of vehicles currently parked: ${vehiclesInParking.length}`)
    const {userId, ...updateParkingData } = updateParkingDto;
    delete parking.parkingVehicles;
    const updatedParking = this.parkingsRepository.merge(parking, updateParkingData, user ? {user} : {})
    const {user:{email}, ...updatedParkingData} = await this.parkingsRepository.save(updatedParking);
    return {...updatedParkingData, ownerEmail: email}
  }

  async remove(id: number) {
    await this.findOne(id);
    this.parkingsRepository.delete(id);
  }

  async findOne(id: number) {
    const parking = await this.parkingsRepository.findOne({
      where: { id },
      relations: ['user']
    })
    if(!parking){
      throw new NotFoundException(`parking not found`);
    }
    const { user, ...parkingSaved } = parking;
    return { ...parkingSaved, ownerEmail: user.email};
  }

  async findAll(user: Payload, pagination: PaginationRequestDto) {
    const page = pagination.page;
    const size = pagination.size;
    let parkingsPagination: [Parking[], number];

  if (user.role === RoleEnum.ADMIN) {
    parkingsPagination = await this.parkingsRepository.findAndCount({
      skip: (page - 1) * size,
      take: size,
      relations: ['user']
    });
  } else {
    parkingsPagination = await this.parkingsRepository.findAndCount({
      skip: (page - 1) * size,
      take: size,
      where: { user: { id: Number(user.sub) } },
      relations: ['user'],
    });
  }
    const [data, totalElements] = parkingsPagination;
    const totalPages = Math.ceil(totalElements / size);
    const isFirstPage = page === 1;
    const isLastPage = page === totalPages;

    const parkings = data.map(parking => ({
      id: parking.id,
      name: parking.name,
      capacity: parking.capacity,
      costPerHour: parking.costPerHour,
      userEmail: parking.user ? parking.user.email : null,
    }));

  return {
    parkings,
    page,
    size,
    totalElements,
    totalPages,
    isFirstPage,
    isLastPage,
  };
  }
}
