import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Yamini Adari — AI Agents",
  description: "I build and publish AI agents. Learning in public.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-white text-[#1d1d1f]">
        <main className="flex-1 flex flex-col">{children}</main>
      </body>
    </html>
  );
}
