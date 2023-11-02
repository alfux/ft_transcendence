import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { UserDto } from 'src/user/dto/user.dto';
import { UserService } from 'src/user/service/user/user.service';

@Controller('user')
export class UserController {
    constructor(private userService:UserService){}

    @Get('all')
    getAllUsers(){
        return this.userService.provideAllUsers()
    }

    @Get(':id')
    getUserById(@Param() id:string){
        return this.userService.provideUserById(id)
    }

    @Post()
    createUser(@Body() userDto : UserDto){
        return this.userService.provideNewUser(userDto)

    }

    @Patch(':id')
    updateUser(@Param() id:string){
        return this.userService.provideUserUpdate();
    }

    @Delete(':id')
    deleteUser(@Param() id:string){
        return this.userService.provideUserDelete(id);
    }
}
