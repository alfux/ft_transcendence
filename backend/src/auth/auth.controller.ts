// auth.controller.ts

import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { Response } from 'express'

import { Request } from './index'
import { AuthService } from './auth.service'
import { Public } from './jwt/public.decorator'

@Controller('auth')
export class AuthController {
  
  constructor(
    private readonly authService: AuthService,
  ) {}

  @Public()
  @UseGuards(AuthGuard('42'))
  @Get('login')
  async login_callback(@Req() req: Request, @Res() response: Response): Promise<void> {  
    const token = await this.authService.getJwt(req.user)
  
    console.log(req.protocol, req.hostname)
    const url = new URL(`${req.protocol}://${req.hostname}`)
    url.port = '3000'
    url.searchParams.set('code', token)
    
    response.status(302).redirect(url.href)
  }

  @Public()
  @Get('jwt')
  jwt(@Req() req: Request): boolean {
    if (!req.headers.authorization) return false;
    const token = req.headers.authorization.split(' ')[1];
    const payload = this.authService.verifyJWT(token);
    return !!payload;
  }

}