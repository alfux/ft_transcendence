import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtStrategy } from 'src/jwt/Strategy/jwt/jwt.strategy';
import { JwtController } from 'src/jwt/controller/jwt/jwt.controller';
import { JwtAuthGuard } from 'src/jwt/guard/jwt.guard';

@Module({
    imports: [],
    controllers: [JwtController],
    providers: [JwtService,JwtStrategy, JwtAuthGuard]
})
export class JwtModule {}
