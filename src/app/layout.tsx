import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ニッポン博士への道",
  description: "47都道府県をタイピングして日本の名産・歴史を学ぼう！",
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
