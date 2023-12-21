import { Inject, Injectable, forwardRef } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

import { config_jwt } from 'src/config'
import { JwtPayload } from 'src/auth/interfaces'
import { User, UserService, LoggedStatus } from 'src/db/user'

@Injectable()
export class AuthService {
	constructor(
		@Inject(forwardRef(() => UserService))
		private userService: UserService,
		private jwtService: JwtService
	) { }

	async generateAccessToken(user: User) {
		return this.jwtService.signAsync({
			id: user.id,
			username: user.username,
			email: user.email,
			isTwoFactorAuthEnable: user.twoFactorAuth,
			authentication: user.isAuthenticated
		}, { secret: config_jwt.secret_token, expiresIn: config_jwt.expires_token })
	}

	async generateRefreshToken(user: User) {
		return this.jwtService.signAsync({
			sub: user.id,
			email: user.email,
		}, { secret: config_jwt.secret_refresh, expiresIn: config_jwt.expires_refresh })
	}

	async login(user: Partial<User>): Promise<{ access_token: string, refresh_token: string }> {

		if (user.id)
			user.id = +user.id

		const user_data = await this.userService.updateOrCreateUser({
			id: user.id,
			username: user.username,
			image: user.image,
			email: user.email
		})

		const user_2fa_data = await this.userService.getUserAuthSecret(user.id)

		user_data.isAuthenticated = user_2fa_data.twoFactorAuth ? LoggedStatus.Incomplete : LoggedStatus.Logged
		await this.userService.updateUser(user_data)

		return Promise.all([this.generateAccessToken(user_data), this.generateRefreshToken(user_data)])
			.then((tokens) => ({ access_token: tokens[0], refresh_token: tokens[1] }))
	}

	verifyJWT(token: string, key: string): Promise<JwtPayload | null> {
		return this.jwtService.verifyAsync(token, { secret: key }).catch((e) => null)
	}
}