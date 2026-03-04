"use client";

import { useState, useEffect } from "react";
import { useUser, UserButton } from "@clerk/nextjs";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function MyPage() {
  const { user, isLoaded } = useUser();
  const [myPosts, setMyPosts] = useState<any[]>([]);
  const [username, setUsername] = useState("");

  const fetchMyData = async () => {
    if (!user) return;

    // 1. プロフィール情報を取得
    const { data: profile } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .single();
    
    if (profile) {
      setUsername(profile.username);

      // 2. そのユーザー名の投稿だけを取得
      const { data: posts } = await supabase
        .from("posts")
        .select("*")
        .eq("username", profile.username)
        .order("created_at", { ascending: false });
      
      if (posts) setMyPosts(posts);
    }
  };

  useEffect(() => {
    if (isLoaded && user) {
      fetchMyData();
    }
  }, [user, isLoaded]);

  if (!isLoaded) return <div className="bg-black min-h-screen text-white p-8">Loading...</div>;
  if (!user) return <div className="bg-black min-h-screen text-white p-8">ログインが必要です</div>;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* 上部ヘッダー */}
      <div className="flex items-center p-4 border-b border-zinc-800 sticky top-0 bg-black/80 backdrop-blur-md z-10">
        <Link href="/" className="mr-6 p-2 hover:bg-zinc-900 rounded-full transition-all text-xl">
          ←
        </Link>
        <div>
          <h1 className="text-xl font-bold">@{username || "user"}</h1>
          <p className="text-zinc-500 text-xs">{myPosts.length} 投稿</p>
        </div>
      </div>

      {/* プロフィールエリア */}
      <div className="relative">
        <div className="h-32 bg-zinc-800 w-full" /> {/* 背景カバー */}
        <div className="px-4">
          <div className="relative flex justify-between items-end -mt-12 mb-4">
            <div className="w-24 h-24 rounded-full border-4 border-black bg-zinc-900 overflow-hidden">
              <img src={user.imageUrl} alt="profile" className="w-full h-full object-cover" />
            </div>
            <button className="border border-zinc-700 font-bold px-4 py-1.5 rounded-full hover:bg-zinc-900 transition-all text-sm">
              編集 (近日公開)
            </button>
          </div>
          <h2 className="text-xl font-bold">@{username}</h2>
          <p className="text-zinc-500 text-sm mt-1">{user.primaryEmailAddress?.emailAddress}</p>
          <div className="flex gap-4 mt-3 text-sm">
            <span className="text-zinc-500"><strong className="text-white">0</strong> フォロー</span>
            <span className="text-zinc-500"><strong className="text-white">0</strong> フォロワー</span>
          </div>
        </div>
      </div>

      {/* 自分の投稿一覧 */}
      <div className="mt-6 border-t border-zinc-800 divide-y divide-zinc-800">
        {myPosts.length > 0 ? (
          myPosts.map((post) => (
            <div key={post.id} className="p-4 hover:bg-zinc-900/30 transition-colors">
              <p className="text-[15px] leading-relaxed">{post.content}</p>
              <span className="text-zinc-500 text-xs mt-2 block">· 投稿済み</span>
            </div>
          ))
        ) : (
          <div className="p-10 text-center text-zinc-500">まだ投稿がありません。</div>
        )}
      </div>
    </div>
  );
}
