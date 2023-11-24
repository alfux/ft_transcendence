import { Body, Controller, Get, HttpCode, HttpStatus, Post, Redirect, Req, Request, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { sign } from 'crypto';
import { Auth42Guard } from 'src/auth/guard';
import { JwtAccessTokenGuard } from 'src/auth/guard/jwtAcessToken.guard';
import { AuthService } from 'src/auth/service/auth/auth.service';
import { UserDto } from 'src/user/dto/user.dto';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/service/user/user.service';

@Controller()
export class AuthController {
    constructor(private authService: AuthService, private userService: UserService){

    }

    @UseGuards(Auth42Guard)
    @Get('/auth/login')
    async login(@Req() request, @Res() response){
        return await this.authService.login(request, response);
    }
    
    @UseGuards(Auth42Guard)
    @Get('/callback')
    async callback(@Req() request, @Res() response) {
		console.log('________LOGIN_______')
        const tokens = await this.authService.login(request, response);
        response.cookie('refresh_token', tokens.refreshToken, { httpOnly: true, sameSite: 'None', secure: true });
        response.cookie('access_token', tokens.accessToken, { httpOnly: false, sameSite: 'None', secure: true });
        response.redirect('http://localhost:3000')
    }
    
    
    @Get('/test')
    async success(){
         return 'hello'
        // if (request.cookies && 'access_token' in request.cookies){
        //     console.log('access token: ', request.cookies.access_token)
        //     const token = request.cookies.access_token;
        //     this.authService.isJwtValid(token)
        // }
        // const test = await this.userService.provideUserByEmail(request.user.email)
        // console.log(test)
        // response.redirect(test)
    //  this.userService.provideUserByEmail(request.cookie('access_token'))  
    }

    @UseGuards(JwtAccessTokenGuard)
    @Get('/auth/logout')
    async logout(@Req() request, @Res() response){
		console.log('________LOGOUT_______')
        const test = await this.authService.logout(request, response)
		console.log(test)
        response.status(200).json(test)
        
    }
    
}