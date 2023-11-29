import { Injectable, Req, Res, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { response } from 'express';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/service/user/user.service';
import { TwoFactorAuthenticationService } from '../two-factor-authentication/two-factor-authentication.service';

@Injectable()
export class AuthService {
    constructor(private readonly configService:ConfigService, private userService: UserService, private jwtService :JwtService, twoFactorAuthService: TwoFactorAuthenticationService){
    }

    //checks if user exist else create new one and return tokens
    async login(@Req() request, @Res() response) : Promise<any>{
        if (!await this.userService.provideUserByEmail(request.user.emails[0].value)){
            const user = this.userService.provideNewUser(request.user);
            console.log('user: ', (await user).firstName, "twofactor: ", (await user).twoFactorAuth)
        }
        else{
            console.log('user already exist')
        }
        const tokens = await this.generateTokens(request.user.id, request.user.email)
        return tokens;
        
    }
    //delete tokens
    async logout(@Req() request, @Res() response) : Promise<any | null>{
        console.log('Logging out...');
        const accessTokenExists = 'access_token' in request.cookies;
        const refreshTokenExists = 'refresh_token' in request.cookies;
        if (accessTokenExists && refreshTokenExists){
            response.clearCookie('access_token');
            response.clearCookie('refresh_token');
            console.log('Cookies cleared.');
            return await this.userService.provideUserByEmail(request.user.email);
        }
        return null
    }
    async isJwtValid(token:any){
        try{
            console.log('valid access tokken')
            return await this.jwtService.verify(token)
        }
        catch(error){
            console.log('invalid access tokken')
            return null
        }
    }
    //Generate access token and refresh token
    async generateTokens(id:string, email:string){
        const user = await this.userService.provideUserByEmail(email)
        if (!user){
            console.log(email)
            console.log("error")
            throw new UnauthorizedException('User not found.');
        }
        const auth = user.twoFactorAuth;
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(
                {
                    sub: id,
                    email,
                    isTwoFactorAuthEnable: auth,
                },
                {
                    secret: this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
                    expiresIn: '1m',
                }
            ),
            this.jwtService.signAsync(
                {
                    sub: id,
                    email,
                },
                {
                    secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
                    expiresIn: '7d',
                }
            ),
        ]);
        return {accessToken, refreshToken}
    }

    async newAccessToken(@Req() request){
        const user = await this.userService.provideUserByEmail(request.user.email)
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(
                {
                    sub: request.user.id,
                    email: request.user.email,
                    isTwoFactorAuthEnable: user.twoFactorAuth,
                },
                {
                    secret: this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
                    expiresIn: '30s',
                }
            ),
            this.jwtService.signAsync(
                {
                    sub: request.user.id,
                    email: request.user.email,
                },
                {
                    secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
                    expiresIn: '7d',
                }
            ),
        ]);
        return {accessToken, refreshToken}
    }
}
