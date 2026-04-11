import { Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { FiltersProvider } from "@/providers/FiltersProvider";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import type { Metadata } from "next";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  manifest: "/manifest.json",
  title: "Study Buddy",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${plusJakartaSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}>
        <ThemeProvider>
          <NextIntlClientProvider messages={messages}>
            <FiltersProvider>
              {children}
            </FiltersProvider>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
