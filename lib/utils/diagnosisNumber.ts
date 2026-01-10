import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * 診断番号を生成する（GH00001形式）
 * @returns 次の診断番号
 */
export async function generateDiagnosisNumber(): Promise<string> {
  // 最新の診断番号を取得
  const latestDiagnosis = await prisma.diagnosis_requests.findFirst({
    orderBy: {
      diagnosis_number: 'desc',
    },
    select: {
      diagnosis_number: true,
    },
  });

  if (!latestDiagnosis) {
    // 初回の場合
    return 'GH00001';
  }

  // 現在の番号から数値部分を抽出
  const currentNumber = parseInt(latestDiagnosis.diagnosis_number.slice(2));
  const nextNumber = currentNumber + 1;

  // 5桁0埋めでフォーマット
  return `GH${nextNumber.toString().padStart(5, '0')}`;
}