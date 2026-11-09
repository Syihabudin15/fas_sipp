import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { App, ConfigProvider } from "antd";
import { UserProvider } from "@/components/UserContext";
import "@/app/globals.css";
import locale from "antd/locale/id_ID";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: `${process.env.NEXT_PUBLIC_APP_SHORTNAME || "LOSS SISTEM"}`,
  description:
    "Sistem informasi Pembiayaab Pensiun By Koperasi Jasa Fadillah Aqila Sejahtra (KOPJAS FAS)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ConfigProvider
          theme={{
            token: {
              fontFamily: "var(--font-geist-mono)",
              borderRadius: 8,
              fontSize: 13,
              colorPrimary: "#2563eb",
              colorInfo: "#2563eb",
            },
            components: {
              Table: {
                cellPaddingBlock: 8,
                cellPaddingInline: 10,
                cellPaddingBlockSM: 5,
                cellPaddingInlineSM: 7,
              },
            },
          }}
          locale={locale}
        >
          <App>
            <UserProvider>{children}</UserProvider>
          </App>
        </ConfigProvider>
      </body>
    </html>
  );
}
