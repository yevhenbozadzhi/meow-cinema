import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "./components/Navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MeowFilms",
  description: "MeowFilms is a platform for watching movies and TV shows",
  openGraph: {
    images: [
      {
        url: "/Logo.jpg",
        width: 512,
        height: 512,
        alt: "MeowFilms",
      },
    ],
  },
  twitter: {
    card: "summary",
    images: [{ url: "/Logo.jpg", width: 512, height: 512, alt: "MeowFilms" }],
  },
  keywords: ["MeowFilms", "Movies", "TV Shows", "Streaming"],
  authors: [{ name: "MeowFilms", url: "https://meowfilms.com" }],
  creator: "MeowFilms",
  publisher: "MeowFilms",
  robots: "index, follow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Navigation />
        {children}
      </body>
    </html>
  );
}
