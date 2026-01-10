import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { NotoSansJPFont } from './NotoSansJP-font';

interface InvoiceItem {
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
  amount: number;
}

interface CustomerInvoiceData {
  invoice_number: string;
  customer_name: string;
  customer_address: string;
  issue_date: Date | string;
  due_date: Date | string;
  total_amount: number;
  tax_amount: number;
  grand_total: number;
  items: InvoiceItem[];
  // Partner情報（発行元）
  partner_company_name: string;
  partner_address: string;
  partner_phone: string;
  partner_invoice_registration_number?: string;
  partner_bank_name?: string;
  partner_bank_branch?: string;
  partner_bank_account_type?: string;
  partner_bank_account_number?: string;
  partner_bank_account_holder?: string;
}

function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

export function generateCustomerInvoicePDF(invoice: CustomerInvoiceData): Buffer {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // 日本語フォントを追加
  doc.addFileToVFS('NotoSansJP-Regular.ttf', NotoSansJPFont);
  doc.addFont('NotoSansJP-Regular.ttf', 'NotoSansJP', 'normal');
  doc.setFont('NotoSansJP');

  let yPosition = 20;

  // タイトル
  doc.setFontSize(20);
  doc.text('請求書', 105, yPosition, { align: 'center' });
  yPosition += 15;

  // 請求書番号と発行日
  doc.setFontSize(10);
  doc.text(`請求書番号: ${invoice.invoice_number}`, 20, yPosition);
  doc.text(`発行日: ${formatDate(invoice.issue_date)}`, 150, yPosition);
  yPosition += 7;
  doc.text(`支払期限: ${formatDate(invoice.due_date)}`, 150, yPosition);
  yPosition += 10;

  // 請求先（顧客情報）
  doc.setFontSize(12);
  doc.text('請求先:', 20, yPosition);
  yPosition += 7;
  doc.setFontSize(10);
  doc.text(invoice.customer_name, 20, yPosition);
  yPosition += 5;
  if (invoice.customer_address) {
    const addressLines = doc.splitTextToSize(invoice.customer_address, 80);
    doc.text(addressLines, 20, yPosition);
    yPosition += addressLines.length * 5;
  }
  yPosition += 10;

  // 発行元（Partner情報）
  const senderX = 130;
  let senderY = 45;
  doc.setFontSize(10);
  doc.text('発行元:', senderX, senderY);
  senderY += 5;
  doc.text(invoice.partner_company_name, senderX, senderY);
  senderY += 5;
  if (invoice.partner_address) {
    const addressLines = doc.splitTextToSize(invoice.partner_address, 70);
    doc.text(addressLines, senderX, senderY);
    senderY += addressLines.length * 5;
  }
  if (invoice.partner_phone) {
    doc.text(`Tel: ${invoice.partner_phone}`, senderX, senderY);
    senderY += 5;
  }
  if (invoice.partner_invoice_registration_number) {
    doc.text(`登録番号: ${invoice.partner_invoice_registration_number}`, senderX, senderY);
    senderY += 5;
  }

  // 明細テーブル
  const tableData = invoice.items.map((item) => [
    item.description,
    item.quantity.toString(),
    item.unit,
    `¥${item.unit_price.toLocaleString()}`,
    `¥${item.amount.toLocaleString()}`,
  ]);

  autoTable(doc, {
    startY: yPosition,
    head: [['項目', '数量', '単位', '単価', '金額']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [240, 240, 240],
      textColor: [0, 0, 0],
      fontStyle: 'normal',
      font: 'NotoSansJP',
    },
    bodyStyles: {
      font: 'NotoSansJP',
    },
    styles: {
      font: 'NotoSansJP',
      fontSize: 9,
    },
    columnStyles: {
      0: { cellWidth: 70 },
      1: { cellWidth: 20, halign: 'right' },
      2: { cellWidth: 20, halign: 'center' },
      3: { cellWidth: 35, halign: 'right' },
      4: { cellWidth: 35, halign: 'right' },
    },
    margin: { left: 20, right: 20 },
  });

  // テーブル終了位置を取得
  const finalY = (doc as any).lastAutoTable.finalY || yPosition + 50;
  yPosition = finalY + 10;

  // 合計金額
  const summaryX = 130;
  doc.setFontSize(10);
  doc.text('小計:', summaryX, yPosition);
  doc.text(`¥${invoice.total_amount.toLocaleString()}`, 190, yPosition, { align: 'right' });
  yPosition += 7;

  doc.text('消費税:', summaryX, yPosition);
  doc.text(`¥${invoice.tax_amount.toLocaleString()}`, 190, yPosition, { align: 'right' });
  yPosition += 7;

  doc.setFontSize(12);
  doc.setFont('NotoSansJP', 'normal');
  doc.text('合計金額:', summaryX, yPosition);
  doc.text(`¥${invoice.grand_total.toLocaleString()}`, 190, yPosition, { align: 'right' });
  yPosition += 15;

  // 銀行口座情報
  if (
    invoice.partner_bank_name &&
    invoice.partner_bank_branch &&
    invoice.partner_bank_account_number
  ) {
    doc.setFontSize(10);
    doc.text('お振込先:', 20, yPosition);
    yPosition += 7;
    doc.text(`銀行名: ${invoice.partner_bank_name}`, 20, yPosition);
    yPosition += 5;
    doc.text(`支店名: ${invoice.partner_bank_branch}`, 20, yPosition);
    yPosition += 5;
    if (invoice.partner_bank_account_type) {
      doc.text(
        `口座種別: ${invoice.partner_bank_account_type} ${invoice.partner_bank_account_number}`,
        20,
        yPosition
      );
      yPosition += 5;
    }
    if (invoice.partner_bank_account_holder) {
      doc.text(`口座名義: ${invoice.partner_bank_account_holder}`, 20, yPosition);
      yPosition += 5;
    }
  }

  // PDFをBufferとして返す
  const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
  return pdfBuffer;
}

