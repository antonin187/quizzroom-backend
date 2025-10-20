import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './jwt.strategy';
import { UsersService } from 'src/users/users.service';
import { PrismaService } from 'src/prisma.service';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'dev-secret', // à mettre dans .env
      signOptions: { expiresIn: '3d' }, // expiration du token
    }),
  ],
  controllers: [AuthController],
  providers: [PrismaService, UsersService, AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
