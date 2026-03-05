"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useUser } from "@clerk/nextjs";
import { Clock, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Sidebar from "../components/Sidebar"; // 👈 さっき切り出したサイドバー

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ProfilePage() {
  const { user, isLoaded } = useUser();
  const [myPosts, setMyPosts] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;

    const fetchMyPosts = async () => {
      // 💡 自分の user_id に一致する投稿だけを取得するよ！
      const { data } = await supabase
        .from("posts")
        .select("*")
        .eq("user_id", user.id) 
        .order("created_at", { ascending: false });
      
      if (data) setMyPosts(data);
    };

    fetchMyPosts();
  }, [user]);

  if (!isLoaded) return null;
  if (!user) return <div className="text-white text-center mt-20">ログインが必要です</div>;

  return (
    <div className="flex justify-center min-h-screen bg-black text-white">
      <div className="flex w-full max-w-[1300px] justify-start">
        
        {/* サイドバー（全ページ共通） */}
        <Sidebar />

        {/* メイン：プロフィールエリア */}
        <main className="flex-1 max-w-2xl border-r border-gray-800 bg-black min-h-screen">
          {/* ヘッダー：戻るボタン付き */}
          <div className="sticky top-0 bg-black/80 backdrop-blur-md border-b border-gray-800 p-4 flex items-center gap-6 z-10">
            <Link href="/" className="hover:bg-white/10 p-2 rounded-full transition">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-xl font-bold tracking-tight">{user.fullName || "ユーザー"}</h1>
              <p className="text-xs text-gray-500">{myPosts.length} パルス</p>
            </div>
          </div>

          {/* プロフィールヘッダー（カバー画像やアイコン） */}
          <div className="relative">
            <div className="h-32 bg-zinc-800 w-full" /> {/* カバー画像（仮） */}
            <div className="absolute -bottom-12 left-4">
              <img 
                src={user.imageUrl} 
                alt="Profile" 
                className="w-24 h-24 rounded-full border-4 border-black"
              />
            </div>
          </div>

          <div className="mt-16 px-4 pb-4 border-b border-gray-800">
            <h2 className="text-2xl font-black">{user.fullName}</h2>
            <p className="text-gray-500">@{user.username || user.id.slice(0, 8)}</p>
            <p className="mt-3 text-sm text-gray-300">PULSEへようこそ。ここに自己紹介が表示されます。</p>
          </div>

          {/* 自分の投稿一覧 */}
          <div className="divide-y divide-gray-800">
            {myPosts.length > 0 ? (
              myPosts.map((post) => (
                <article key={post.id} className="p-6 hover:bg-white/[0.02] transition-colors group">
                  <h2 className="text-xl font-bold text-white mb-2">{post.title}</h2>
                  <p className="text-gray-400 leading-relaxed mb-4">{post.content}</p>
                  {post.image_url && (
                    <div className="rounded-2xl border border-gray-800 overflow-hidden">
                      <img src={post.image_url} alt="Post" className="w-full h-auto" />
                    </div>
                  )}
                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-4">
                    <Clock size={12} />
                    <time>{new Date(post.created_at).toLocaleDateString('ja-JP')}</time>
                  </div>
                </article>
              ))
            ) : (
              <div className="p-20 text-center text-gray-600 italic">
                まだパルスを刻んでいません。
              </div>
            )}
          </div>
        </main>

        {/* 右側（今は空でOK） */}
        <div className="hidden xl:block w-80 p-4"></div>
      </div>
    </div>
  );
}
