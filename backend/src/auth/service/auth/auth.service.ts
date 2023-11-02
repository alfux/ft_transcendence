import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/service/user/user.service';

@Injectable()
export class AuthService {
    constructor(private userService: UserService, private jwtService :JwtService){
    }
    async validateUser(email:string) : Promise<User | undefined>{
        return this.userService.findByEmail(email)
    }
    async logIn(user:any) : Promise<any>{
        //const user = await this.userService.provideUserById()
        const payload = {username:user.username, sub: user.userId}
        return {access_token: await this.jwtService.signAsync(payload)};
    }
}
