import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { MailService } from '../common/mail/mail.service';

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly mail: MailService,
  ) {}

  async issueOtp(email: string): Promise<{ ok: true }> {
    const code = generateCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await this.prisma.otpToken.create({ data: { email, code, expiresAt } });
    await this.mail.sendOtp(email, code);
    return { ok: true };
  }

  async verifyOtp(email: string, code: string): Promise<{ token: string }> {
    const token = await this.prisma.otpToken.findFirst({
      where: { email, code, consumedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
    });
    if (!token) throw new UnauthorizedException('Invalid or expired code');
    await this.prisma.otpToken.update({
      where: { id: token.id },
      data: { consumedAt: new Date() },
    });
    const user = await this.users.findOrCreateByEmail(email);
    const jwt = await this.jwt.signAsync({ sub: user.id, email: user.email });
    return { token: jwt };
  }
}


