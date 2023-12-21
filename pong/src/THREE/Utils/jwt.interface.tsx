export enum LoggedStatus {
	Logged,
	Incomplete,
	Unlogged,
}

export interface JwtPayload {
	id: number
	username: string,
	email: string,
	isTwoFactorAuthEnable: boolean,
	authentication: LoggedStatus
	exp: number
	avatar: string
}
