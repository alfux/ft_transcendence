import { Request as ExpressRequest } from 'express'
import { JwtPayload } from './jwtpayload.interface'

export interface Request extends ExpressRequest {
	user: JwtPayload
}