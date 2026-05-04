import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "都道府県タイピング",
  description: "日本地図を塗りつくせ！47都道府県タイピングゲーム",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-sky-50">{children}</body>
    </html>
  );
}
