import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/infrastructure/database/prisma.client';
import { requireAdminAuth } from '@/lib/utils/adminAuth';
import PDFDocument from 'pdfkit';

// 日付フォーマット関数
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}年${month}月${day}日`;
}

// POST: 複数の請求書をまとめてPDF生成
export async function POST(request: NextRequest) {
  try {
    const { error } = await requireAdminAuth();
    if (error) return error;

    const { invoice_ids } = await request.json();

    if (!invoice_ids || !Array.isArray(invoice_ids) || invoice_ids.length === 0) {
      return NextResponse.json(
        { success: false, error: '請求書IDを指定してください' },
        { status: 400 }
      );
    }

    // 最初の請求書のみ処理（複数対応は後で実装）
    const invoiceId = invoice_ids[0];

    // 請求書データを取得
    const invoice = await prisma.company_invoices.findUnique({
      where: { id: invoiceId },
      include: {
        partner: {
          include: {
            partner_details: true,
          },
        },
      },
    });

    if (!invoice) {
      return NextResponse.json(
        { success: false, error: '請求書が見つかりません' },
        { status: 404 }
      );
    }

    // 請求書明細を取得
    const items = await prisma.company_invoice_items.findMany({
      where: { invoice_id: invoiceId },
      select: {
        description: true,
        amount: true,
      },
    });

    // 運営会社情報を取得（存在しない場合はデフォルト値）
    let companySettings = null;
    try {
      companySettings = await prisma.company_settings.findFirst();
    } catch (error) {
      console.log('company_settings table not found, using default values');
    }

    // PDFデータを準備
    const pdfData = {
      invoice_number: invoice.invoice_number,
      company_name: invoice.partner.partner_details?.company_name || '会社名未設定',
      issue_date: invoice.issue_date.toISOString(),
      due_date: invoice.due_date.toISOString(),
      billing_period_start: invoice.billing_period_start.toISOString(),
      billing_period_end: invoice.billing_period_end.toISOString(),
      items: items,
      total_amount: invoice.total_amount,
      tax_amount: invoice.tax_amount,
      grand_total: invoice.grand_total,
      sender_company_name: companySettings?.company_name || 'Gaiheki Matching Service',
      sender_address: companySettings?.invoice_address || 'Tokyo, Japan',
      sender_phone: companySettings?.company_phone || '000-0000-0000',
    };

    // PDFKitでPDFを生成
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk) => chunks.push(chunk));

    const pdfPromise = new Promise<Buffer>((resolve) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
    });

    // === PDFコンテンツを作成 ===

    // ヘッダー
    doc.fontSize(24).text('請求書', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(10).text(`請求書番号: ${pdfData.invoice_number}`, { align: 'left' });
    doc.text(`発行日: ${formatDate(pdfData.issue_date)}`, { align: 'right' });
    doc.moveDown(2);

    // 宛先（加盟店）
    doc.fontSize(12).text('請求先', { underline: true });
    doc.moveDown(0.3);
    doc.fontSize(14).text(`${pdfData.company_name} 御中`);
    doc.moveDown(2);

    // 差出人（運営会社）
    doc.fontSize(10).text('発行元', { underline: true });
    doc.moveDown(0.3);
    doc.text(pdfData.sender_company_name);
    if (pdfData.sender_address) doc.text(pdfData.sender_address);
    if (pdfData.sender_phone) doc.text(`TEL: ${pdfData.sender_phone}`);
    doc.moveDown(2);

    // 請求金額サマリー
    doc.rect(50, doc.y, 500, 60).fillAndStroke('#f0f7ff', '#d0e4ff');
    doc.fillColor('#000');
    const summaryY = doc.y + 15;
    doc.fontSize(11).text('ご請求金額', 70, summaryY);
    doc.fontSize(20).text(`¥${pdfData.grand_total.toLocaleString()}`, 70, summaryY + 20);
    doc.y += 70;
    doc.moveDown(1);

    // 請求期間・支払期日
    doc.fontSize(10);
    doc.text(`請求期間: ${formatDate(pdfData.billing_period_start)} 〜 ${formatDate(pdfData.billing_period_end)}`);
    doc.text(`お支払期日: ${formatDate(pdfData.due_date)}`);
    doc.moveDown(2);

    // 請求明細テーブル
    doc.fontSize(12).text('請求明細', { underline: true });
    doc.moveDown(0.5);

    const tableTop = doc.y;
    const itemX = 50;
    const amountX = 400;

    // テーブルヘッダー
    doc.fontSize(10).fillColor('#000');
    doc.rect(50, tableTop, 500, 25).fillAndStroke('#f5f5f5', '#333');
    doc.fillColor('#000');
    doc.text('項目', itemX + 10, tableTop + 8);
    doc.text('金額', amountX + 10, tableTop + 8);

    let currentY = tableTop + 25;

    // テーブル行
    pdfData.items.forEach((item, index) => {
      const rowColor = index % 2 === 1 ? '#fafafa' : '#ffffff';
      doc.rect(50, currentY, 500, 30).fillAndStroke(rowColor, '#e0e0e0');
      doc.fillColor('#000');
      doc.text(item.description, itemX + 10, currentY + 10, { width: 330 });
      doc.text(`¥${item.amount.toLocaleString()}`, amountX + 10, currentY + 10, { align: 'right' });
      currentY += 30;
    });

    doc.y = currentY + 20;

    // 合計セクション
    const totalX = 350;
    doc.fontSize(11);
    doc.text('小計（税抜）', totalX, doc.y);
    doc.text(`¥${pdfData.total_amount.toLocaleString()}`, 480, doc.y, { align: 'right' });
    doc.moveDown(0.5);

    doc.text('消費税（10%）', totalX, doc.y);
    doc.text(`¥${pdfData.tax_amount.toLocaleString()}`, 480, doc.y, { align: 'right' });
    doc.moveDown(0.5);

    // 合計
    const grandTotalY = doc.y;
    doc.rect(totalX - 10, grandTotalY - 5, 210, 30).fillAndStroke('#f0f7ff', '#000');
    doc.fillColor('#000');
    doc.fontSize(13).text('合計（税込）', totalX, grandTotalY + 3);
    doc.text(`¥${pdfData.grand_total.toLocaleString()}`, 480, grandTotalY + 3, { align: 'right' });

    // フッター
    doc.fontSize(8).fillColor('#666');
    const footerY = 750;
    doc.text('お支払いは支払期日までに指定口座へお振込みください。', 50, footerY, { align: 'center' });
    doc.text(`請求書番号: ${pdfData.invoice_number}`, { align: 'center' });

    doc.end();

    const pdfBuffer = await pdfPromise;

    // PDFを返す
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${invoice.invoice_number}.pdf"`,
      },
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json(
      { success: false, error: 'PDFの生成に失敗しました' },
      { status: 500 }
    );
  }
}
