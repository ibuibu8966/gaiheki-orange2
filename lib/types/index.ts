// lib/types/index.ts
// 共通型定義ファイル

import type { Prisma } from '@prisma/client';

// ===== Partner 関連 =====

export interface PartnerData {
  id?: number;
  applicationId?: number;
  username: string;
  loginEmail: string;
  companyName: string;
  phone: string;
  address: string;
  representativeName: string;
  websiteUrl?: string | null;
  businessDescription: string;
  appealText: string;
  prefectures: string[];
  faxNumber?: string | null;
  businessHours?: string | null;
  closedDays?: string | null;
  siteReprintPrefecture?: string | null;
  invoiceRegistrationNumber?: string | null;
  bankName?: string | null;
  bankBranchName?: string | null;
  bankAccountType?: string | null;
  bankAccountNumber?: string | null;
  bankAccountHolder?: string | null;
}

export interface PartnerListItem {
  id: number;
  companyName: string;
  email: string;
  phone: string;
  address: string;
  prefectures: string[];
  status: string;
  isActive: boolean;
  registrationDate: string;
  depositBalance: number;
  referralCount: number;
}

export interface PartnerReview {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
  customerName?: string;
}

// ===== Diagnosis 関連 =====

export interface DiagnosisData {
  id: number;
  diagnosisNumber: string;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string;
  address: string | null;
  prefecture: string;
  floorArea: string;
  currentSituation: string;
  constructionType: string;
  status: string;
  statusLabel: string;
  designatedPartnerId: number | null;
  designatedPartnerName: string | null;
  referralCount: number;
  referrals: ReferralData[];
  createdAt: string;
  customerEnthusiasm: number | null;
  desiredPartnerCount: number | null;
  referralFee: number;
  adminNote: string | null;
}

export interface ReferralData {
  id: string;
  partnerId: number;
  partnerName: string;
  referralFee: number;
  emailSent: boolean;
}

// ===== Inquiry 関連 =====

export interface InquiryData {
  id: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  subject: string;
  inquiryContent: string;
  inquiryStatus: string;
  statusLabel: string;
  adminMemo: string | null;
  createdAt: string;
}

// ===== Application 関連 =====

export interface ApplicationData {
  id: number;
  companyName: string;
  representativeName: string;
  address: string;
  phone: string;
  email: string;
  websiteUrl: string | null;
  businessDescription: string;
  selfPr: string;
  status: string;
  statusLabel: string;
  prefectures: string[];
  applicationDate: string;
  reviewedBy?: string;
  reviewedAt?: string;
  adminMemo?: string;
  reviewNotes?: string;
}

// ===== Article 関連 =====

export interface ArticleData {
  id: number;
  title: string;
  category: string;
  content: string;
  thumbnailImage: string | null;
  isPublished: boolean;
  postName: string;
  createdAt: string;
  updatedAt: string;
}

// ===== API WhereInput Types =====

export type PartnerWhereInput = Prisma.partnersWhereInput;
export type DiagnosisWhereInput = Prisma.diagnosis_requestsWhereInput;
export type InquiryWhereInput = Prisma.inquiriesWhereInput;
export type ApplicationWhereInput = Prisma.partner_applicationsWhereInput;
export type ArticleWhereInput = Prisma.articlesWhereInput;
export type ReferralWhereInput = Prisma.ReferralWhereInput;

// ===== API UpdateData Types =====

export type PartnerUpdateData = Prisma.partnersUpdateInput;
export type PartnerDetailsUpdateData = Prisma.partner_detailsUpdateInput;
export type DiagnosisUpdateData = Prisma.diagnosis_requestsUpdateInput;
export type InquiryUpdateData = Prisma.inquiriesUpdateInput;
export type ArticleUpdateData = Prisma.articlesUpdateInput;

// ===== Form Data Types =====

export interface PartnerFormData {
  username: string;
  loginEmail: string;
  password?: string;
  companyName: string;
  phone: string;
  address: string;
  representativeName: string;
  websiteUrl?: string;
  businessDescription: string;
  appealText: string;
  prefectures: string[];
  faxNumber?: string;
  businessHours?: string;
  closedDays?: string;
  siteReprintPrefecture?: string;
  invoiceRegistrationNumber?: string;
  bankName?: string;
  bankBranchName?: string;
  bankAccountType?: string;
  bankAccountNumber?: string;
  bankAccountHolder?: string;
}

export interface DiagnosisFormData {
  customerName: string;
  customerEmail?: string;
  customerPhone: string;
  customerAddress?: string;
  customerEnthusiasm?: number;
  desiredPartnerCount?: number;
  referralFee?: number;
  adminNote?: string;
}

export interface ArticleFormData {
  title: string;
  category: string;
  content: string;
  thumbnailImage?: string | null;
  isPublished: boolean;
  postName?: string;
  adminId?: number;
}

// ===== API Response Types =====

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  count?: number;
}

// ===== Deposit 関連 =====

export interface DepositHistoryData {
  id: string;
  partnerId: number;
  amount: number;
  type: 'DEPOSIT' | 'DEDUCTION';
  balance: number;
  description: string | null;
  diagnosisId: number | null;
  createdAt: string;
}

export interface DepositRequestData {
  id: string;
  partnerId: number;
  requestedAmount: number;
  approvedAmount: number | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  partnerNote: string | null;
  adminNote: string | null;
  createdAt: string;
  approvedAt: string | null;
  approvedBy: number | null;
}
