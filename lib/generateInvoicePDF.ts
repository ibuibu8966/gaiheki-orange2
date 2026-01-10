import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { NotoSansJPFont } from './NotoSansJP-font';

interface InvoiceItem {
  description: string;
  amount: number;
}

interface InvoiceData {
  invoice_number: string;
  company_name: string;
  issue_date: Date | string;
  due_date: Date | string;
  billing_period_start: Date | string;
  billing_period_end: Date | string;
  total_amount: number;
  tax_amount: number;
  grand_total: number;
  items: InvoiceItem[];
  sender_company_name: string;
  sender_address: string;
  sender_phone: string;
  sender_bank_name?: string;
  sender_bank_branch?: string;
  sender_bank_account_type?: string;
  sender_bank_account_number?: string;
  sender_bank_account_holder?: string;
}

export function generateInvoicePDF(invoice: InvoiceData): Buffer {
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

  doc.setFontSize(20);
  doc.text('請求書', 105, yPosition, { align: 'center' });
  yPosition += 15;

  doc.setFontSize(10);
  doc.text(`請求書番号: ${invoice.invoice_number}`, 20, yPosition);
  doc.text(`発行日: ${formatDate(invoice.issue_date)}`, 150, yPosition);
  yPosition += 7;
  doc.text(`支払期限: ${formatDate(invoice.due_date)}`, 150, yPosition);
  yPosition += 10;

  doc.setFontSize(12);
  doc.text('請求先:', 20, yPosition);
  yPosition += 7;
  doc.setFontSize(10);
  doc.text(invoice.company_name, 20, yPosition);
  yPosition += 15;

  doc.setFontSize(10);
  const senderX = 150;
  doc.text('発行元:', senderX, yPosition - 8);
  doc.text(invoice.sender_company_name, senderX, yPosition);
  yPosition += 5;
  if (invoice.sender_address) {
    const addressLines = doc.splitTextToSize(invoice.sender_address, 50);
    doc.text(addressLines, senderX, yPosition);
    yPosition += addressLines.length * 5;
  }
  if (invoice.sender_phone) {
    doc.text(`Tel: ${invoice.sender_phone}`, senderX, yPosition);
    yPosition += 5;
  }
  yPosition += 10;

  doc.setFontSize(10);
  doc.text(
    `請求期間: ${formatDate(invoice.billing_period_start)} - ${formatDate(invoice.billing_period_end)}`,
    20,
    yPosition
  );
  yPosition += 10;

  const tableData = invoice.items.map((item) => [
    item.description,
    `¥${item.amount.toLocaleString()}`,
  ]);

  autoTable(doc, {
    startY: yPosition,
    head: [['項目', '金額']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [240, 240, 240],
      textColor: [0, 0, 0],
      fontStyle: 'normal',
    },
    styles: {
      font: 'NotoSansJP',
      fontSize: 10,
    },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { cellWidth: 50, halign: 'right' },
    },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 10;

  const summaryX = 140;
  doc.setFontSize(10);
  doc.text('小計:', summaryX, yPosition);
  doc.text(`¥${invoice.total_amount.toLocaleString()}`, 180, yPosition, { align: 'right' });
  yPosition += 7;

  doc.text('消費税 (10%):', summaryX, yPosition);
  doc.text(`¥${invoice.tax_amount.toLocaleString()}`, 180, yPosition, { align: 'right' });
  yPosition += 7;

  doc.setFontSize(12);
  doc.setFont('NotoSansJP', 'normal');
  doc.text('合計:', summaryX, yPosition);
  doc.text(`¥${invoice.grand_total.toLocaleString()}`, 180, yPosition, { align: 'right' });
  yPosition += 15;

  if (invoice.sender_bank_name) {
    doc.setFont('NotoSansJP', 'normal');
    doc.setFontSize(10);
    doc.text('振込先情報:', 20, yPosition);
    yPosition += 7;

    doc.text(`銀行名: ${invoice.sender_bank_name}`, 20, yPosition);
    yPosition += 5;

    if (invoice.sender_bank_branch) {
      doc.text(`支店名: ${invoice.sender_bank_branch}`, 20, yPosition);
      yPosition += 5;
    }

    if (invoice.sender_bank_account_type) {
      doc.text(`口座種別: ${invoice.sender_bank_account_type}`, 20, yPosition);
      yPosition += 5;
    }

    if (invoice.sender_bank_account_number) {
      doc.text(`口座番号: ${invoice.sender_bank_account_number}`, 20, yPosition);
      yPosition += 5;
    }

    if (invoice.sender_bank_account_holder) {
      doc.text(`口座名義: ${invoice.sender_bank_account_holder}`, 20, yPosition);
      yPosition += 5;
    }
  }

  const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
  return pdfBuffer;
}

function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
