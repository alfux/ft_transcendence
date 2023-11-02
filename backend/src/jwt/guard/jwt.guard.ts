import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Observable } from "rxjs";
import { jwtConstants } from "src/auth/utils/constants";
import * as jwt from 'jsonwebtoken'

@Injectable()
export class JwtAuthGuard implements CanActivate {
    canActivate(
      context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
      const request = context.switchToHttp().getRequest();
      const token = request.headers.authorization; // Assuming the token is sent in the Authorization header
  
      if (!token) {
        return false;
      }
      try {
        const decoded = jwt.verify(token, jwtConstants.secret);
        request.user = decoded; // Attach the decoded payload to the request for later use
        return true;
      } catch (error) {
        return false;
      }
    }
  }