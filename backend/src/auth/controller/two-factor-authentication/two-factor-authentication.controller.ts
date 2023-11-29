import { Body, Controller, Get, Post, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtAccessTokenGuard } from 'src/auth/guard/jwtAcessToken.guard';
import { AuthService } from 'src/auth/service/auth/auth.service';
import { TwoFactorAuthenticationService } from 'src/auth/service/two-factor-authentication/two-factor-authentication.service';
import { UserService } from 'src/user/service/user/user.service';
const speakeasy = require('speakeasy');
@Controller('2fa')
export class TwoFactorAuthenticationController {
    constructor(private jwtService: JwtService, private twoFactorAuthenticationService:TwoFactorAuthenticationService, private readonly user: UserService,  private authService : AuthService){
   }
    @Post('authenticate')
    async enableTwoFactorAuthentication(@Req() request, @Body() body){
        const isCodeValid = this.twoFactorAuthenticationService.verifyTwoFactorAuthCode(
            body.twoFactorAuthenticationCode,
            request.user.twoFactorAuthSecret
            )
        if (!isCodeValid){
            throw new UnauthorizedException('Wrong authentication code');
        }
        const payload = {
            email: request.user.email,
            isTwoFactorAuthenticationEnabled: !!request.user.twoFactorAuth,
            isTwoFactorAuthenticated: true,
          };
      
          return {
            email: payload.email,
            access_token: this.jwtService.sign(payload),
          };
    }
@UseGuards(JwtAccessTokenGuard)
    @Post('enable')
    async enableTwoFactorAuth(@Req() request, @Body() body){
        const user = this.user.provideUserById(request.user.id)
        //test
        const secret = (await user).twoFactorAuthSecret
        const token = this.twoFactorAuthenticationService.generateToken(secret)
        console.log('token', token, '\n', 'body token ', body.verificationCode)
        try {
            const isCodeValid = this.twoFactorAuthenticationService.verifyTwoFactorAuthCode(
                secret,
                body.verificationCode
            );
            if (!isCodeValid) {
                throw new UnauthorizedException('Wrong authentication code');
            }
        } catch (error) {
            // Log the error
            console.error('Error in enableTwoFactorAuth:', error);
            
            // Re-throw the error to maintain the original behavior (returning a 401 response)
            throw new UnauthorizedException('Wrong authentication codee');
        }
        return await this.user.enableTwoFactorAuth(request.user.id);
        
    }

    @UseGuards(JwtAccessTokenGuard)
    @Get('generate')
    async generate(@Req() request){
        const result  =  await this.twoFactorAuthenticationService.generateSecret(request.user.email)
        const otpUrl = result.otpUrl
        const qrcode = await this.twoFactorAuthenticationService.generateQrCode(otpUrl)
        return qrcode
    }
    @UseGuards(JwtAccessTokenGuard)
    @Post('disable')
    async disableTwoFactorAuth(@Req() request, @Res() response){
        console.log(request.user)
        //await this.user.disableTwoFactorAuth(request.user.id)
        response.clearCookie('access_token')
        console.log('cookie cleared')
        //const tokens = await this.authService.generateTokens(request.user.id, request.email);
        //response.cookie('refresh_token', tokens.refreshToken, { httpOnly: true, sameSite: 'None', secure: true });
        //response.cookie('access_token', tokens.accessToken, { httpOnly: false, sameSite: 'None', secure: true });
    }
    @UseGuards(JwtAccessTokenGuard)
    @Get('status')
    async twoFactorAuthStatus(@Req() request){
        const user = this.user.provideUserById(request.user.id)
        return (await user).twoFactorAuth ? 'enabled' : 'disabled'
    }
}
