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
  @Get('force_auth')
  force_auth() {
    return this.authService.getJwt({id:101638, username:"reclaire", image:"https://cdn.intra.42.fr/users/137e6361715edb331aa855c8bf8042e8/reclaire.jpg"}) 
  }

  @Public()
  @UseGuards(AuthGuard('42'))
  @Get('login')
  async login_callback(@Req() req: Request, @Res() response: Response): Promise<void> {  
    const token = await this.authService.getJwt(req.user)
  
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