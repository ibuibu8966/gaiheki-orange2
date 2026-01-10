import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateInvoicePDF } from '@/lib/generateInvoicePDF';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const invoiceId = parseInt(id);

    // 請求書データを取得
    const invoice = await prisma.company_invoices.findUnique({
      where: { id: invoiceId },
      include: {
        partner: {
          select: {
            id: true,
            login_email: true,
            partner_details: {
              select: {
                company_name: true,
                address: true,
                phone_number: true,
              },
            },
          },
        },
        invoice_items: {
          select: {
            id: true,
            description: true,
            amount: true,
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

    // 会社設定情報を取得（存在しない場合はnull）
    let companySettings = null;
    try {
      companySettings = await prisma.company_settings.findFirst();
    } catch (error) {
      console.warn('company_settingsテーブルが存在しません:', error);
    }

    // PDFに渡すデータを整形
    const pdfData = {
      invoice_number: invoice.invoice_number,
      company_name: invoice.partner.partner_details?.company_name || '会社名未設定',
      issue_date: invoice.issue_date,
      due_date: invoice.due_date,
      billing_period_start: invoice.billing_period_start,
      billing_period_end: invoice.billing_period_end,
      total_amount: Number(invoice.total_amount),
      tax_amount: Number(invoice.tax_amount),
      grand_total: Number(invoice.grand_total),
      items: invoice.invoice_items.map((item) => ({
        description: item.description,
        amount: Number(item.amount),
      })),
      sender_company_name: companySettings?.company_name || '株式会社サンプル',
      sender_address: companySettings?.address || '',
      sender_phone: companySettings?.phone || '',
      sender_bank_name: companySettings?.bank_name || undefined,
      sender_bank_branch: companySettings?.bank_branch_name || undefined,
      sender_bank_account_type: companySettings?.bank_account_type || undefined,
      sender_bank_account_number: companySettings?.bank_account_number || undefined,
      sender_bank_account_holder: companySettings?.bank_account_holder || undefined,
    };

    // jsPDFでPDFを生成
    const pdfBuffer = generateInvoicePDF(pdfData);

    // PDFをレスポンスとして返す
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice_${invoice.invoice_number}.pdf"`,
      },
    });
  } catch (error) {
    console.error('PDF生成エラー:', error);
    return NextResponse.json(
      { success: false, error: 'PDF生成に失敗しました' },
      { status: 500 }
    );
  }
}

