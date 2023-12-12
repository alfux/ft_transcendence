import { Module, forwardRef } from '@nestjs/common'

import { UserModule } from 'src/db/user'
import { AuthModule } from 'src/auth/auth.module'
import { NotificationsGateway } from './notifications.gateway'
import { NotificationsService } from './notifications.service'

@Module({
  imports: [
    forwardRef(() => UserModule),
    forwardRef(() => AuthModule)
  ],

  providers: [
    NotificationsGateway,
    NotificationsService
  ],

  controllers: [],

  exports: [NotificationsService]
})
export class NotificationsModule { }