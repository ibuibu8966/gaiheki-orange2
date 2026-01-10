'use client';

import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// INVOYスタイルのスタイル定義
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 9,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
  },
  // ヘッダー部分
  header: {
    marginBottom: 20,
    borderBottom: '2 solid #000000',
    paddingBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  invoiceNumber: {
    fontSize: 10,
    textAlign: 'right',
    marginBottom: 3,
  },
  // 上部情報セクション（請求先と発行元を横並び）
  topSection: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 20,
  },
  leftColumn: {
    width: '50%',
  },
  rightColumn: {
    width: '50%',
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 5,
    borderBottom: '1 solid #cccccc',
    paddingBottom: 2,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 3,
    fontSize: 9,
  },
  infoLabel: {
    width: '30%',
    color: '#666666',
  },
  infoValue: {
    width: '70%',
  },
  // 日付情報
  dateSection: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#f8f8f8',
    borderRadius: 3,
  },
  dateRow: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  dateLabel: {
    width: '25%',
    fontWeight: 'bold',
    fontSize: 9,
  },
  dateValue: {
    width: '75%',
    fontSize: 9,
  },
  // 請求明細テーブル
  table: {
    marginTop: 10,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#333333',
    color: '#ffffff',
    padding: 8,
    fontWeight: 'bold',
    fontSize: 9,
  },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottom: '0.5 solid #dddddd',
    fontSize: 9,
  },
  tableRowAlt: {
    flexDirection: 'row',
    padding: 8,
    borderBottom: '0.5 solid #dddddd',
    backgroundColor: '#f9f9f9',
    fontSize: 9,
  },
  col1: { width: '50%' }, // 品目
  col2: { width: '15%', textAlign: 'right' }, // 数量
  col3: { width: '20%', textAlign: 'right' }, // 単価
  col4: { width: '15%', textAlign: 'right' }, // 金額
  // 合計セクション
  totalsSection: {
    marginTop: 10,
    alignItems: 'flex-end',
  },
  totalRow: {
    flexDirection: 'row',
    width: '40%',
    justifyContent: 'space-between',
    padding: 5,
    borderBottom: '0.5 solid #dddddd',
    fontSize: 9,
  },
  grandTotalRow: {
    flexDirection: 'row',
    width: '40%',
    justifyContent: 'space-between',
    padding: 8,
    backgroundColor: '#f0f0f0',
    fontWeight: 'bold',
    fontSize: 11,
    marginTop: 5,
  },
  // 備考欄
  remarksSection: {
    marginTop: 20,
    padding: 10,
    borderTop: '1 solid #cccccc',
  },
  remarksTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  remarksText: {
    fontSize: 8,
    color: '#666666',
    lineHeight: 1.5,
  },
  // フッター
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 7,
    color: '#999999',
    textAlign: 'center',
    borderTop: '0.5 solid #dddddd',
    paddingTop: 10,
  },
});

interface InvoiceItem {
  description: string;
  amount: number;
  related_order_id?: number | null;
}

interface CompanySettings {
  company_name: string;
  postal_code?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  invoice_registration_number?: string | null;
  bank_name?: string | null;
  bank_branch_name?: string | null;
  bank_account_type?: string | null;
  bank_account_number?: string | null;
  bank_account_holder?: string | null;
}

interface Partner {
  company_name: string;
  address?: string | null;
  phone?: string | null;
}

interface InvoiceData {
  invoice_number: string;
  issue_date: string;
  due_date: string;
  billing_period_start: string;
  billing_period_end: string;
  total_amount: number;
  tax_amount: number;
  grand_total: number;
  items: InvoiceItem[];
  partner: Partner;
  company_settings?: CompanySettings;
}

interface Props {
  invoice: InvoiceData;
}

const CompanyInvoicePDFInvoice: React.FC<Props> = ({ invoice }) => {
  // 日付フォーマット関数
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}年${month}月${day}日`;
    } catch {
      return dateString;
    }
  };

  // 金額フォーマット関数
  const formatAmount = (amount: number) => {
    return `¥${Number(amount).toLocaleString()}`;
  };

  const companySettings = invoice.company_settings;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* ヘッダー */}
        <View style={styles.header}>
          <Text style={styles.title}>請求書</Text>
          <Text style={styles.invoiceNumber}>請求書番号: {invoice.invoice_number}</Text>
        </View>

        {/* 上部情報セクション */}
        <View style={styles.topSection}>
          {/* 左側: 請求先情報 */}
          <View style={styles.leftColumn}>
            <Text style={styles.sectionTitle}>請求先</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>会社名:</Text>
              <Text style={styles.infoValue}>{invoice.partner.company_name} 御中</Text>
            </View>
            {invoice.partner.address && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>住所:</Text>
                <Text style={styles.infoValue}>{invoice.partner.address}</Text>
              </View>
            )}
            {invoice.partner.phone && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>電話番号:</Text>
                <Text style={styles.infoValue}>{invoice.partner.phone}</Text>
              </View>
            )}
          </View>

          {/* 右側: 発行元情報 */}
          <View style={styles.rightColumn}>
            <Text style={styles.sectionTitle}>発行元</Text>
            {companySettings && (
              <>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>会社名:</Text>
                  <Text style={styles.infoValue}>{companySettings.company_name}</Text>
                </View>
                {companySettings.postal_code && companySettings.address && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>住所:</Text>
                    <Text style={styles.infoValue}>
                      〒{companySettings.postal_code} {companySettings.address}
                    </Text>
                  </View>
                )}
                {companySettings.phone && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>電話番号:</Text>
                    <Text style={styles.infoValue}>{companySettings.phone}</Text>
                  </View>
                )}
                {companySettings.email && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>メール:</Text>
                    <Text style={styles.infoValue}>{companySettings.email}</Text>
                  </View>
                )}
                {companySettings.invoice_registration_number && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>登録番号:</Text>
                    <Text style={styles.infoValue}>{companySettings.invoice_registration_number}</Text>
                  </View>
                )}
              </>
            )}
          </View>
        </View>

        {/* 日付情報 */}
        <View style={styles.dateSection}>
          <View style={styles.dateRow}>
            <Text style={styles.dateLabel}>請求期間:</Text>
            <Text style={styles.dateValue}>
              {formatDate(invoice.billing_period_start)} 〜 {formatDate(invoice.billing_period_end)}
            </Text>
          </View>
          <View style={styles.dateRow}>
            <Text style={styles.dateLabel}>発行日:</Text>
            <Text style={styles.dateValue}>{formatDate(invoice.issue_date)}</Text>
          </View>
          <View style={styles.dateRow}>
            <Text style={styles.dateLabel}>支払期日:</Text>
            <Text style={styles.dateValue}>{formatDate(invoice.due_date)}</Text>
          </View>
        </View>

        {/* 請求明細テーブル */}
        <View style={styles.table}>
          {/* テーブルヘッダー */}
          <View style={styles.tableHeader}>
            <Text style={styles.col1}>品目</Text>
            <Text style={styles.col2}>数量</Text>
            <Text style={styles.col3}>単価</Text>
            <Text style={styles.col4}>金額</Text>
          </View>
          {/* テーブルボディ */}
          {invoice.items.map((item, index) => (
            <View key={index} style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
              <Text style={styles.col1}>{item.description}</Text>
              <Text style={styles.col2}>1</Text>
              <Text style={styles.col3}>{formatAmount(item.amount)}</Text>
              <Text style={styles.col4}>{formatAmount(item.amount)}</Text>
            </View>
          ))}
        </View>

        {/* 合計セクション */}
        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text>小計（税抜）</Text>
            <Text>{formatAmount(invoice.total_amount)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text>消費税（10%）</Text>
            <Text>{formatAmount(invoice.tax_amount)}</Text>
          </View>
          <View style={styles.grandTotalRow}>
            <Text>合計（税込）</Text>
            <Text>{formatAmount(invoice.grand_total)}</Text>
          </View>
        </View>

        {/* 備考欄（振込先情報） */}
        {companySettings && companySettings.bank_name && (
          <View style={styles.remarksSection}>
            <Text style={styles.remarksTitle}>振込先情報</Text>
            <Text style={styles.remarksText}>
              銀行名: {companySettings.bank_name}
              {companySettings.bank_branch_name && ` ${companySettings.bank_branch_name}`}
            </Text>
            {companySettings.bank_account_type && companySettings.bank_account_number && (
              <Text style={styles.remarksText}>
                口座: {companySettings.bank_account_type} {companySettings.bank_account_number}
              </Text>
            )}
            {companySettings.bank_account_holder && (
              <Text style={styles.remarksText}>
                口座名義: {companySettings.bank_account_holder}
              </Text>
            )}
            <Text style={styles.remarksText}>
              ※ 振込手数料はご負担ください
            </Text>
          </View>
        )}

        {/* フッター */}
        <View style={styles.footer}>
          <Text>この請求書は電子的に生成されました。</Text>
          <Text>お支払いは支払期日までにお願いいたします。</Text>
        </View>
      </Page>
    </Document>
  );
};

export default CompanyInvoicePDFInvoice;

