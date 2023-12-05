export enum LoggedStatus {
  Unlogged,
  Incomplete,
  Logged,
}

export interface JwtPayload {
  sub: string;
  email: string;
  exp: number;
  isTwoFactorAuthEnable: boolean;
  authentication: LoggedStatus
}
