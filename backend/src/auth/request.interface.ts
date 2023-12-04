import { User42Api } from './42api/user42api.interface'
import { Request as ExpressRequest } from 'express'
export interface Request extends ExpressRequest {
  user: User42Api;
}