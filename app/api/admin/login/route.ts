import { NextRequest } from 'next/server';
import AdminFactory from '../../../../src/infrastructure/factories/admin.factory';

export async function POST(request: NextRequest) {
  const adminController = AdminFactory.getAdminController();
  return await adminController.login(request);
}