import { NextRequest } from 'next/server';
import AdminFactory from '../../../../src/infrastructure/factories/admin.factory';

export async function GET(request: NextRequest) {
  const adminController = AdminFactory.getAdminController();
  return await adminController.me(request);
}