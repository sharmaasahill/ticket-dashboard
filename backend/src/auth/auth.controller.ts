import { Body, Controller, Post } from '@nestjs/common';
import { IsEmail, IsString, Length } from 'class-validator';
import { AuthService } from './auth.service';

class IssueDto {
  @IsEmail()
  email!: string;
}

class VerifyDto {
  @IsEmail()
  email!: string;

  @IsString()
  @Length(6, 6)
  code!: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('issue-otp')
  issue(@Body() dto: IssueDto) {
    return this.auth.issueOtp(dto.email.toLowerCase());
  }

  @Post('verify-otp')
  verify(@Body() dto: VerifyDto) {
    return this.auth.verifyOtp(dto.email.toLowerCase(), dto.code);
  }
}


