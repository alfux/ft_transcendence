import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserModule } from '..';
import { MatchService } from './match.service';
import { Match } from './match.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Match]),
    forwardRef(() => UserModule),
  ],
  exports: [TypeOrmModule, MatchService],
  providers: [UserService],
  controllers: [UserController],
})
export class MatchModule {}