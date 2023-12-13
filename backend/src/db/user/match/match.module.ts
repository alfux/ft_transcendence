import { Module, forwardRef } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { MatchService } from './match.service'
import { Match } from './match.entity'
import { UserModule } from '../user.module'


@Module({
  imports: [
    TypeOrmModule.forFeature([Match]),
  ],

  providers: [
    MatchService
  ],

  controllers: [
  ],

  exports: [
    TypeOrmModule,

    MatchService,
  ],
})
export class MatchModule { }