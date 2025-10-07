import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { IsString } from 'class-validator';
import { JwtAuthGuard } from '../auth/jwt.guard';

class SuperVerifyDto {
  @IsString()
  password!: string;
}

@UseGuards(JwtAuthGuard)
@Controller('admin')
export class AdminController {
  @Post('super-verify')
  verifySuperPassword(@Body() dto: SuperVerifyDto) {
    const expectedPassword = process.env.SUPER_PASSWORD || 'admin123';
    const isValid = dto.password === expectedPassword;
    return { ok: isValid };
  }
}

