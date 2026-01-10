import { prisma } from '../database/prisma.client';
import { AdminRepository } from '../repositories/admin.repository';
import { AdminService } from '../../application/services/admin.service';
import { AdminController } from '../../presentation/controllers/admin.controller';

// Singleton pattern for dependency injection
class AdminFactory {
  private static adminRepositoryInstance: AdminRepository | null = null;
  private static adminServiceInstance: AdminService | null = null;
  private static adminControllerInstance: AdminController | null = null;

  static getAdminRepository(): AdminRepository {
    if (!this.adminRepositoryInstance) {
      this.adminRepositoryInstance = new AdminRepository(prisma);
    }
    return this.adminRepositoryInstance;
  }

  static getAdminService(): AdminService {
    if (!this.adminServiceInstance) {
      const adminRepository = this.getAdminRepository();
      this.adminServiceInstance = new AdminService(adminRepository);
    }
    return this.adminServiceInstance;
  }

  static getAdminController(): AdminController {
    if (!this.adminControllerInstance) {
      const adminService = this.getAdminService();
      this.adminControllerInstance = new AdminController(adminService);
    }
    return this.adminControllerInstance;
  }
}

export default AdminFactory;