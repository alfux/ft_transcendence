interface JwtPayload {
    sub:string;
    email: string;
    exp:number;
    isTwoFactorAuthEnable: boolean;
    authentication:string
  }

export default JwtPayload;