import { z } from "zod";
import {
  phoneSchema,
  emailSchema,
  passwordSchema,
  nameSchema,
  addressSchema,
  textareaSchema,
  urlSchema,
  invoiceNumberSchema,
  bankAccountNumberSchema,
} from "./index";

// ===== 公開フォーム =====

// 診断フォーム
export const diagnosisFormSchema = z.object({
  name: nameSchema,
  phone: phoneSchema,
  email: emailSchema.optional().or(z.literal("")),
  prefecture: z.string().min(1, "都道府県を選択してください"),
  floorArea: z.string().min(1, "延面積を選択してください"),
  currentSituation: z.string().min(1, "現在の状況を選択してください"),
  constructionType: z.string().min(1, "工事箇所を選択してください"),
});

// お問い合わせフォーム
export const contactFormSchema = z.object({
  name: nameSchema,
  phone: phoneSchema,
  email: emailSchema,
  subject: z.string().min(1, "件名を選択してください"),
  message: textareaSchema.min(1, "お問い合わせ内容を入力してください"),
});

// 加盟店登録フォーム
export const partnerRegistrationSchema = z.object({
  companyName: nameSchema,
  representativeName: nameSchema,
  address: addressSchema,
  phone: phoneSchema,
  email: emailSchema,
  website: urlSchema,
  businessContent: textareaSchema.optional(),
  appealPoints: textareaSchema.optional(),
});

// ===== 認証フォーム =====

// 管理者ログイン
export const adminLoginSchema = z.object({
  username: z.string().min(1, "ユーザー名を入力してください"),
  password: z.string().min(1, "パスワードを入力してください"),
});

// 加盟店ログイン
export const partnerLoginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "パスワードを入力してください"),
});

// ===== 管理画面フォーム =====

// 加盟店作成・編集フォーム
export const partnerFormSchema = z.object({
  username: z.string().min(1, "ユーザー名を入力してください").max(50),
  loginEmail: emailSchema,
  password: passwordSchema.optional().or(z.literal("")),
  companyName: nameSchema,
  phone: phoneSchema.optional().or(z.literal("")),
  faxNumber: phoneSchema.optional().or(z.literal("")),
  address: addressSchema.optional().or(z.literal("")),
  representativeName: nameSchema.optional().or(z.literal("")),
  websiteUrl: urlSchema,
  prefectures: z.array(z.string()).optional(),
  businessDescription: textareaSchema.optional(),
  appealText: textareaSchema.optional(),
});

// コラム・記事フォーム
export const articleFormSchema = z.object({
  title: z.string().min(1, "タイトルを入力してください").max(200),
  category: z.string().min(1, "カテゴリを選択してください"),
  content: z.string().min(1, "本文を入力してください"),
});

// ===== 加盟店画面フォーム =====

// プロフィール編集フォーム
export const partnerProfileSchema = z.object({
  companyName: nameSchema,
  representativeName: nameSchema,
  phone: phoneSchema,
  fax: phoneSchema.optional().or(z.literal("")),
  website: urlSchema,
  address: addressSchema,
  businessHours: z.string().max(100).optional(),
  holidays: z.string().max(100).optional(),
  businessContent: textareaSchema.optional(),
  appeal: textareaSchema.optional(),
  invoiceRegistrationNumber: invoiceNumberSchema,
  bankName: z.string().max(50).optional().or(z.literal("")),
  bankBranchName: z.string().max(50).optional().or(z.literal("")),
  bankAccountType: z.enum(["普通", "当座", ""]).optional(),
  bankAccountNumber: bankAccountNumberSchema,
  bankAccountHolder: z.string().max(50).optional().or(z.literal("")),
  newPassword: passwordSchema.optional().or(z.literal("")),
  confirmPassword: z.string().optional(),
}).refine(
  (data) => !data.newPassword || data.newPassword === data.confirmPassword,
  {
    message: "パスワードが一致しません",
    path: ["confirmPassword"],
  }
);

// 型のエクスポート
export type DiagnosisFormData = z.infer<typeof diagnosisFormSchema>;
export type ContactFormData = z.infer<typeof contactFormSchema>;
export type PartnerRegistrationData = z.infer<typeof partnerRegistrationSchema>;
export type AdminLoginData = z.infer<typeof adminLoginSchema>;
export type PartnerLoginData = z.infer<typeof partnerLoginSchema>;
export type PartnerFormData = z.infer<typeof partnerFormSchema>;
export type ArticleFormData = z.infer<typeof articleFormSchema>;
export type PartnerProfileData = z.infer<typeof partnerProfileSchema>;
