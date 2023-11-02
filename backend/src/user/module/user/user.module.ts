import { Controller, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from 'src/user/controller/user/user.controller';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/service/user/user.service';

@Module({
    imports: [TypeOrmModule.forFeature([User])],
    providers: [UserService],
    controllers: [UserController],
    exports: [TypeOrmModule]
})
export class UserModule {}
