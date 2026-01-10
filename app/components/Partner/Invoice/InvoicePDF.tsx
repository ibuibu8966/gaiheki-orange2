'use client';

import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// スタイル定義
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
  col1: { width: '40%' },
  col2: { width: '15%', textAlign: 'right' },
  col3: { width: '15%', textAlign: 'left' },
  col4: { width: '15%', textAlign: 'right' },
  col5: { width: '15%', textAlign: 'right' },
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
  quantity: number;
  unit: string;
  unit_price: number;
  amount: number;
}

interface Customer {
  name: string;
  email: string;
  phone: string;
  address: string;
}

interface InvoiceData {
  invoice_number: string;
  customer: Customer;
  issue_date: string;
  due_date: string;
  items: InvoiceItem[];
  total_amount: number;
  tax_amount: number;
  grand_total: number;
  company_name?: string;
  company_address?: string;
  company_phone?: string;
}

interface Props {
  invoice: InvoiceData;
}

const InvoicePDF: React.FC<Props> = ({ invoice }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* ヘッダー */}
      <View style={styles.header}>
        <Text style={styles.title}>請求書</Text>
        <Text style={styles.invoiceNumber}>請求書番号: {invoice.invoice_number}</Text>
      </View>

      {/* 顧客情報 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>請求先</Text>
        <View style={styles.row}>
          <Text style={styles.label}>氏名:</Text>
          <Text style={styles.value}>{invoice.customer.name} 様</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>住所:</Text>
          <Text style={styles.value}>{invoice.customer.address}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>電話番号:</Text>
          <Text style={styles.value}>{invoice.customer.phone}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>メール:</Text>
          <Text style={styles.value}>{invoice.customer.email}</Text>
        </View>
      </View>

      {/* 加盟店情報 */}
      {invoice.company_name && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>発行元</Text>
          <View style={styles.row}>
            <Text style={styles.label}>会社名:</Text>
            <Text style={styles.value}>{invoice.company_name}</Text>
          </View>
          {invoice.company_address && (
            <View style={styles.row}>
              <Text style={styles.label}>住所:</Text>
              <Text style={styles.value}>{invoice.company_address}</Text>
            </View>
          )}
          {invoice.company_phone && (
            <View style={styles.row}>
              <Text style={styles.label}>電話番号:</Text>
              <Text style={styles.value}>{invoice.company_phone}</Text>
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
      </View>

      {/* 請求明細 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>請求明細</Text>
        <View style={styles.table}>
          {/* テーブルヘッダー */}
          <View style={styles.tableHeader}>
            <Text style={styles.col1}>品目</Text>
            <Text style={styles.col2}>数量</Text>
            <Text style={styles.col3}>単位</Text>
            <Text style={styles.col4}>単価</Text>
            <Text style={styles.col5}>金額</Text>
          </View>
          {/* テーブルボディ */}
          {invoice.items.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.col1}>{item.description}</Text>
              <Text style={styles.col2}>{item.quantity}</Text>
              <Text style={styles.col3}>{item.unit}</Text>
              <Text style={styles.col4}>¥{item.unit_price.toLocaleString()}</Text>
              <Text style={styles.col5}>¥{item.amount.toLocaleString()}</Text>
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
        <Text>この請求書は電子的に生成されました。</Text>
        <Text>お支払いは支払期日までにお願いいたします。</Text>
      </View>
    </Page>
  </Document>
);

export default InvoicePDF;
