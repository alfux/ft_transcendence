import { Module, forwardRef } from '@nestjs/common';
import { NotificationsGateway } from './notifications.gateway';
import { NotificationsController } from './notifications.controller';
import { UserModule } from 'src/db/user';
import { MessageModule } from 'src/db/message';
import { ConversationModule } from 'src/db/conversation';
import { AuthModule } from 'src/auth';
import { NotificationsService } from './notifications.service';

@Module({
  imports: [
    forwardRef(() => UserModule),
    AuthModule
  ],
  providers: [
    NotificationsGateway,
    NotificationsService
  ],
  controllers: [
    NotificationsController
  ],
  exports: [NotificationsService]
})
export class NotificationsModule { }