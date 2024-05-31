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
      relations: ['user']
    })
    if(!parking){
      throw new NotFoundException(`parking not found`);
    }
    if(parking.name !== updateParkingDto.name) {
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
    const { userId, ...updateParkingData } = updateParkingDto;
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

  async findAll(user: Payload){
    let parkings: Parking[];

  if (user.role === RoleEnum.ADMIN) {
    parkings = await this.parkingsRepository.find({
      relations: ['user'],
    });
  } else {
    parkings = await this.parkingsRepository.find({
      where: { user: { id: Number(user.sub) } },
      relations: ['user'],
    });
  }

  return parkings.map(parking => ({
    id: parking.id,
    name: parking.name,
    capacity: parking.capacity,
    costPerHour: parking.costPerHour,
    userEmail: parking.user ? parking.user.email : null,
  }));
  }
}
