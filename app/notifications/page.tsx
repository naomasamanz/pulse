"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import Sidebar from "../components/Sidebar";

export default function NotificationsPage() {
  return (
    <div className="flex justify-center min-h-screen bg-black text-white">
      <div className="flex w-full max-w-[1300px] justify-start">
        
        {/* サイドバー */}
        <Sidebar />

        {/* メインエリア */}
        <main className="flex-1 max-w-2xl border-r border-gray-800 bg-black min-h-screen">
          <div className="sticky top-0 bg-black/80 backdrop-blur-md border-b border-gray-800 p-4 flex items-center gap-6 z-10">
            <Link href="/" className="hover:bg-white/10 p-2 rounded-full transition">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-xl font-bold tracking-tight">通知</h1>
          </div>

          <div className="flex flex-col items-center justify-center p-20 text-center">
            <p className="text-gray-500 italic text-lg">
              通知はまだありません。
            </p>
            <p className="text-sm text-gray-600 mt-2">
              誰かがあなたをフォローしたり、パルスに反応するとここに表示されるよ！
            </p>
          </div>
        </main>

        <div className="hidden xl:block w-80 p-4"></div>
      </div>
    </div>
  );
}
