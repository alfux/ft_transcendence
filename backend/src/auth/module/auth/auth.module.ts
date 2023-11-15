import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { sign } from 'crypto';
import { AuthController } from 'src/auth/controller/auth/auth.controller';
import { AuthService } from 'src/auth/service/auth/auth.service';
import { AuthStrategy } from 'src/auth/strategy/auth.strategy';
import { JwtAccessTokenStrategy } from 'src/auth/strategy/jwtAccessToken.strategy';
import { JwtRefreshTokenStrategy } from 'src/auth/strategy/jwtRefreshToken.strategy';
import { User } from 'src/user/entities/user.entity';
import { UserModule } from 'src/user/module/user/user.module';
import { UserService } from 'src/user/service/user/user.service';

@Module({
    imports: [ConfigModule.forRoot(), PassportModule, JwtModule.register({
        global: true,
        secret: 'SECRET123',
        signOptions:{expiresIn: '15m'},
    }
    ), UserModule,JwtModule],
    controllers: [AuthController],
    providers: [AuthService, AuthStrategy, UserService,JwtAccessTokenStrategy,JwtRefreshTokenStrategy],
})
export class AuthModule {}
