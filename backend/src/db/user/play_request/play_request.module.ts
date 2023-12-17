import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { PlayRequestService } from './play_request.service'
import { PlayRequest } from './play_request.entity'
import { NotificationsModule } from 'src/notifications'


@Module({
  imports: [
    TypeOrmModule.forFeature([PlayRequest]),
    NotificationsModule
  ],

  providers: [
    PlayRequestService
  ],

  controllers: [
  ],

  exports: [
    TypeOrmModule,
    PlayRequestService,
  ],
})
export class PlayRequestModule { }