import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const appUrl = `https://based-india-giveaway.vercel.app`;

// frame preview metadata
const appName = "ReplyGuy";
const splashImageUrl = `${appUrl}/base_blue.svg`;
const iconUrl = `${appUrl}/base_blue.svg`;

const framePreviewMetadata = {
  version: "next",
  imageUrl: `${appUrl}/base_blue.svg`,
  iconUrl,
  heroImageUrl: `${appUrl}/base_blue.svg`,
  button: {
    title: "BATW India",
    action: {
      type: "launch_frame",
      name: appName,
      url: appUrl,
      splashImageUrl,
      iconUrl,
      splashBackgroundColor: "#0000ff",
    },
  },
};

export const metadata: Metadata = {
  title: "BATW India",
  description: "A onsite giveaway app for BATW India",
  icons: {
    icon: "/base_blue.svg",
  },
  other: {
    "fc:frame": JSON.stringify(framePreviewMetadata),
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
