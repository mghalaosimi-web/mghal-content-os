import type { Metadata } from 'next';
import { Cairo } from 'next/font/google';
import './globals.css';

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-cairo',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'M.GH.AL Content Studio — نظام أتمتة المحتوى بالذكاء الاصطناعي',
  description:
    'نظام شخصي ذكي لأتمتة إنتاج المحتوى العربي وإدارته وجدولته ونشره على منصات التواصل الاجتماعي الرسمية.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className="dark">
      <body className={`${cairo.variable} min-h-screen bg-[#070b12] text-zinc-100 font-['Cairo',sans-serif] selection:bg-emerald-500/30 selection:text-emerald-200 antialiased`}>
        {children}
      </body>
    </html>
  );
}
