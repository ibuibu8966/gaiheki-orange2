import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/infrastructure/database/prisma.client';
import { requirePartnerAuth } from '@/lib/utils/partnerAuth';
import { generateCustomerInvoicePDF } from '@/lib/generateCustomerInvoicePDF';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 認証チェック
    const { error, partnerId } = await requirePartnerAuth();
    if (error) return error;

    const { id } = await params;
    const invoiceId = parseInt(id);

    // 請求書データを取得
    const invoice = await prisma.customer_invoices.findFirst({
      where: {
        id: invoiceId,
        order: {
          quotations: {
            partner_id: partnerId,
          },
        },
      },
      include: {
        order: {
          include: {
            quotations: {
              include: {
                diagnosis_requests: {
                  include: {
                    customers: true,
                  },
                },
                partners: {
                  include: {
                    partner_details: true,
                  },
                },
              },
            },
          },
        },
        invoice_items: true,
      },
    });

    if (!invoice) {
      return NextResponse.json(
        { success: false, error: '請求書が見つかりません' },
        { status: 404 }
      );
    }

    const customer = invoice.order.quotations.diagnosis_requests.customers;
    const partnerDetails = invoice.order.quotations.partners.partner_details;

    if (!partnerDetails) {
      return NextResponse.json(
        { success: false, error: 'パートナー情報が見つかりません' },
        { status: 404 }
      );
    }

    // PDF生成用のデータを準備
    const pdfData = {
      invoice_number: invoice.invoice_number,
      customer_name: customer.customer_name,
      customer_address: customer.construction_address,
      issue_date: invoice.issue_date,
      due_date: invoice.due_date,
      total_amount: invoice.total_amount,
      tax_amount: invoice.tax_amount,
      grand_total: invoice.grand_total,
      items: invoice.invoice_items.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        unit_price: item.unit_price,
        amount: item.amount,
      })),
      // Partner情報（発行元）
      partner_company_name: partnerDetails.company_name,
      partner_address: partnerDetails.address,
      partner_phone: partnerDetails.phone_number,
      partner_invoice_registration_number: partnerDetails.invoice_registration_number || undefined,
      partner_bank_name: partnerDetails.bank_name || undefined,
      partner_bank_branch: partnerDetails.bank_branch_name || undefined,
      partner_bank_account_type: partnerDetails.bank_account_type || undefined,
      partner_bank_account_number: partnerDetails.bank_account_number || undefined,
      partner_bank_account_holder: partnerDetails.bank_account_holder || undefined,
    };

    // PDFを生成
    const pdfBuffer = generateCustomerInvoicePDF(pdfData);

    // PDFをレスポンスとして返す
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice_${invoiceId}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating customer invoice PDF:', error);
    return NextResponse.json(
      { success: false, error: 'PDFの生成に失敗しました' },
      { status: 500 }
    );
  }
}
