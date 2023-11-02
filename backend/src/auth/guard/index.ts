import { ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";
import { Observable } from "rxjs";

@Injectable()
export class Auth42Guard extends AuthGuard('FortyTwoStrategy'){

    constructor(private readonly reflector: Reflector){
        super();
    }
    
    async canActivate(context: ExecutionContext): Promise<any>{
        const activate = (await super.canActivate(context)) as boolean;
        console.log(activate)
        const request = context.switchToHttp().getRequest();
        console.log(request)
        await super.logIn(request);
        return activate
    }
}