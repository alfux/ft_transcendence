import { Controller, Get, Req, Res, UseGuards, Inject, forwardRef } from '@nestjs/common'
import { CookieOptions, Response } from 'express'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { AuthGuard } from '@nestjs/passport'

import { Public } from 'src/auth/jwt/'
import { Request } from 'src/auth/interfaces'
import { AuthService } from '.'
import { UserService } from 'src/db/user'
import { config_hosts } from 'src/config'


const cookie_options: CookieOptions = {
  httpOnly: false,
  secure: false,
  sameSite: 'lax'
}

@ApiBearerAuth()
@ApiTags('auth')
@Controller('auth')
export class AuthController {

  constructor(
    private readonly authService: AuthService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService
  ) { }

  @Public()
  @UseGuards(AuthGuard('42'))
  @Get('login')
  async login_callback(@Req() req: Request, @Res() response: Response): Promise<void> {

    const tokens = await this.authService.login(req.user)

    const url = new URL(`${req.protocol}://${req.hostname}`)
    url.port = config_hosts.front_port

    response.cookie("access_token", tokens.access_token, cookie_options)
    response.cookie("refresh_token", tokens.refresh_token, cookie_options)

    response.status(302).redirect(url.href)
  }

  @UseGuards(AuthGuard('42'))
  @Get('logout')
  logout(@Res() response: Response) {
    response.clearCookie("access_token")
    response.clearCookie("refresh_token")
    response.status(200)
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('refresh')
  async refreshToken(@Req() req: Request, @Res() response: Response) {
    const user = await this.userService.getUser({ id: req.user.id })
    const newToken = await this.authService.generateAccessToken(user);
    response.cookie('access_token', newToken, cookie_options);
    response.status(200).json(newToken)
  }

}
