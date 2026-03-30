import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MnemoAI — Remember Everything with AI Mnemonics",
  description:
    "AI-powered mnemonic generator. Learn vocabulary, formulas, history, and more in English, Vietnamese, Chinese, and 10+ languages. Remember anything, forever.",
  keywords: ["mnemonic", "memory", "learning", "AI", "study", "flashcard"],
  openGraph: {
    title: "MnemoAI — Remember Everything with AI",
    description: "AI-powered mnemonics for effortless learning in any language",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased min-h-screen bg-gray-950">{children}</body>
    </html>
  );
}
