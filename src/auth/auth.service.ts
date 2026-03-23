import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(dto: any) {
    const { nombre, email, password } = dto;

    const exists = await this.usersService.findByEmail(email);
    if (exists) throw new BadRequestException('EMAIL_ALREADY_EXISTS');

    const hash = await bcrypt.hash(password, 10);

    const user = await this.usersService.create({
      nombre,
      email,
      password: hash,
    });

    return this.generateToken(user);
  }

  async login(dto: any) {
    const { email, password } = dto;

    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('INVALID_CREDENTIALS');

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new UnauthorizedException('INVALID_CREDENTIALS');

    return this.generateToken(user);
  }

  private async generateToken(user: any) {
    const payload = {
      sub: user.id,
      nombre: user.nombre,
      email: user.email,
    };

    const access_token = await this.jwtService.signAsync(payload);

    return {
      access_token,
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
      },
    };
  }
}
