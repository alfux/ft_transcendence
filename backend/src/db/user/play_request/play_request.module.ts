import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { PlayRequestService } from './play_request.service'
import { PlayRequest } from './play_request.entity'


@Module({
  imports: [
    TypeOrmModule.forFeature([PlayRequest]),
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