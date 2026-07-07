import type { Metadata } from "next";
import localFont from "next/font/local";
import { DM_Sans } from "next/font/google";
import "@/styles/globals.scss";

const editorialNew = localFont({
  src: [
    {
      path: "./fonts/EditorialNew-Ultralight.otf",
      weight: "200",
      style: "normal",
    },
    {
      path: "./fonts/EditorialNew-Light.otf",
      weight: "300",
      style: "normal",
    },
    {
      path: "./fonts/EditorialNew-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/EditorialNew-Medium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/EditorialNew-Bold.otf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-serif",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Halo Ring",
  description: "Halo Ring",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${editorialNew.variable} ${dmSans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
