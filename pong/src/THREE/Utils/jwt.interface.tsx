export enum LoggedStatus {
  Logged,
  Incomplete,
  Unlogged,
}

export interface JwtPayload {
  sub: string;
  email: string;
  exp: number;
  isTwoFactorAuthEnable: boolean;
  authentication: LoggedStatus
}
