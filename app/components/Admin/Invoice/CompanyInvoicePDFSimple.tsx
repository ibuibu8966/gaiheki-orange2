'use client';

import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// スタイル定義（パートナー側と同じ構造）
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
  },
  invoiceNumber: {
    fontSize: 14,
    marginBottom: 5,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
    borderBottom: '1 solid #000',
    paddingBottom: 3,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  label: {
    width: '30%',
    fontWeight: 'bold',
  },
  value: {
    width: '70%',
  },
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    padding: 5,
    fontWeight: 'bold',
    borderBottom: '1 solid #000',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 5,
    borderBottom: '0.5 solid #ddd',
  },
  col1: { width: '70%' },
  col2: { width: '30%', textAlign: 'right' },
  totals: {
    marginTop: 20,
    alignItems: 'flex-end',
  },
  totalRow: {
    flexDirection: 'row',
    width: '50%',
    justifyContent: 'space-between',
    marginBottom: 5,
    paddingHorizontal: 10,
  },
  grandTotalRow: {
    flexDirection: 'row',
    width: '50%',
    justifyContent: 'space-between',
    marginBottom: 5,
    paddingHorizontal: 10,
    fontSize: 14,
    fontWeight: 'bold',
    borderTop: '1 solid #000',
    paddingTop: 5,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    fontSize: 8,
    color: '#666',
    borderTop: '0.5 solid #ddd',
    paddingTop: 10,
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

const CompanyInvoicePDFSimple: React.FC<Props> = ({ invoice }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* ヘッダー */}
      <View style={styles.header}>
        <Text style={styles.title}>請求書</Text>
        <Text style={styles.invoiceNumber}>請求書番号: {invoice.invoice_number}</Text>
      </View>

      {/* 宛先（加盟店） */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>請求先</Text>
        <View style={styles.row}>
          <Text style={styles.label}>会社名:</Text>
          <Text style={styles.value}>{invoice.company_name} 御中</Text>
        </View>
      </View>

      {/* 発行元（運営会社） */}
      {invoice.sender_company_name && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>発行元</Text>
          <View style={styles.row}>
            <Text style={styles.label}>会社名:</Text>
            <Text style={styles.value}>{invoice.sender_company_name}</Text>
          </View>
          {invoice.sender_address && (
            <View style={styles.row}>
              <Text style={styles.label}>住所:</Text>
              <Text style={styles.value}>{invoice.sender_address}</Text>
            </View>
          )}
          {invoice.sender_phone && (
            <View style={styles.row}>
              <Text style={styles.label}>電話番号:</Text>
              <Text style={styles.value}>{invoice.sender_phone}</Text>
            </View>
          )}
        </View>
      )}

      {/* 日付情報 */}
      <View style={styles.section}>
        <View style={styles.row}>
          <Text style={styles.label}>発行日:</Text>
          <Text style={styles.value}>{invoice.issue_date}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>支払期日:</Text>
          <Text style={styles.value}>{invoice.due_date}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>請求期間:</Text>
          <Text style={styles.value}>
            {invoice.billing_period_start} 〜 {invoice.billing_period_end}
          </Text>
        </View>
      </View>

      {/* 請求明細 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>請求明細</Text>
        <View style={styles.table}>
          {/* テーブルヘッダー */}
          <View style={styles.tableHeader}>
            <Text style={styles.col1}>項目</Text>
            <Text style={styles.col2}>金額</Text>
          </View>
          {/* テーブルボディ */}
          {invoice.items.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.col1}>{item.description}</Text>
              <Text style={styles.col2}>¥{item.amount.toLocaleString()}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 合計 */}
      <View style={styles.totals}>
        <View style={styles.totalRow}>
          <Text>小計（税抜）:</Text>
          <Text>¥{invoice.total_amount.toLocaleString()}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text>消費税（10%）:</Text>
          <Text>¥{invoice.tax_amount.toLocaleString()}</Text>
        </View>
        <View style={styles.grandTotalRow}>
          <Text>合計（税込）:</Text>
          <Text>¥{invoice.grand_total.toLocaleString()}</Text>
        </View>
      </View>

      {/* フッター */}
      <View style={styles.footer}>
        <Text>お支払いは支払期日までに指定口座へお振込みください。</Text>
        <Text>請求書番号: {invoice.invoice_number}</Text>
      </View>
    </Page>
  </Document>
);

export default CompanyInvoicePDFSimple;
