"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import PostForm from "./components/PostForm";
import { useUser, UserButton } from "@clerk/nextjs";
import LandingPage from "./components/LandingPage";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Home() {
  const { user, isLoaded } = useUser();
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      const { data } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false });
      if (data) setPosts(data);
    };
    fetchPosts();
  }, []);

  const handleNewPost = (newPost: any) => {
    setPosts([newPost, ...posts]);
  };

  if (!isLoaded) return null;
  if (!user) return <LandingPage />;

  return (
    <div className="flex justify-center min-h-screen bg-black text-white">
      {/* 🟢 左側：サイドバー（PCサイズで表示） */}
      <aside className="w-64 hidden md:flex flex-col sticky top-0 h-screen p-4 border-r border-gray-800">
        <div className="mb-8 px-4 text-3xl font-black tracking-tighter italic text-blue-500">
          <a href="/">PULSE</a>
        </div>
        
        <nav className="flex-1 flex flex-col gap-2">
          <SidebarItem icon="🏠" label="ホーム" active />
          <SidebarItem icon="🔍" label="見つける" />
          <SidebarItem icon="🔔" label="通知" />
          <SidebarItem icon="✉️" label="メッセージ" />
          <SidebarItem icon="👤" label="プロフィール" />
        </nav>

        {/* サイドバー下のユーザー設定エリア */}
        <div className="mt-auto mb-4 p-3 flex items-center gap-3 hover:bg-white/10 rounded-full transition cursor-pointer">
          <UserButton />
          <span className="font-bold text-sm hidden lg:inline">アカウント</span>
        </div>
      </aside>

      {/* ⚪️ 中央：メインコンテンツ */}
      <main className="w-full max-w-2xl border-r border-gray-800 bg-black min-h-screen">
        {/* ヘッダー */}
        <div className="sticky top-0 bg-black/80 backdrop-blur-md border-b border-gray-800 p-4 flex justify-between items-center z-10">
          <h1 className="text-xl font-bold tracking-tight">ホーム</h1>
          {/* スマホの時だけ右上にユーザーボタンを出す（サイドバーが隠れるため） */}
          <div className="md:hidden">
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
        
        {/* 投稿フォーム */}
        <PostForm onPostSuccess={handleNewPost} />

        {/* 投稿一覧 */}
        <div className="divide-y divide-gray-800">
          {posts.length > 0 ? (
            posts.map((post) => (
              <article key={post.id} className="p-6 hover:bg-white/[0.02] transition-colors">
                <div className="mb-3">
                  <h2 className="text-2xl font-extrabold text-white mb-2 break-words">
                    {post.title || "無題の投稿"}
                  </h2>
                  <p className="text-gray-300 text-lg leading-relaxed break-words whitespace-pre-wrap">
                    {post.content}
                  </p>
                </div>
                
                <div className="flex items-center justify-between text-xs text-gray-500 mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full" />
                    <span className="font-medium text-blue-400">@{post.user_id.slice(0, 8)}</span>
                  </div>
                  <time>{new Date(post.created_at).toLocaleString('ja-JP', { 
                    month: 'short', 
                    day: 'numeric', 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}</time>
                </div>
              </article>
            ))
          ) : (
            <div className="p-20 text-center text-gray-600 italic">
              まだ投稿がありません。最初の pulse を刻もう。
            </div>
          )}
        </div>

        {/* 🏆 フッター */}
        <footer className="py-12 px-4 border-t border-gray-800 bg-black text-gray-500">
          <div className="flex flex-col items-center gap-6">
            <div className="text-center">
              <h2 className="text-white font-bold text-xl mb-1 tracking-widest uppercase">pulse</h2>
              <p className="text-sm italic text-gray-600">Connecting the world, one heartbeat at a time.</p>
            </div>

            <nav className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-xs font-medium uppercase tracking-tighter">
              <a href="#" className="hover:text-white transition">About</a>
              <a href="#" className="hover:text-white transition">Terms</a>
              <a href="#" className="hover:text-white transition">Privacy</a>
              <a href="#" className="hover:text-white transition">Contact</a>
            </nav>

            <div className="flex flex-col items-center gap-2 border-t border-gray-900 pt-6 w-full max-w-xs">
              <p className="text-[10px] tracking-[0.2em]">
                © 2026 PULSE INC. ALL RIGHTS RESERVED.
              </p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

// 共通のサイドバー項目コンポーネント
function SidebarItem({ icon, label, active = false }: { icon: string, label: string, active?: boolean }) {
  return (
    <div className={`flex items-center gap-4 px-4 py-3 rounded-full text-xl cursor-pointer transition-all hover:bg-white/10 active:scale-95 ${active ? "font-bold text-white" : "text-gray-400"}`}>
      <span className="text-2xl">{icon}</span>
      <span className="hidden lg:inline">{label}</span>
    </div>
  );
}
