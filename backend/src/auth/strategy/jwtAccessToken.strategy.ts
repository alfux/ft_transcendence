import { Injectable, Req } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";


type JwtPayload = {
    sub: string;
    email:string
}

@Injectable()
export class JwtAccessTokenStrategy extends PassportStrategy(Strategy,'jwt'){
    constructor(private readonly configService: ConfigService){
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                ExtractJwt.fromAuthHeaderAsBearerToken(),
                JwtAccessTokenStrategy.extractJwtCookie
            ]),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
        })
    }

    private static extractJwtCookie(@Req() request):string | null{
        if (request.cookies && 'access_token' in request.cookies){
            console.log('access token: ', request.cookies.access_token)
            return request.cookies.access_token;
        }
        console.log('no token found')
        return null;
    }

    validate(payload: JwtPayload){
        return payload
    }
}