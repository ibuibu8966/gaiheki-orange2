import PartnerDetailContent from "@/app/components/PartnerDetailContent";
import { prisma } from "@/lib/prisma";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const partnerId = parseInt(id);

    if (isNaN(partnerId)) {
      throw new Error('Invalid partner ID');
    }

    // Query database directly for better performance and reliability
    const partner = await prisma.partners.findUnique({
      where: { id: partnerId },
      include: {
        partner_details: true
      }
    });

    if (partner?.partner_details) {
      const details = partner.partner_details;
      return {
        title: `${details.company_name} - 外壁塗装パートナーズ`,
        description: details.appeal_text?.substring(0, 150) || details.business_description?.substring(0, 150),
      };
    }
  } catch (error) {
    console.error('Metadata generation error:', error);
  }

  return {
    title: "加盟店詳細 - 外壁塗装パートナーズ",
    description: "信頼できる外壁塗装業者の詳細情報をご覧ください。",
  };
}

export default async function PartnerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PartnerDetailContent partnerId={id} />;
}
