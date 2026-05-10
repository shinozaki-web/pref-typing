import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "都道府県タイピング | ニッポン博士への道",
  description: "47都道府県の名前をタイピングして日本地図を塗りつくそう！都道府県の場所・名産・歴史も楽しく学べる無料タイピングゲームです。",
  keywords: ["都道府県タイピング", "日本地図タイピング", "47都道府県", "タイピング練習", "タイピングゲーム", "無料"],
  openGraph: {
    title: "都道府県タイピング | ニッポン博士への道",
    description: "47都道府県の名前をタイピングして日本地図を塗りつくそう！無料で遊べるタイピングゲーム。",
    url: "https://pref-typing.onrender.com",
    siteName: "ニッポン博士への道",
    locale: "ja_JP",
    type: "website",
  },
  verification: {
    google: "qnAFDsFMEPB4l3oZNT6C4ECgeBpYHjkxwx-FZ8b88QA",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-sky-50">{children}</body>
    </html>
  );
}
