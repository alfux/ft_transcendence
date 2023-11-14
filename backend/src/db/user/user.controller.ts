import { Req, UseGuards, Controller, Get, ConsoleLogger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request as ExpressRequest } from 'express';

import { User42Api } from 'src/auth/42api/user42api.interface';
import { UserService } from "./user.service";

import { Request } from 'src/auth';

@Controller('users')
export class UserController {

  constructor(
    private userService: UserService
  )  { }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  async getMeConversations(@Req() req: Request)
  {
    const user = await this.userService.getUser({id:req.user.id})
    return user
  }
}