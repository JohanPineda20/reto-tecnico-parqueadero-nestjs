import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, ParseIntPipe, Query } from '@nestjs/common';
import { ParkingsService } from './parkings.service';
import { CreateParkingDto } from './dto/create-parking.dto';
import { UpdateParkingDto } from './dto/update-parking.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { RoleEnum } from 'src/common/enums/role.enum';
import { Payload } from 'src/common/interfaces/payload';
import { AuthUser } from 'src/auth/decorators/auth-user.decorator';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { PaginationRequestDto } from 'src/common/dto/pagination.request.dto';
@ApiUnauthorizedResponse()
@ApiTags('parkings')
@ApiBearerAuth()
@Controller('parkings')
export class ParkingsController {
  constructor(private readonly parkingsService: ParkingsService) {}
  @Auth(RoleEnum.ADMIN)
  @Post()
  create(@Body() createParkingDto: CreateParkingDto) {
    return this.parkingsService.create(createParkingDto);
  }

  @Auth(RoleEnum.ADMIN)
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateParkingDto: UpdateParkingDto) {
    return this.parkingsService.update(id, updateParkingDto);
  }
  @ApiOperation({ summary: 'Delete a parking by ID' })
  @ApiResponse({ status: 204, description: 'Parking deleted successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid parameter.' })
  @ApiResponse({ status: 404, description: 'Parking not found.' })
  @Auth(RoleEnum.ADMIN)
  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.parkingsService.remove(id);
  }

  @Auth(RoleEnum.ADMIN)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.parkingsService.findOne(id);
  }
  @Auth(RoleEnum.ADMIN, RoleEnum.SOCIO)
  @Get()
  findAll(@AuthUser() user: Payload, 
  @Query() pagination: PaginationRequestDto) {
    return this.parkingsService.findAll(user, pagination);
  }
}
