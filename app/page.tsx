"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import PostForm from "./components/PostForm";
import { useUser, UserButton } from "@clerk/nextjs";
import LandingPage from "./components/LandingPage";
// Lucideアイコンをインポート
import { Home as HomeIcon, Search, Bell, Mail, User, Clock } from "lucide-react";

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
    // 🌍 全体の背景（黒）と、要素を左から並べる設定
    <div className="flex justify-center min-h-screen bg-black text-white">
      <div className="flex w-full max-w-[1300px] justify-start">
        
        {/* 🟢 サイドバー：左端に固定 */}
        <aside className="w-20 lg:w-64 hidden md:flex flex-col sticky top-0 h-screen p-2 lg:p-4 border-r border-gray-800 items-center lg:items-start">
          <div className="mb-8 px-4 text-3xl font-black tracking-tighter italic text-blue-500 hidden lg:block">
            PULSE
          </div>
          <div className="mb-8 text-3xl font-black text-blue-500 lg:hidden block">
            P
          </div>
          
          <nav className="flex-1 flex flex-col gap-2 w-full">
            <SidebarItem icon={<HomeIcon size={28} />} label="ホーム" active />
            <SidebarItem icon={<Search size={28} />} label="見つける" />
            <SidebarItem icon={<Bell size={28} />} label="通知" />
            <SidebarItem icon={<Mail size={28} />} label="メッセージ" />
            <SidebarItem icon={<User size={28} />} label="プロフィール" />
          </nav>

          <div className="mt-auto mb-4 p-3 flex items-center gap-3 hover:bg-white/10 rounded-full transition cursor-pointer w-fit lg:w-full text-gray-400 hover:text-white">
            <UserButton />
            <span className="font-bold text-sm hidden lg:inline ml-1">アカウント</span>
          </div>
        </aside>

        {/* ⚪️ メイン：中央の投稿エリア */}
        <main className="flex-1 max-w-2xl border-r border-gray-800 bg-black min-h-screen">
          <div className="sticky top-0 bg-black/80 backdrop-blur-md border-b border-gray-800 p-4 flex justify-between items-center z-10">
            <h1 className="text-xl font-bold tracking-tight">ホーム</h1>
            <div className="md:hidden">
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
          
          <PostForm onPostSuccess={handleNewPost} />

          <div className="divide-y divide-gray-800">
            {posts.length > 0 ? (
              posts.map((post) => (
                <article key={post.id} className="p-6 hover:bg-white/[0.02] transition-colors group">
                  <div className="mb-3">
                    <h2 className="text-2xl font-extrabold text-white mb-2 break-words">
                      {post.title || "無題の投稿"}
                    </h2>
                    <p className="text-gray-400 text-lg leading-relaxed break-words whitespace-pre-wrap mb-4">
                      {post.content}
                    </p>

                    {/* 🌟 投稿に画像があれば表示するエリア */}
                    {post.image_url && (
                      <div className="mt-4 overflow-hidden rounded-2xl border border-gray-800">
                        <img 
                          src={post.image_url} 
                          alt="Post content" 
                          className="w-full h-auto max-h-[512px] object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 mt-4">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full shadow-sm shadow-blue-500/20" />
                      <span className="font-medium text-blue-400/80">@{post.user_id.slice(0, 8)}</span>
                    </div>
                    <div className="flex items-center gap-1 opacity-60">
                      <Clock size={12} />
                      <time>{new Date(post.created_at).toLocaleDateString('ja-JP', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}</time>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="p-20 text-center text-gray-600 italic">
                まだ投稿がありません。最初の pulse を刻もう。
              </div>
            )}
          </div>

          <footer className="py-12 px-4 border-t border-gray-800 text-gray-500 text-center">
            <h2 className="text-white font-bold text-xl mb-1 tracking-widest uppercase">pulse</h2>
            <p className="text-[10px] tracking-[0.2em] mt-4 uppercase">
              © 2026 PULSE INC. ALL RIGHTS RESERVED.
            </p>
          </footer>
        </main>

        {/* 🔵 右側の余白エリア */}
        <div className="hidden xl:block w-80 p-4">
          <div className="bg-gray-900/50 rounded-2xl p-4 border border-gray-800">
            <h3 className="text-lg font-bold mb-4">いまどうしてる？</h3>
            <p className="text-sm text-gray-500 italic">Coming Soon...</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SidebarItem({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <div className={`flex items-center gap-4 px-4 py-3 rounded-full cursor-pointer transition-all hover:bg-white/10 active:scale-95 w-fit lg:w-full ${active ? "font-bold text-white bg-white/5" : "text-gray-400"}`}>
      {icon}
      <span className="text-xl hidden lg:inline">{label}</span>
    </div>
  );
}
