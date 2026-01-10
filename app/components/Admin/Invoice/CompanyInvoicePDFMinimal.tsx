'use client';

import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

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
  section: {
    marginBottom: 15,
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
});

interface Props {
  invoice: {
    invoice_number: string;
    company_name: string;
    issue_date: string;
    due_date: string;
    total_amount: number;
    tax_amount: number;
    grand_total: number;
  };
}

const CompanyInvoicePDFMinimal: React.FC<Props> = ({ invoice }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>請求書</Text>
        <Text>請求書番号: {invoice.invoice_number}</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.row}>
          <Text style={styles.label}>請求先:</Text>
          <Text style={styles.value}>{invoice.company_name}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>発行日:</Text>
          <Text style={styles.value}>{invoice.issue_date}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>支払期日:</Text>
          <Text style={styles.value}>{invoice.due_date}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.row}>
          <Text style={styles.label}>小計:</Text>
          <Text style={styles.value}>¥{invoice.total_amount}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>消費税:</Text>
          <Text style={styles.value}>¥{invoice.tax_amount}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>合計:</Text>
          <Text style={styles.value}>¥{invoice.grand_total}</Text>
        </View>
      </View>
    </Page>
  </Document>
);

export default CompanyInvoicePDFMinimal;
