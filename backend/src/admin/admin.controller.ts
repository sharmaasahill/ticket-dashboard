import { Body, Controller, Post } from '@nestjs/common';
import { IsString } from 'class-validator';

class VerifyDto { @IsString() password!: string }

@Controller('admin')
export class AdminController {
  @Post('super-verify')
  verify(@Body() dto: VerifyDto) {
    const ok = dto.password === (process.env.SUPER_PASSWORD ?? 'admin123');
    return { ok };
  }
}


