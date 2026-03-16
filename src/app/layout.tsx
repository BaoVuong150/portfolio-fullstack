import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Portfolio — International Style",
  description: "Personal portfolio — projects, skills, and contact. Designed in the Swiss International Typographic Style.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} font-sans bg-white text-black antialiased`}
      >
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              borderRadius: '0px',
              border: '2px solid #000000',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              textTransform: 'uppercase' as const,
              letterSpacing: '0.05em',
              fontSize: '12px',
            },
          }}
        />
        {children}
      </body>
    </html>
  );
}
