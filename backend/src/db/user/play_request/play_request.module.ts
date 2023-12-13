import { Module, forwardRef } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { PlayRequestService } from './play_request.service'
import { PlayRequest } from './play_request.entity'
import { UserModule } from '../user.module'


@Module({
  imports: [
    TypeOrmModule.forFeature([PlayRequest]),

    forwardRef(() => UserModule)
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