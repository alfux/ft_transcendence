import { Injectable } from '@nestjs/common';
import { authenticator } from 'otplib';
const speakeasy = require('speakeasy');
import {toDataURL} from 'qrcode';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/service/user/user.service';
@Injectable()
export class TwoFactorAuthenticationService {
    constructor(private userService: UserService){}
    async generateSecret(userEmail: string) {
        const user = await this.userService.provideUserByEmail(userEmail);
    
        if (!user) {
          throw new Error(`User with email ${userEmail} not found`);
        }
    
        // Generate a secret key for two-factor authentication
        const secret = speakeasy.generateSecret();
        
        // Create an OTP URL
        const otpUrl = authenticator.keyuri(user.email, '42FA', secret.base32);
    
        // Update the user's secret in the database
        await this.userService.userUpdateTwoFactorSecret(user, secret.base32);
    
        
        return {
          secret: secret.base32,
          otpUrl,
        };
      }
    
    async generateQrCode(optUrl: string){
        return toDataURL(optUrl)
    }

    generateToken(secret:string){
      return speakeasy.totp({
        secret,
        encoding: 'base32',
      })
    }

    verifyTwoFactorAuthCode(secret :string, token:string){
      return speakeasy.totp.verify({
        secret,
        encoding: 'base32',
        token,
        window: 1, 
    })
    }

}
