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
    <main className="max-w-2xl mx-auto border-x border-gray-800 min-h-screen bg-black text-white">
      {/* ヘッダー */}
      <div className="sticky top-0 bg-black/80 backdrop-blur-md border-b border-gray-800 p-4 flex justify-between items-center z-10">
        <h1 className="text-xl font-bold tracking-tight">pulse</h1>
        <UserButton afterSignOutUrl="/" />
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
                  <span className="font-medium">@{post.user_id.slice(0, 8)}</span>
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

      {/* 🏆 フッター：ここを正確にコピペしてね */}
      <footer className="py-12 px-4 border-t border-gray-800 bg-black text-gray-500">
        <div className="flex flex-col items-center gap-6">
          <div className="text-center">
            <h2 className="text-white font-bold text-xl mb-1 tracking-widest uppercase">pulse</h2>
            <p className="text-sm italic">Connecting the world, one heartbeat at a time.</p>
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
  );
}
