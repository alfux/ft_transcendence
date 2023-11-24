import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { User42Api } from './42api/user42api.interface';
import { JwtPayload } from './jwtpayload.interface';
import { UserService } from 'src/db/user';

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
    private jwtService: JwtService
  ) { }

  async getJwt(user42api: User42Api): Promise<string> {
    this.userService.updateOrCreateUser(user42api)
    return this.jwtService.sign({ sub: user42api.id, username:user42api.username, image:user42api.image})
  }

  verifyJWT(token: string): JwtPayload {
    try {
      return this.jwtService.verify(token);
    } catch {
      return null;
    }
  }
}