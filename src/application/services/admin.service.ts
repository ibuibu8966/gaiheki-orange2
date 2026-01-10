import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { IAdminService } from './admin.service.interface';
import { IAdminRepository } from '../../domain/repositories/admin.repository.interface';
import {
  AdminEntity,
  AdminLoginDto,
  AdminLoginResponseDto,
  CreateAdminDto,
  UpdateAdminDto,
} from '../../domain/entities/admin.entity';

export class AdminService implements IAdminService {
  private readonly jwtSecret: string;
  private readonly saltRounds: number;
  private readonly jwtExpiresIn: string | number;

  constructor(private adminRepository: IAdminRepository) {
    this.jwtSecret = process.env.JWT_SECRET || 'default-secret';
    this.saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12');
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '24h';
  }

  async login(data: AdminLoginDto): Promise<AdminLoginResponseDto> {
    try {
      // ユーザー名でアドミンを検索
      const admin = await this.adminRepository.findByUsername(data.username);

      if (!admin) {
        return {
          success: false,
          message: 'ユーザー名またはパスワードが正しくありません',
        };
      }

      // アクティブ状態をチェック
      if (!admin.isActive) {
        return {
          success: false,
          message: 'アカウントが無効化されています',
        };
      }

      // パスワードを検証
      const isPasswordValid = await this.verifyPassword(data.password, admin.passwordHash);

      if (!isPasswordValid) {
        return {
          success: false,
          message: 'ユーザー名またはパスワードが正しくありません',
        };
      }

      // 最終ログイン日時を更新
      await this.adminRepository.updateLastLogin(admin.id);

      // セッションを作成
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // 24時間後

      const session = await this.adminRepository.createSession({
        adminId: admin.id,
        expiresAt,
      });

      // JWTトークンを生成
      const token = jwt.sign(
        {
          sessionId: session.id,
          adminId: admin.id,
          role: admin.role,
        },
        this.jwtSecret,
        {
          expiresIn: '24h'
        }
      );

      // パスワードハッシュを除外してレスポンス
      const { passwordHash: _, ...adminData } = admin;

      return {
        success: true,
        admin: adminData,
        token,
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'ログイン処理中にエラーが発生しました',
      };
    }
  }

  async logout(token: string): Promise<boolean> {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as jwt.JwtPayload & {
        sessionId: string
      };
      await this.adminRepository.deleteSession(decoded.sessionId);
      return true;
    } catch {
      return false;
    }
  }

  async createAdmin(data: CreateAdminDto): Promise<AdminEntity> {
    const hashedPassword = await this.hashPassword(data.password);

    const adminData = {
      ...data,
      passwordHash: hashedPassword,
    };

    return await this.adminRepository.create(adminData);
  }

  async updateAdmin(id: number, data: UpdateAdminDto): Promise<AdminEntity | null> {
    return await this.adminRepository.update(id, data);
  }

  async getAdminById(id: number): Promise<Omit<AdminEntity, 'passwordHash'> | null> {
    const admin = await this.adminRepository.findById(id);
    if (!admin) return null;

    const { passwordHash: _, ...adminData } = admin;
    return adminData;
  }

  async validateToken(token: string): Promise<AdminEntity | null> {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as jwt.JwtPayload & {
        sessionId: string;
        adminId: number
      };

      // セッションを検証
      const session = await this.adminRepository.findSessionById(decoded.sessionId);
      if (!session) return null;

      // アドミンを取得
      const admin = await this.adminRepository.findById(decoded.adminId);
      if (!admin || !admin.isActive) return null;

      return admin;
    } catch {
      return null;
    }
  }

  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, this.saltRounds);
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }
}