import { Controller, Post, Body} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { RoleEnum } from 'src/common/enums/role.enum';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @ApiBearerAuth()
  @ApiUnauthorizedResponse()
  @ApiOperation({
    summary: 'Add a new socio user',
    description: 'Admin user is allowed to create a new socio user.',
  })
  @ApiResponse({
    status: 201,
    description: 'User created',
    type: CreateUserDto,
  })
  @ApiResponse({
    status: 400,
    description: 'UserRequest bad request',
  })
  @ApiResponse({
    status: 404,
    description: 'Role not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Operation not allowed: User already exists',
  })
  @Auth(RoleEnum.ADMIN)
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }
}
