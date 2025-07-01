import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { PaintBucket, Palette, TestTube2 } from "lucide-react"; // Icons

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Chaos Ink Mixer",
  description: "Ink mixing and recipe management",
};

// --- NEW NAVIGATION SIDEBAR ---
function Sidebar() {
  return (
    <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b">
        <h1 className="text-xl font-bold">Chaos Ink</h1>
      </div>
      <nav className="flex-grow p-4 space-y-2">
        <Link href="/inks" className="flex items-center gap-3 p-2 rounded-md text-gray-700 hover:bg-gray-200">
          <Palette size={20} />
          <span>Ink Inventory</span>
        </Link>
        <Link href="/recipes" className="flex items-center gap-3 p-2 rounded-md text-gray-700 hover:bg-gray-200">
          <PaintBucket size={20} />
          <span>Recipe Book</span>
        </Link>
        <Link href="/mixes" className="flex items-center gap-3 p-2 rounded-md text-gray-700 hover:bg-gray-200">
          <TestTube2 size={20} />
          <span>New Mix</span>
        </Link>
      </nav>
    </div>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex h-screen bg-gray-100">
          <Sidebar />
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
        <Toaster richColors />
      </body>
    </html>
  );
}