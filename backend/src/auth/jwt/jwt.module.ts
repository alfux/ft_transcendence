import { Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'

import { JwtAuthGuard } from './jwt.guard'
import { JwtStrategy } from './jwt.strategy'
import { JwtRefreshTokenStrategy } from './jwt_refresh.strategy'

@Module({
	imports: [],

	controllers: [
	],

	providers: [
		JwtStrategy,
		JwtRefreshTokenStrategy,

		{
			provide: APP_GUARD,
			useClass: JwtAuthGuard,
		},
	],

	exports: [],
})
export class JwtModule { }
