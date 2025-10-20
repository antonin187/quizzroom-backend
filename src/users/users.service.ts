import { Injectable } from '@nestjs/common';
import { Prisma, User } from 'generated/prisma';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // ✅ 1. Créer un utilisateur
  async create(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({ data });
  }

  // ✅ 2. Récupérer tous les utilisateurs
  async findAll(): Promise<User[]> {
    return this.prisma.user.findMany();
  }

  // ✅ 3. Récupérer un utilisateur par son ID
  async findOne(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  // ✅ 4. Trouver un utilisateur par email (utile pour l’auth)
  async findByEmail(email: string): Promise<User | null> {
    const normalizedEmail = email.toLowerCase().trim();
    return this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
  }

  // ✅ 5. Mettre à jour un utilisateur
  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  // ✅ 6. Supprimer un utilisateur
  async remove(id: string): Promise<User> {
    return this.prisma.user.delete({
      where: { id },
    });
  }
}
