import { Module, forwardRef } from '@nestjs/common'

import { TwoFactorAuthenticationController } from './2fa.controller'
import { TwoFactorAuthenticationService } from './2fa.service'
import { UserModule } from 'src/db/user'

@Module({
	imports: [
		forwardRef(() => UserModule)
	],

	controllers: [
		TwoFactorAuthenticationController
	],

	providers: [
		TwoFactorAuthenticationService,
	],

	exports: [
		TwoFactorAuthenticationService
	],
})
export class TwoFactorAuthenticationModule { }