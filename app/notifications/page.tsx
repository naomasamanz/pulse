"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useUser } from "@clerk/nextjs";
import { ArrowLeft, Heart, UserPlus, Clock } from "lucide-react";
import Link from "next/link";
import Sidebar from "../components/Sidebar";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function NotificationsPage() {
  const { user, isLoaded } = useUser();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    // 💡 user.id が確定するまで待つ
    if (!user?.id) return;

    // 💡 SQLで設定した名前「actor:profiles」を使ってデータを結合するよ
    const { data, error } = await supabase
      .from("notifications")
      .select(`
        *,
        actor:profiles (
          username
        )
      `)
      .eq("user_id", user.id) // 自分宛の通知だけを取得
      .order("created_at", { ascending: false });
    
    if (error) {
      console.error("通知の取得エラー:", error);
      // 万が一結合でエラーが出た時のためのセーフティ（名前なしでも中身だけは出す）
      const { data: fallbackData } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (fallbackData) setNotifications(fallbackData);
    } else if (data) {
      setNotifications(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isLoaded && user) {
      fetchNotifications();
    }
  }, [isLoaded, user]);

  if (!isLoaded) return null;

  return (
    <div className="flex justify-center min-h-screen bg-black text-white">
      <div className="flex w-full max-w-[1300px] justify-start">
        
        <Sidebar />

        <main className="flex-1 max-w-2xl border-r border-gray-800 bg-black min-h-screen">
          <div className="sticky top-0 bg-black/80 backdrop-blur-md border-b border-gray-800 p-4 flex items-center gap-6 z-10">
            <Link href="/" className="hover:bg-white/10 p-2 rounded-full transition">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-xl font-bold tracking-tight">通知</h1>
          </div>

          <div className="divide-y divide-gray-800">
            {notifications.length > 0 ? (
              notifications.map((n) => (
                <div key={n.id} className="p-4 flex gap-4 items-start hover:bg-white/[0.02] transition-colors">
                  <div className="mt-1">
                    {n.type === 'like' ? (
                      <Heart className="text-pink-500 fill-pink-500" size={24} />
                    ) : (
                      <UserPlus className="text-blue-500" size={24} />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-white">
                        @{n.actor?.username || n.actor_id?.slice(0, 8) || "誰か"}
                      </span>
                      <span className="text-gray-400">
                        {n.type === 'like' ? "さんがあなたのパルスにいいねしました" : "さんにフォローされました"}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-1 text-xs text-gray-600 mt-2">
                      <Clock size={12} />
                      <time>
                        {new Date(n.created_at).toLocaleString('ja-JP', {
                          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </time>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center p-20 text-center">
                {loading ? (
                  <p className="text-gray-500 animate-pulse">パルスを受信中...</p>
                ) : (
                  <div className="space-y-2">
                    <p className="text-gray-500 italic text-lg">まだ静かですね...</p>
                    <p className="text-sm text-gray-600">
                      パルスを刻んで、世界からの反応を待とう！
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>

        <div className="hidden xl:block w-80 p-4"></div>
      </div>
    </div>
  );
}
