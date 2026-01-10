import {
  AdminEntity,
  AdminLoginDto,
  AdminLoginResponseDto,
  CreateAdminDto,
  UpdateAdminDto,
} from '../../domain/entities/admin.entity';

export interface IAdminService {
  login(data: AdminLoginDto): Promise<AdminLoginResponseDto>;
  logout(token: string): Promise<boolean>;
  createAdmin(data: CreateAdminDto): Promise<AdminEntity>;
  updateAdmin(id: number, data: UpdateAdminDto): Promise<AdminEntity | null>;
  getAdminById(id: number): Promise<Omit<AdminEntity, 'passwordHash'> | null>;
  validateToken(token: string): Promise<AdminEntity | null>;
  hashPassword(password: string): Promise<string>;
  verifyPassword(password: string, hash: string): Promise<boolean>;
}