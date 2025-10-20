import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Autres routes ...

  @UseGuards(JwtAuthGuard) // 🔒 protège l’accès (optionnel)
  @Get('email/:email')
  async findByEmail(@Param('email') email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new NotFoundException(
        `Aucun utilisateur trouvé avec l'email ${email}`,
      );
    }

    // ⚠️ On retire le mot de passe avant de renvoyer l'objet
    const { password, ...safeUser } = user;
    return safeUser;
  }
}
