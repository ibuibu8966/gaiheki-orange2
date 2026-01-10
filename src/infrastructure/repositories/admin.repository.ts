import { PrismaClient } from '@prisma/client';
import { IAdminRepository } from '../../domain/repositories/admin.repository.interface';
import {
  AdminEntity,
  AdminSessionEntity,
  CreateAdminDto,
  UpdateAdminDto,
  CreateSessionDto,
} from '../../domain/entities/admin.entity';

export class AdminRepository implements IAdminRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: number): Promise<AdminEntity | null> {
    const admin = await this.prisma.admin.findUnique({
      where: { id },
    });
    return admin;
  }

  async findByUsername(username: string): Promise<AdminEntity | null> {
    const admin = await this.prisma.admin.findUnique({
      where: { username },
    });
    return admin;
  }

  async findByEmail(email: string): Promise<AdminEntity | null> {
    const admin = await this.prisma.admin.findUnique({
      where: { email },
    });
    return admin;
  }

  async create(data: CreateAdminDto & { passwordHash: string }): Promise<AdminEntity> {
    const admin = await this.prisma.admin.create({
      data: {
        username: data.username,
        email: data.email,
        passwordHash: data.passwordHash,
        role: data.role || 'ADMIN',
      },
    });
    return admin;
  }

  async update(id: number, data: UpdateAdminDto): Promise<AdminEntity | null> {
    try {
      const admin = await this.prisma.admin.update({
        where: { id },
        data,
      });
      return admin;
    } catch {
      return null;
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      await this.prisma.admin.delete({
        where: { id },
      });
      return true;
    } catch {
      return false;
    }
  }

  async updateLastLogin(id: number): Promise<void> {
    await this.prisma.admin.update({
      where: { id },
      data: { lastLoginAt: new Date() },
    });
  }

  async createSession(data: CreateSessionDto): Promise<AdminSessionEntity> {
    const session = await this.prisma.adminSession.create({
      data,
    });
    return session;
  }

  async findSessionById(sessionId: string): Promise<AdminSessionEntity | null> {
    const session = await this.prisma.adminSession.findUnique({
      where: { id: sessionId },
      include: { admin: true },
    });

    if (!session) return null;

    // セッションが期限切れの場合は削除して null を返す
    if (session.expiresAt < new Date()) {
      await this.deleteSession(sessionId);
      return null;
    }

    return session;
  }

  async deleteSession(sessionId: string): Promise<boolean> {
    try {
      await this.prisma.adminSession.delete({
        where: { id: sessionId },
      });
      return true;
    } catch {
      return false;
    }
  }

  async deleteExpiredSessions(): Promise<void> {
    await this.prisma.adminSession.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
  }
}