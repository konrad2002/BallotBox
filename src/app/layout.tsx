import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BallotBox",
  description: "Create votes and run instant runoff voting on it.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-screen flex flex-col`}>
        <div className="flex-1">
          {children}
        </div>
        <footer className="border-t border-neutral-200 bg-neutral-50">
          <div className="max-w-5xl mx-auto px-4 py-6 text-sm text-neutral-600 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              © {new Date().getFullYear()} <a href="https://weiss-konrad.de" className="text-neutral-800 hover:text-neutral-900 underline">Konrad Weiß</a>
            </div>
            <div>
              <a
                href="https://github.com/sponsors/konrad2002"
                className="text-neutral-800 hover:text-neutral-900 underline"
                target="_blank"
                rel="noreferrer"
              >
                Support development
              </a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
