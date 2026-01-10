import ContactPageContent from "../components/ContactPageContent";

export const metadata = {
  title: "お問い合わせ - 外壁塗装パートナーズ",
  description: "外壁塗装に関するご質問やご相談はお気軽にお問い合わせください。電話、メール、フォームでのお問い合わせに対応しています。",
};

export const dynamic = 'force-dynamic';

export default function ContactPage() {
  return <ContactPageContent />;
}