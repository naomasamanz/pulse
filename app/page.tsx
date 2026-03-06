"use client";

import { useEffect, useState, useCallback, useRef } from "react"; // useRef追加
import { createClient } from "@supabase/supabase-js";
import { useUser, UserButton, useClerk } from "@clerk/nextjs"; // useClerk追加
import { Clock, Heart, Loader2, Share2, MessageCircle, MoreHorizontal, ShieldCheck, Zap } from "lucide-react"; 
import Sidebar from "./components/Sidebar";
import PostForm from "./components/PostForm";
import LandingPage from "./components/LandingPage";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Home() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk(); // 万が一のログアウト用
  const hasRefreshed = useRef(false); // 💡 無限リロード防止
  
  const [posts, setPosts] = useState<any[]>([]);
  const [myLikes, setMyLikes] = useState<number[]>([]);
  const [isInitializing, setIsInitializing] = useState(true);

  // 1. 投稿取得 (安定化版)
  const fetchPosts = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("posts")
        .select(`*, profiles!left (username)`)
        .order("created_at", { ascending: false });
      if (data) setPosts(data);
      if (error) throw error;
    } catch (e) {
      console.error("Fetch Posts Error:", e);
    }
  }, []);

  // 2. いいね取得
  const fetchMyLikes = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("notifications")
      .select("post_id")
      .eq("actor_id", user.id)
      .eq("type", "like");
    if (data) setMyLikes(data.map((l: any) => l.post_id));
  }, [user]);

  // 💡 運命の同期ロジック
  useEffect(() => {
    const sync = async () => {
      if (!isLoaded) return;

      if (user) {
        // ログイン成功時
        await Promise.all([fetchPosts(), fetchMyLikes()]);
        setTimeout(() => setIsInitializing(false), 800);
      } else {
        // 💡 ここが「戻される」対策の核心！
        // ログインしていないと判定された時、一度だけ「本当に？」とリロードを試みる
        if (!hasRefreshed.current) {
          hasRefreshed.current = true;
          // 3秒待っても user が来ない時だけ LandingPage を覚悟する
          setTimeout(() => {
            if (!user) setIsInitializing(false);
          }, 3000);
        }
      }
    };
    sync();
  }, [isLoaded, user, fetchPosts, fetchMyLikes]);

  // ❤️ いいね処理 (エラーハンドリング強化版)
  const handleLike = async (post: any) => {
    if (!user) return;
    const isLiked = myLikes.includes(post.id);
    setMyLikes(prev => isLiked ? prev.filter(id => id !== post.id) : [...prev, post.id]);

    try {
      const { data: existing } = await supabase
        .from("notifications")
        .select("id")
        .eq("actor_id", user.id)
        .eq("post_id", post.id)
        .eq("type", "like")
        .maybeSingle();

      if (existing) {
        await supabase.from("notifications").delete().eq("id", existing.id);
      } else {
        await supabase.from("notifications").insert({
          user_id: post.user_id,
          actor_id: user.id,
          type: "like",
          post_id: post.id,
        });
      }
    } catch (err) {
      fetchMyLikes(); // 失敗したら戻す
    }
  };

  // 💡 ロード画面 (よりリッチに)
  if (!isLoaded || isInitializing) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center space-y-8">
        <div className="relative">
          <Loader2 className="h-20 w-20 text-blue-600 animate-spin" />
          <Zap className="h-8 w-8 text-blue-400 absolute inset-0 m-auto animate-pulse" />
        </div>
        <div className="text-center">
          <h2 className="text-blue-500 font-black text-3xl tracking-tighter animate-bounce">PULSE</h2>
          <p className="text-zinc-600 text-xs font-mono mt-2 tracking-[0.3em]">ESTABLISHING SECURE CONNECTION...</p>
        </div>
      </div>
    );
  }

  // 💡 最終的にいなければ LandingPage
  if (!user) {
    return <LandingPage />;
  }

  return (
    <div className="flex justify-center min-h-screen bg-black text-zinc-100 selection:bg-blue-500/40">
      <div className="flex w-full max-w-[1300px]">
        <Sidebar />
        
        <main className="flex-1 max-w-2xl border-x border-zinc-900 bg-black min-h-screen pb-20">
          <header className="sticky top-0 bg-black/70 backdrop-blur-xl border-b border-zinc-900 p-5 flex justify-between items-center z-40">
            <div className="flex items-center gap-2">
              <ShieldCheck className="text-blue-500" size={20} />
              <span className="text-xl font-black tracking-tighter">FEED</span>
            </div>
            <UserButton fallbackRedirectUrl="/" />
          </header>

          <PostForm onPostSuccess={fetchPosts} />

          <div className="divide-y divide-zinc-900">
            {posts.length > 0 ? (
              posts.map((post) => {
                const isLiked = myLikes.includes(post.id);
                return (
                  <article key={post.id} className="p-6 hover:bg-zinc-900/30 transition-all duration-300 group">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-zinc-700 to-zinc-900 rounded-2xl flex items-center justify-center text-blue-500 font-black">
                          {post.profiles?.username?.[0]?.toUpperCase() || "P"}
                        </div>
                        <div>
                          <p className="font-bold text-blue-400">@{post.profiles?.username || "anonymous"}</p>
                          <p className="text-[10px] text-zinc-600 font-mono">ID: {post.user_id?.slice(0, 12)}</p>
                        </div>
                      </div>
                      <MoreHorizontal className="text-zinc-700 hover:text-white cursor-pointer" size={18} />
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-2xl font-black text-zinc-100 group-hover:text-blue-500 transition-colors leading-none">
                        {post.title}
                      </h3>
                      <p className="text-zinc-400 text-lg leading-relaxed whitespace-pre-wrap">
                        {post.content}
                      </p>
                      {post.image_url && (
                        <div className="rounded-3xl overflow-hidden border border-zinc-800 bg-zinc-900/50">
                          <img 
                            src={post.image_url} 
                            className="w-full object-cover max-h-[500px] hover:scale-105 transition-transform duration-700" 
                            alt="Pulse visual"
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-8 mt-8 text-zinc-600">
                      <button className="flex items-center gap-2 hover:text-blue-500 transition-colors">
                        <MessageCircle size={20} />
                        <span className="text-xs font-bold">0</span>
                      </button>
                      <button 
                        onClick={() => handleLike(post)}
                        className={`flex items-center gap-2 transition-all ${isLiked ? 'text-pink-500 scale-110' : 'hover:text-pink-500'}`}
                      >
                        <Heart size={20} fill={isLiked ? "currentColor" : "none"} />
                        <span className="text-xs font-bold">{isLiked ? '1' : '0'}</span>
                      </button>
                      <button className="flex items-center gap-2 hover:text-green-500 transition-colors">
                        <Share2 size={20} />
                      </button>
                    </div>
                  </article>
                );
              })
            ) : (
              <div className="py-40 text-center space-y-4">
                <div className="inline-block p-4 rounded-full bg-zinc-900/50 animate-pulse">
                  <Zap className="text-zinc-700" size={32} />
                </div>
                <p className="text-zinc-600 font-bold uppercase tracking-[0.2em]">No pulses detected in this sector.</p>
              </div>
            )}
          </div>
        </main>

        <aside className="hidden xl:block w-80 p-8 space-y-8">
          <div className="p-6 rounded-[2rem] bg-zinc-900/30 border border-zinc-800/50 backdrop-blur-md">
            <h4 className="font-black text-blue-500 text-sm mb-6 tracking-widest uppercase">System Status</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-zinc-500">DATABASE</span>
                <span className="text-green-500 font-bold">ONLINE</span>
              </div>
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-zinc-500">AUTH CLUSTER</span>
                <span className="text-green-500 font-bold">SYNCHRONIZED</span>
              </div>
              <div className="pt-4 border-t border-zinc-800">
                <p className="text-[9px] text-zinc-600 leading-relaxed">
                  Encryption active. Your pulse is private and secure.
                </p>
              </div>
            </div>
          </div>
          <div className="text-center">
             <p className="text-[10px] text-zinc-800 font-black tracking-widest">PULSE PROTOCOL V1.0.9</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
