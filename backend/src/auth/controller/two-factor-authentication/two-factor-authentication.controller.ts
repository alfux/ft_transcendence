import { Body, Controller, Get, Post, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtAccessTokenGuard } from 'src/auth/guard/jwtAcessToken.guard';
import { AuthService } from 'src/auth/service/auth/auth.service';
import { TwoFactorAuthenticationService } from 'src/auth/service/two-factor-authentication/two-factor-authentication.service';
import { UserService } from 'src/user/service/user/user.service';
const speakeasy = require('speakeasy');
@Controller('2fa')
export class TwoFactorAuthenticationController {
    constructor(private jwtService: JwtService, private twoFactorAuthenticationService:TwoFactorAuthenticationService, private readonly userService: UserService,  private authService : AuthService){
   }
   @UseGuards(JwtAccessTokenGuard)
    @Post('authenticate')
    async authenticateTwoFactor(@Req() request, @Body() body){
        const user = await this.userService.provideUserById(request.user.id)
        const secret = user.twoFactorAuthSecret;
        //this can be used to send to email
        const token = this.twoFactorAuthenticationService.generateToken(secret)
        try {
            const isCodeValid = this.twoFactorAuthenticationService.verifyTwoFactorAuthCode(
                secret,
                body.verificationCode
            );
            console.log("Secret: ",token, "Verification code: ", body.verificationCode)
            if (!isCodeValid) {
                throw new UnauthorizedException('Wrong authentication code');
            }
        } catch (error) {
            // Log the error
            console.error('Error in enableTwoFactorAuth:', error);
            
            // Re-throw the error to maintain the original behavior (returning a 401 response)
            throw new UnauthorizedException('Wrong authentication codee');
        }
        await this.userService.updateLogStatus(user.id,"Complete")
        return "authenticated"
    }
@UseGuards(JwtAccessTokenGuard)
    @Post('enable')
    async enableTwoFactorAuth(@Req() request, @Body() body){
        const user = this.userService.provideUserById(request.user.id)
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
        return await this.userService.enableTwoFactorAuth(request.user.id);
        
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
        console.log('disabled')
        response.send(await this.userService.disableTwoFactorAuth(request.user.id))
        // response.clearCookie('access_token')

        //const tokens = await this.authService.generateTokens(request.user.id, request.email);
        //response.cookie('refresh_token', tokens.refreshToken, { httpOnly: true, sameSite: 'None', secure: true });
        //response.cookie('access_token', tokens.accessToken, { httpOnly: false, sameSite: 'None', secure: true });
    }
    @UseGuards(JwtAccessTokenGuard)
    @Get('status')
    async twoFactorAuthStatus(@Req() request){
        const user = this.userService.provideUserById(request.user.id)
		console.log("sending to front",(await user).twoFactorAuth)
        return (await user).twoFactorAuth ? true : false
    }
}
