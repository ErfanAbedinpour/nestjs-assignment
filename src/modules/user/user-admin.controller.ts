
import { Controller, Get, Body, Patch, Param, Delete, Put, ParseIntPipe, Query, Res, } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiForbiddenResponse, ApiNotFoundResponse, ApiOkResponse, ApiParam, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';

import { Role } from '../auth/decorator/role.decorator';
import { UserRole } from '../../entities/user.entity';
import { UserService } from './user.service';
import { HttpErrorDto } from '../../dto/error.dto';
import { CreateUserDto } from '../auth/dto/create-auth.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDto } from './dto/user.dto';
import { findAllQuery } from './dto/get-user.dto';
import { UpdateRoleDto } from './dto/update-role.dt';
import { Auth, AuthStrategy } from '../auth/decorator/auth.decorator';
import { getUser } from '../auth/decorator/getUser.decorator';
import { Response } from 'express';

@Controller("admin/user")
@Auth(AuthStrategy.Bearer)
@Role(UserRole.ADMIN)
@ApiUnauthorizedResponse({ description: "header is empty or token invalid", type: HttpErrorDto })
@ApiForbiddenResponse({ description: "route is protected", type: HttpErrorDto })
@ApiBearerAuth()
@Auth()
export class AdminController {

    constructor(private readonly userService: UserService) { }
    // admin permission
    // remove User Profile By Admin
    @Delete('profile/:filename')
    @ApiParam({ name: "filename", description: "name of file", example: "example.jpeg" })
    @ApiOkResponse({ description: "file Removed successfully", schema: { type: "object", properties: { msg: { type: "string" } } } })
    @ApiNotFoundResponse({ description: "file Not Found", type: HttpErrorDto })
    removeProfile(@Param('filename') filename: string) {
        return this.userService.removeFileName(filename);
    }

    @Patch(":id")
    @ApiOkResponse({
        description: "user Updated successfully", type: CreateUserDto
    })
    @ApiParam({ name: "id", description: "userid" })
    @ApiNotFoundResponse({ description: "user Not found", type: HttpErrorDto })
    @Role(UserRole.ADMIN)
    update(@Param('id', ParseIntPipe) userId: number, @Body() updateUserDto: UpdateUserDto) {
        return this.userService.update(userId, updateUserDto, true)
    }


    // get User List With Pagination
    @Get()
    @ApiOkResponse({ description: "users fetched successfully", type: [UserDto] })
    @ApiUnauthorizedResponse({ description: "you have not access to this route", type: HttpErrorDto })
    @Role(UserRole.ADMIN)
    findAll(@Query() query: findAllQuery) {
        return this.userService.findAll({ limit: query.limit, page: query.page }, query.sort, { username: query.username, email: query.email });
    }

    // get User By Id
    @Get(":id")
    @ApiParam({ name: 'id', description: "userId" })
    @ApiOkResponse({ description: "user fetched successfully", type: UserDto })
    @ApiNotFoundResponse({ description: "user Not found", type: HttpErrorDto })
    @ApiUnauthorizedResponse({ description: "you have not access to this route", type: HttpErrorDto })
    @Role(UserRole.ADMIN)
    findOne(@Param('userId', ParseIntPipe) id: number) {
        return this.userService.findOne(id);
    }

    // change User Role
    @Put(":id/role")
    @ApiOkResponse({ description: "user role updated ", type: UserDto })
    @ApiParam({ name: "id", description: "userId" })
    @ApiBody({ type: UpdateRoleDto })
    @ApiNotFoundResponse({ description: "user not found", type: HttpErrorDto })
    @ApiUnauthorizedResponse({ description: "you have not access to this route", type: HttpErrorDto })
    @Role(UserRole.ADMIN)
    changeRole(@Body() role: UpdateRoleDto, @Param('userId', ParseIntPipe) userId: number) {
        return this.userService.changeRole(role, userId)
    }

    // delete User
    @Delete(':id')
    @ApiParam({ name: "id", description: "userId" })
    @ApiOkResponse({ description: "user removed successfully", })
    @ApiNotFoundResponse({ description: "user not found", })
    @ApiUnauthorizedResponse({ description: "you have not access to this route", type: HttpErrorDto })
    @Role(UserRole.ADMIN)
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.userService.remove(id);
    }
}