import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, UseGuards } from '@nestjs/common';
import { User, UserRole } from '@prisma/client';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UpdateActiveDto } from './dto/update-active.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Patch(':id/role')
  @Roles(UserRole.ADMIN)
  updateRole(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateRoleDto): Promise<User> {
    return this.usersService.updateRole(id, dto.role);
  }

  @Patch(':id/active')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  setActive(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateActiveDto): Promise<User> {
    return this.usersService.setActive(id, dto.isActive);
  }
}
