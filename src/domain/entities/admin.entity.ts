export type AdminRole = 'SUPER_ADMIN' | 'ADMIN' | 'OPERATOR';

export interface AdminEntity {
  id: number;
  username: string;
  email: string;
  passwordHash: string;
  role: AdminRole;
  isActive: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminSessionEntity {
  id: string;
  adminId: number;
  expiresAt: Date;
  createdAt: Date;
}

// DTOs (Data Transfer Objects)
export interface CreateAdminDto {
  username: string;
  email: string;
  password: string;
  role?: AdminRole;
}

export interface UpdateAdminDto {
  username?: string;
  email?: string;
  role?: AdminRole;
  isActive?: boolean;
}

export interface AdminLoginDto {
  username: string;
  password: string;
}

export interface AdminLoginResponseDto {
  success: boolean;
  admin?: Omit<AdminEntity, 'passwordHash'>;
  token?: string;
  message?: string;
}

export interface CreateSessionDto {
  adminId: number;
  expiresAt: Date;
}