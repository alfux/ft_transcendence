import { ExecutionContext, Injectable } from "@nestjs/common"
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt-refresh') {
    canActivate(context: ExecutionContext): any {
        return super.canActivate(context)
      }
}
