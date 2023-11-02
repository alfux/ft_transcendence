import { Body, Controller, Get, HttpCode, HttpStatus, Post, Redirect, Req, Request, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { sign } from 'crypto';
import { Auth42Guard } from 'src/auth/guard';
import { AuthService } from 'src/auth/service/auth/auth.service';
import { JwtAuthGuard } from 'src/jwt/guard/jwt.guard';
import { UserDto } from 'src/user/dto/user.dto';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/service/user/user.service';

@Controller()
export class AuthController {
    constructor(private authService: AuthService, private userService: UserService){

    }
    @Get('/auth/login')
    @UseGuards(Auth42Guard)
    async login(@Req() request){
        return this.login(request.user)
    }

    @Get('/home')
    @UseGuards(Auth42Guard)
    async callback(@Req() request){
        //console.log(request.query.code)
        if (!this.userService.userExist(request.user.email)){
            this.userService.provideNewUser({firstName: request.user.displayName, email: request.user.email});
        }
        const token = await this.authService.logIn(request.user)
        request.set('authorization', token.access_token)
        request.json(request.user)
    }
}
