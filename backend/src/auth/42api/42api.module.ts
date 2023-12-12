import { Module } from '@nestjs/common'

import { FortyTwoStrategy } from './42api.strategy'

@Module({
  imports: [],

  controllers: [
  ],

  providers: [
    FortyTwoStrategy,
  ],

  exports: [
    FortyTwoStrategy
  ],
})
export class FortyTwoModule { }