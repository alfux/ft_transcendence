export { Public } from './jwt/public.decorator'
export { JwtAuthGuard } from './jwt/jwt.guard'
export { AuthService } from './auth.service'
export { AuthModule } from './auth.module'

import { User42Api } from './42api/user42api.interface'
import { Request as ExpressRequest } from 'express'
export interface Request extends ExpressRequest {
  user: User42Api;
}

