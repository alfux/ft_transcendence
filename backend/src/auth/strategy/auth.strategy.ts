import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import Strategy from "passport-42";
import { UserService } from "src/user/service/user/user.service";
import { AuthService } from "../service/auth/auth.service";
import { VerifiedCallback } from "passport-jwt";


@Injectable()
export class AuthStrategy extends PassportStrategy(Strategy,'FortyTwoStrategy'){
    constructor(private readonly configService : ConfigService, private readonly authService: AuthService){
        super({
            clientID: configService.get<string>('FORTYTWO_CLIENT_ID'),
            clientSecret: configService.get<string>('FORTYTWO_CLIENT_SECRET'),
            callbackURL:'http://localhost:3001/callback'
            }
    ,)
    };

    async validate(accessToken: string, refreshToken: string, profile: any, done: VerifiedCallback) {
        if(!accessToken){
            return done(null, false);
        }
        done(null,profile)
    }
}

