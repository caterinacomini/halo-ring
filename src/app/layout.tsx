import type { Metadata } from "next";
import localFont from "next/font/local";
import { DM_Sans } from "next/font/google";
import "@/styles/globals.scss";

const recklessNeue = localFont({
  src: [
    {
      path: "../../public/fonts/RecklessNeue-Light.otf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../public/fonts/RecklessNeue-LightItalic.otf",
      weight: "300",
      style: "italic",
    },
    {
      path: "../../public/fonts/RecklessNeue-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/RecklessNeue-RegularItalic.otf",
      weight: "400",
      style: "italic",
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
    <html lang="en" className={`${recklessNeue.variable} ${dmSans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
