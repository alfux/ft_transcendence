import { Module } from '@nestjs/common';
import { UserController } from './user/controller/user/user.controller';
import { UserService } from './user/service/user/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/module/user/user.module';
import { User } from './user/entities/user.entity';
import { AuthService } from './auth/service/auth/auth.service';
import { AuthModule } from './auth/module/auth/auth.module';
import { AuthController } from './auth/controller/auth/auth.controller';
import { JwtService } from './jwt/service/jwt/jwt.service';
import { JwtController } from './jwt/controller/jwt/jwt.controller';
import { JwtModule } from './jwt/module/jwt/jwt.module';



@Module({
  imports: [TypeOrmModule.forRoot({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'gameover',
    password: '123456',
    database: 'test',
    entities: [User],
    synchronize: true,
  }),
  UserModule,
  AuthModule,
  JwtModule],
  controllers: [JwtController],
  providers: [JwtService],
})
export class AppModule {}
