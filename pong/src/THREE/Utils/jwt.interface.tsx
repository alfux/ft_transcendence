interface JwtPayload {
    email: string;
    exp:number;
    isTwoFactorAuthEnable: boolean;
  }

export default JwtPayload;