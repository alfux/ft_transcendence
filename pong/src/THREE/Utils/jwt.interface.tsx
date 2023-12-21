export enum LoggedStatus {
	Logged,
	InGame,
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
