'use client';

import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// INVOY風のプロフェッショナルなスタイル定義
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
  },
  // ヘッダーセクション
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1a1a1a',
  },
  invoiceNumber: {
    fontSize: 11,
    color: '#666',
    marginBottom: 3,
  },
  dateText: {
    fontSize: 10,
    color: '#666',
    marginBottom: 2,
  },
  // 宛先セクション
  recipient: {
    marginBottom: 25,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 4,
  },
  recipientTitle: {
    fontSize: 10,
    color: '#666',
    marginBottom: 5,
  },
  recipientName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 3,
    color: '#1a1a1a',
  },
  // 差出人セクション
  sender: {
    marginBottom: 25,
    borderTop: '1 solid #e0e0e0',
    paddingTop: 15,
  },
  senderTitle: {
    fontSize: 10,
    color: '#666',
    marginBottom: 5,
  },
  senderInfo: {
    fontSize: 10,
    color: '#333',
    marginBottom: 2,
  },
  // 請求金額サマリー
  amountSummary: {
    backgroundColor: '#f0f7ff',
    padding: 20,
    marginBottom: 25,
    borderRadius: 4,
    border: '1 solid #d0e4ff',
  },
  amountLabel: {
    fontSize: 11,
    color: '#666',
    marginBottom: 5,
  },
  amountValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  // 請求期間・支払期日
  periodInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
    padding: 15,
    backgroundColor: '#fafafa',
    borderRadius: 4,
  },
  periodItem: {
    flex: 1,
  },
  periodLabel: {
    fontSize: 9,
    color: '#666',
    marginBottom: 3,
  },
  periodValue: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  // テーブル
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1a1a1a',
    borderBottom: '2 solid #1a1a1a',
    paddingBottom: 5,
  },
  table: {
    marginTop: 5,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    padding: 10,
    fontWeight: 'bold',
    borderBottom: '1.5 solid #333',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 10,
    borderBottom: '0.5 solid #e0e0e0',
    minHeight: 35,
  },
  tableRowAlt: {
    backgroundColor: '#fafafa',
  },
  colDescription: {
    width: '60%',
    paddingRight: 10,
  },
  colAmount: {
    width: '40%',
    textAlign: 'right',
  },
  // 合計セクション
  totals: {
    marginTop: 20,
    alignItems: 'flex-end',
  },
  totalRow: {
    flexDirection: 'row',
    width: '60%',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 15,
  },
  totalLabel: {
    fontSize: 11,
    color: '#333',
  },
  totalValue: {
    fontSize: 11,
    color: '#333',
  },
  grandTotalRow: {
    flexDirection: 'row',
    width: '60%',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#f0f7ff',
    borderRadius: 4,
  },
  grandTotalLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  grandTotalValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  // フッター
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    paddingTop: 15,
    borderTop: '0.5 solid #e0e0e0',
  },
  footerText: {
    fontSize: 8,
    color: '#999',
    marginBottom: 2,
    textAlign: 'center',
  },
});

interface InvoiceItem {
  description: string;
  amount: number;
}

interface CompanyInvoiceData {
  invoice_number: string;
  company_name: string;
  issue_date: string;
  due_date: string;
  billing_period_start: string;
  billing_period_end: string;
  items: InvoiceItem[];
  total_amount: number;
  tax_amount: number;
  grand_total: number;
  sender_company_name?: string;
  sender_address?: string;
  sender_phone?: string;
}

interface Props {
  invoice: CompanyInvoiceData;
}

const CompanyInvoicePDF: React.FC<Props> = ({ invoice }) => {
  // 日付フォーマット関数
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}年${month}月${day}日`;
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* ヘッダー */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>請求書</Text>
            <Text style={styles.invoiceNumber}>請求書番号: {invoice.invoice_number}</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.dateText}>発行日: {formatDate(invoice.issue_date)}</Text>
          </View>
        </View>

        {/* 宛先（加盟店） */}
        <View style={styles.recipient}>
          <Text style={styles.recipientTitle}>請求先</Text>
          <Text style={styles.recipientName}>{invoice.company_name} 御中</Text>
        </View>

        {/* 差出人（運営会社） */}
        <View style={styles.sender}>
          <Text style={styles.senderTitle}>発行元</Text>
          <Text style={styles.senderInfo}>
            {invoice.sender_company_name || 'Gaiheki Matching Service'}
          </Text>
          {invoice.sender_address && (
            <Text style={styles.senderInfo}>{invoice.sender_address}</Text>
          )}
          {invoice.sender_phone && (
            <Text style={styles.senderInfo}>TEL: {invoice.sender_phone}</Text>
          )}
        </View>

        {/* 請求金額サマリー */}
        <View style={styles.amountSummary}>
          <Text style={styles.amountLabel}>ご請求金額</Text>
          <Text style={styles.amountValue}>¥{invoice.grand_total.toLocaleString()}</Text>
        </View>

        {/* 請求期間・支払期日 */}
        <View style={styles.periodInfo}>
          <View style={styles.periodItem}>
            <Text style={styles.periodLabel}>請求期間</Text>
            <Text style={styles.periodValue}>
              {formatDate(invoice.billing_period_start)} 〜 {formatDate(invoice.billing_period_end)}
            </Text>
          </View>
          <View style={styles.periodItem}>
            <Text style={styles.periodLabel}>お支払期日</Text>
            <Text style={styles.periodValue}>{formatDate(invoice.due_date)}</Text>
          </View>
        </View>

        {/* 請求明細 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>請求明細</Text>
          <View style={styles.table}>
            {/* テーブルヘッダー */}
            <View style={styles.tableHeader}>
              <Text style={styles.colDescription}>項目</Text>
              <Text style={styles.colAmount}>金額</Text>
            </View>
            {/* テーブルボディ */}
            {invoice.items.map((item, index) => (
              <View
                key={index}
                style={[
                  styles.tableRow,
                  index % 2 === 1 ? styles.tableRowAlt : {},
                ]}
              >
                <Text style={styles.colDescription}>{item.description}</Text>
                <Text style={styles.colAmount}>¥{item.amount.toLocaleString()}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 合計 */}
        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>小計（税抜）</Text>
            <Text style={styles.totalValue}>¥{invoice.total_amount.toLocaleString()}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>消費税（10%）</Text>
            <Text style={styles.totalValue}>¥{invoice.tax_amount.toLocaleString()}</Text>
          </View>
          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalLabel}>合計（税込）</Text>
            <Text style={styles.grandTotalValue}>¥{invoice.grand_total.toLocaleString()}</Text>
          </View>
        </View>

        {/* フッター */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>お支払いは支払期日までに指定口座へお振込みください。</Text>
          <Text style={styles.footerText}>
            請求書番号: {invoice.invoice_number}
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default CompanyInvoicePDF;
