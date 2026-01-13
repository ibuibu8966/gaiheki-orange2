// メール送信ユーティリティ
// 実際の送信にはSendGrid, AWS SES, Resendなどを設定する必要があります

interface ReferralEmailData {
  partnerEmail: string;
  partnerCompanyName: string;
  diagnosisNumber: string;
  customerName: string;
  prefecture: string;
  constructionType: string;
  floorArea: string;
  referralFee: number;
  previousBalance: number;
  newBalance: number;
}

const PREFECTURE_LABELS: Record<string, string> = {
  Hokkaido: '北海道', Aomori: '青森県', Iwate: '岩手県', Miyagi: '宮城県',
  Akita: '秋田県', Yamagata: '山形県', Fukushima: '福島県', Ibaraki: '茨城県',
  Tochigi: '栃木県', Gunma: '群馬県', Saitama: '埼玉県', Chiba: '千葉県',
  Tokyo: '東京都', Kanagawa: '神奈川県', Niigata: '新潟県', Toyama: '富山県',
  Ishikawa: '石川県', Fukui: '福井県', Yamanashi: '山梨県', Nagano: '長野県',
  Gifu: '岐阜県', Shizuoka: '静岡県', Aichi: '愛知県', Mie: '三重県',
  Shiga: '滋賀県', Kyoto: '京都府', Osaka: '大阪府', Hyogo: '兵庫県',
  Nara: '奈良県', Wakayama: '和歌山県', Tottori: '鳥取県', Shimane: '島根県',
  Okayama: '岡山県', Hiroshima: '広島県', Yamaguchi: '山口県', Tokushima: '徳島県',
  Kagawa: '香川県', Ehime: '愛媛県', Kochi: '高知県', Fukuoka: '福岡県',
  Saga: '佐賀県', Nagasaki: '長崎県', Kumamoto: '熊本県', Oita: '大分県',
  Miyazaki: '宮崎県', Kagoshima: '鹿児島県', Okinawa: '沖縄県'
};

const CONSTRUCTION_TYPE_LABELS: Record<string, string> = {
  EXTERIOR_PAINTING: '外壁塗装',
  ROOF_PAINTING: '屋根塗装',
  SCAFFOLDING_WORK: '足場工事',
  WATERPROOFING: '防水工事',
  LARGE_SCALE_WORK: '大規模工事',
  INTERIOR_WORK: '内装工事',
  EXTERIOR_WORK: '外構工事',
  OTHER: 'その他',
};

const FLOOR_AREA_LABELS: Record<string, string> = {
  UNKNOWN: '不明',
  UNDER_80: '80㎡未満',
  FROM_80_TO_100: '80〜100㎡',
  FROM_101_TO_120: '101〜120㎡',
  FROM_121_TO_140: '121〜140㎡',
  FROM_141_TO_160: '141〜160㎡',
  FROM_161_TO_180: '161〜180㎡',
  FROM_181_TO_200: '181〜200㎡',
  FROM_201_TO_250: '201〜250㎡',
  FROM_251_TO_300: '251〜300㎡',
  FROM_301_TO_500: '301〜500㎡',
  OVER_501: '501㎡以上',
};

export function generateReferralEmailContent(data: ReferralEmailData): { subject: string; text: string; html: string } {
  const subject = `【外壁オレンジ】案件紹介のお知らせ - ${data.diagnosisNumber}`;

  const prefectureLabel = PREFECTURE_LABELS[data.prefecture] || data.prefecture;
  const constructionTypeLabel = CONSTRUCTION_TYPE_LABELS[data.constructionType] || data.constructionType;
  const floorAreaLabel = FLOOR_AREA_LABELS[data.floorArea] || data.floorArea;

  const text = `
${data.partnerCompanyName} 様

新しい案件が紹介されました。

■ 案件情報
診断番号: ${data.diagnosisNumber}
顧客名: ${data.customerName}
都道府県: ${prefectureLabel}
工事種別: ${constructionTypeLabel}
延床面積: ${floorAreaLabel}

■ 紹介料
¥${data.referralFee.toLocaleString()}

■ 保証金残高
変更前: ¥${data.previousBalance.toLocaleString()}
変更後: ¥${data.newBalance.toLocaleString()}

詳細はダッシュボードからご確認ください。
https://gaiheki-orange.vercel.app/partner-dashboard/referrals

---
外壁オレンジ
このメールは自動送信されています。
`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', Meiryo, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #f16f21; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background-color: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
    .section { background-color: white; padding: 15px; margin: 15px 0; border-radius: 8px; border: 1px solid #eee; }
    .section-title { font-weight: bold; color: #f16f21; margin-bottom: 10px; border-bottom: 2px solid #f16f21; padding-bottom: 5px; }
    .info-row { display: flex; margin: 8px 0; }
    .info-label { width: 120px; color: #666; }
    .info-value { font-weight: 500; }
    .fee-box { background-color: #fff5eb; padding: 15px; border-radius: 8px; text-align: center; }
    .fee-amount { font-size: 24px; font-weight: bold; color: #f16f21; }
    .balance-box { background-color: #f0f9ff; padding: 15px; border-radius: 8px; }
    .balance-row { display: flex; justify-content: space-between; margin: 5px 0; }
    .balance-label { color: #666; }
    .balance-value { font-weight: 500; }
    .balance-new { color: #f16f21; font-weight: bold; }
    .cta-button { display: inline-block; background-color: #f16f21; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 15px; }
    .footer { text-align: center; color: #999; font-size: 12px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 20px;">案件紹介のお知らせ</h1>
    </div>
    <div class="content">
      <p>${data.partnerCompanyName} 様</p>
      <p>新しい案件が紹介されました。</p>

      <div class="section">
        <div class="section-title">案件情報</div>
        <div class="info-row">
          <span class="info-label">診断番号:</span>
          <span class="info-value">${data.diagnosisNumber}</span>
        </div>
        <div class="info-row">
          <span class="info-label">顧客名:</span>
          <span class="info-value">${data.customerName}</span>
        </div>
        <div class="info-row">
          <span class="info-label">都道府県:</span>
          <span class="info-value">${prefectureLabel}</span>
        </div>
        <div class="info-row">
          <span class="info-label">工事種別:</span>
          <span class="info-value">${constructionTypeLabel}</span>
        </div>
        <div class="info-row">
          <span class="info-label">延床面積:</span>
          <span class="info-value">${floorAreaLabel}</span>
        </div>
      </div>

      <div class="section">
        <div class="section-title">紹介料</div>
        <div class="fee-box">
          <div class="fee-amount">¥${data.referralFee.toLocaleString()}</div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">保証金残高</div>
        <div class="balance-box">
          <div class="balance-row">
            <span class="balance-label">変更前:</span>
            <span class="balance-value">¥${data.previousBalance.toLocaleString()}</span>
          </div>
          <div class="balance-row">
            <span class="balance-label">変更後:</span>
            <span class="balance-value balance-new">¥${data.newBalance.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div style="text-align: center;">
        <a href="https://gaiheki-orange.vercel.app/partner-dashboard/referrals" class="cta-button">
          ダッシュボードで確認する
        </a>
      </div>
    </div>
    <div class="footer">
      <p>外壁オレンジ</p>
      <p>このメールは自動送信されています。</p>
    </div>
  </div>
</body>
</html>
`;

  return { subject, text, html };
}

// メール送信関数（実際の送信処理はメールサービスの設定後に実装）
export async function sendReferralNotificationEmail(data: ReferralEmailData): Promise<boolean> {
  try {
    const { subject, text, html } = generateReferralEmailContent(data);

    // TODO: 実際のメール送信処理をここに実装
    // 例: SendGrid, AWS SES, Resendなど

    // 現時点ではコンソールログに出力
    console.log('=== Referral Notification Email ===');
    console.log('To:', data.partnerEmail);
    console.log('Subject:', subject);
    console.log('---');
    console.log(text);
    console.log('===================================');

    // メールサービスが設定されていない場合は成功として扱う
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
}
