import { z } from "zod";

// ===== 共通バリデーションルール =====

// 電話番号（日本形式）
export const phoneSchema = z
  .string()
  .regex(
    /^(0\d{1,4}-?\d{1,4}-?\d{3,4}|0\d{9,10})$/,
    "正しい電話番号形式で入力してください（例: 090-1234-5678）"
  );

// メールアドレス
export const emailSchema = z
  .string()
  .email("正しいメールアドレス形式で入力してください");

// パスワード（8文字以上）
export const passwordSchema = z
  .string()
  .min(8, "パスワードは8文字以上で入力してください");

// 名前・会社名（1-50文字）
export const nameSchema = z
  .string()
  .min(1, "入力してください")
  .max(50, "50文字以内で入力してください");

// 住所（1-200文字）
export const addressSchema = z
  .string()
  .min(1, "入力してください")
  .max(200, "200文字以内で入力してください");

// テキストエリア（最大1000文字）
export const textareaSchema = z
  .string()
  .max(1000, "1000文字以内で入力してください");

// URL（http/https形式）
export const urlSchema = z
  .union([
    z.string().url("正しいURL形式で入力してください（http://またはhttps://で始まる）"),
    z.literal("")
  ])
  .optional();

// インボイス番号（T + 13桁）
export const invoiceNumberSchema = z
  .union([
    z.string().regex(/^T\d{13}$/, "インボイス番号はT + 13桁の数字で入力してください"),
    z.literal("")
  ])
  .optional();

// 銀行口座番号（1-10桁）
export const bankAccountNumberSchema = z
  .union([
    z.string().regex(/^\d{1,10}$/, "口座番号は1〜10桁の数字で入力してください"),
    z.literal("")
  ])
  .optional();
