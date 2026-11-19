import type { Metadata } from "next";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tripmate — Đi cùng nhau, chia tiền rõ ràng",
  description: "Lên kế hoạch chuyến đi và theo dõi chi tiêu cùng nhóm bạn.",
  applicationName: "Tripmate",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Tripmate",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className="min-h-screen bg-slate-50/60 font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
