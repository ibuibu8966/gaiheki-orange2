import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 既存の診断データを取得
  const diagnoses = await prisma.diagnosis_requests.findMany({
    orderBy: {
      id: 'asc',
    },
  });

  console.log(`既存の診断データ: ${diagnoses.length}件`);

  // 各診断に診断番号を割り当て
  for (let i = 0; i < diagnoses.length; i++) {
    const diagnosisNumber = `GH${(i + 1).toString().padStart(5, '0')}`;

    await prisma.$executeRawUnsafe(
      `UPDATE diagnosis_requests SET diagnosis_number = '${diagnosisNumber}' WHERE id = ${diagnoses[i].id}`
    );

    console.log(`診断ID ${diagnoses[i].id} に ${diagnosisNumber} を設定しました`);
  }

  console.log('完了しました！');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
