import {
  AdminEntity,
  AdminSessionEntity,
  CreateAdminDto,
  UpdateAdminDto,
  CreateSessionDto
} from '../entities/admin.entity';

export interface IAdminRepository {
  // Admin CRUD operations
  findById(id: number): Promise<AdminEntity | null>;
  findByUsername(username: string): Promise<AdminEntity | null>;
  findByEmail(email: string): Promise<AdminEntity | null>;
  create(data: CreateAdminDto & { passwordHash: string }): Promise<AdminEntity>;
  update(id: number, data: UpdateAdminDto): Promise<AdminEntity | null>;
  delete(id: number): Promise<boolean>;
  updateLastLogin(id: number): Promise<void>;

  // Session operations
  createSession(data: CreateSessionDto): Promise<AdminSessionEntity>;
  findSessionById(sessionId: string): Promise<AdminSessionEntity | null>;
  deleteSession(sessionId: string): Promise<boolean>;
  deleteExpiredSessions(): Promise<void>;
}