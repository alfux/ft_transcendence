import { Req, Controller, Get } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'

import { UserService } from "./user.service"
import { Request } from 'src/auth'
import { Route } from 'src/route'


@ApiBearerAuth()
@ApiTags('user')
@Controller('user')
export class UserController {

  constructor(
    private userService: UserService
  )  { }

  @Route({
    method:Get('me'),
    description:{ summary:'Get user info', description:'Returns authenticated user\'s info' },
    responses: [{status:200, description:'Found user successfully'}]
  })
  getMe(@Req() req: Request) {
    return this.userService.getUser({id:req.user.id})
  }

  @Route({
    method:Get('/'),
    description:{ summary:'Get all users info', description:'Returns all users info' },
    responses: [{status:200, description:'Found user successfully'}]
  })
  getAllUsers() {
    return this.userService.getUsers()
  }
}