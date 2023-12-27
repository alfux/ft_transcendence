import { Module, forwardRef } from '@nestjs/common'
import { PassportModule } from '@nestjs/passport'
import { JwtModule as NestJwtModule } from '@nestjs/jwt'

import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'

import { JwtModule } from './jwt'
import { UserModule } from 'src/db/user'
import { FortyTwoModule } from './42api'
import { TwoFactorAuthenticationModule } from './2fa'

@Module({
	imports: [
		NestJwtModule.register({}),
		PassportModule.register({ defaultStrategy: '42' }),
		forwardRef(() => UserModule),

		TwoFactorAuthenticationModule,
		FortyTwoModule,
		JwtModule,
	],

	controllers: [
		AuthController,
	],

	providers: [
		AuthService
	],

	exports: [
		TwoFactorAuthenticationModule,
		FortyTwoModule,
		JwtModule,

		AuthService
	],
})
export class AuthModule { }