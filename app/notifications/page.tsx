"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useUser } from "@clerk/nextjs";
import { ArrowLeft, Bell, Heart, UserPlus } from "lucide-react";
import Link from "next/link";
import Sidebar from "../components/Sidebar";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function NotificationsPage() {
  const { user } = useUser();
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;

    const fetchNotifications = async () => {
      const { data } = await supabase
        .from("notifications")
        .select(`
          *,
          actor:profiles!notifications_actor_id_fkey (
            username
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      
      if (data) setNotifications(data);
    };

    fetchNotifications();
  }, [user]);

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
                <div key={n.id} className="p-4 flex gap-4 items-start hover:bg-white/[0.02]">
                  {n.type === 'like' && <Heart className="text-pink-500 fill-pink-500" size={24} />}
                  {n.type === 'follow' && <UserPlus className="text-blue-500" size={24} />}
                  <div>
                    <span className="font-bold">@{n.actor?.username || "誰か"}</span>
                    <span className="text-gray-400">
                      {n.type === 'like' ? " さんがあなたのパルスにいいねしました" : " さんにフォローされました"}
                    </span>
                    <p className="text-xs text-gray-600 mt-1">
                      {new Date(n.created_at).toLocaleString('ja-JP')}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center p-20 text-center">
                <p className="text-gray-500 italic">通知はまだありません。</p>
              </div>
            )}
          </div>
        </main>
        <div className="hidden xl:block w-80 p-4"></div>
      </div>
    </div>
  );
}
