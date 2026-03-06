"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
import { useUser, UserButton } from "@clerk/nextjs";
import { Clock, Heart, Loader2, Share2, MessageCircle, MoreHorizontal } from "lucide-react"; 
import Sidebar from "./components/Sidebar";
import PostForm from "./components/PostForm";
import LandingPage from "./components/LandingPage";

// Supabaseクライアントの初期化
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Home() {
  // Clerkからユーザー情報とロード状態を取得
  const { user, isLoaded } = useUser();
  
  // 状態管理
  const [posts, setPosts] = useState<any[]>([]);
  const [myLikes, setMyLikes] = useState<number[]>([]);
  const [isInitializing, setIsInitializing] = useState(true); // 💡 ログイン判定の「隙間」を埋めるフラグ

  // 1. 投稿一覧を取得する関数（メモ化して安定させる）
  const fetchPosts = useCallback(async () => {
    const { data, error } = await supabase
      .from("posts")
      .select(`
        *,
        profiles!left (
          username
        )
      `)
      .order("created_at", { ascending: false });
    
    if (error) {
      console.error("投稿取得エラー:", error);
    } else if (data) {
      setPosts(data);
    }
  }, []);

  // 2. 自分の「いいね」状態を取得する関数
  const fetchMyLikes = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("notifications")
      .select("post_id")
      .eq("actor_id", user.id)
      .eq("type", "like");
    
    if (error) {
      console.error("いいね取得エラー:", error);
    } else if (data) {
      setMyLikes(data.map((l: any) => l.post_id));
    }
  }, [user]);

  // 💡 ログイン状態の同期を確実にするEffect
  useEffect(() => {
    const syncUser = async () => {
      if (isLoaded) {
        if (user) {
          // ログイン済みならデータを並列で取得
          await Promise.all([fetchPosts(), fetchMyLikes()]);
        }
        // 取得が終わっても、一瞬だけローディングを残して画面遷移のチラつきを抑える
        setTimeout(() => {
          setIsInitializing(false);
        }, 500);
      }
    };
    syncUser();
  }, [isLoaded, user, fetchPosts, fetchMyLikes]);

  // 新規投稿成功時のハンドラ
  const handleNewPost = () => {
    fetchPosts();
  };

  // ❤️ いいねトグル処理
  const handleLike = async (post: any) => {
    if (!user) return;

    const isLiked = myLikes.includes(post.id);
    
    // 楽観的更新（UIを先に変える）
    if (isLiked) {
      setMyLikes(myLikes.filter(id => id !== post.id));
    } else {
      setMyLikes([...myLikes, post.id]);
    }

    try {
      const { data: existingLike } = await supabase
        .from("notifications")
        .select("id")
        .eq("user_id", post.user_id)
        .eq("actor_id", user.id)
        .eq("post_id", post.id)
        .eq("type", "like")
        .maybeSingle();

      if (existingLike) {
        await supabase.from("notifications").delete().eq("id", existingLike.id);
      } else {
        await supabase.from("notifications").insert({
          user_id: post.user_id,
          actor_id: user.id,
          type: "like",
          post_id: post.id,
        });
      }
    } catch (err) {
      console.error("Like processing error:", err);
      // エラー時は再取得して状態を戻す
      fetchMyLikes();
    }
  };

  // 💡 判定中：Clerkのロード中、または初期化中（データ取得中）
  if (!isLoaded || isInitializing) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-6">
        <div className="relative h-16 w-16">
          <Loader2 className="h-16 w-16 text-blue-500 animate-spin absolute" />
          <div className="h-16 w-16 border-4 border-blue-500/20 rounded-full"></div>
        </div>
        <div className="text-center space-y-2">
          <p className="text-blue-500 font-black text-2xl tracking-[0.2em] animate-pulse">PULSE CONNECTING</p>
          <p className="text-gray-500 text-xs uppercase tracking-widest">Synchronizing your experience...</p>
        </div>
      </div>
    );
  }

  // 💡 未ログイン確定時
  if (!user) {
    return <LandingPage />;
  }

  return (
    <div className="flex justify-center min-h-screen bg-black text-white font-sans selection:bg-blue-500/30">
      <div className="flex w-full max-w-[1300px] justify-start">
        
        {/* 左側サイドバーセクション */}
        <Sidebar />

        {/* 中央メインコンテンツエリア */}
        <main className="flex-1 max-w-2xl border-r border-gray-800 bg-black min-h-screen relative">
          
          {/* 固定ヘッダー */}
          <header className="sticky top-0 bg-black/60 backdrop-blur-xl border-b border-gray-800 p-4 flex justify-between items-center z-30">
            <div>
              <h1 className="text-xl font-black tracking-tight text-white/90">ホーム</h1>
              <div className="h-1 w-8 bg-blue-500 rounded-full mt-1"></div>
            </div>
            <div className="md:hidden flex items-center gap-4">
              <UserButton 
                afterSignOutUrl="/" 
                appearance={{
                  elements: {
                    userButtonAvatarBox: "w-8 h-8 border border-gray-700"
                  }
                }}
              />
            </div>
          </header>
          
          {/* 投稿フォームコンポーネント */}
          <section className="border-b border-gray-800">
            <PostForm onPostSuccess={handleNewPost} />
          </section>

          {/* タイムラインフィード */}
          <div className="divide-y divide-gray-800">
            {posts.length > 0 ? (
              posts.map((post) => {
                const isLiked = myLikes.includes(post.id);
                return (
                  <article key={post.id} className="p-6 hover:bg-white/[0.015] transition-all duration-300 group relative">
                    <div className="absolute right-4 top-6 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="text-gray-600 hover:text-blue-400">
                        <MoreHorizontal size={20} />
                      </button>
                    </div>

                    <div className="mb-4">
                      <h2 className="text-2xl font-black text-white/95 mb-2 break-words leading-tight group-hover:text-blue-400 transition-colors">
                        {post.title || "無題のパルス"}
                      </h2>
                      <p className="text-gray-400 text-lg leading-relaxed break-words whitespace-pre-wrap">
                        {post.content}
                      </p>
                      
                      {/* 画像コンテンツのレンダリング */}
                      {post.image_url && (
                        <div className="mt-4 overflow-hidden rounded-2xl border border-gray-800/50 bg-zinc-900">
                          <img 
                            src={post.image_url} 
                            alt="Post visual" 
                            className="w-full h-auto max-h-[600px] object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                            loading="lazy"
                          />
                        </div>
                      )}
                    </div>
                    
                    {/* 投稿アクションとメタデータ */}
                    <div className="flex items-center justify-between mt-6">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg transform rotate-3 group-hover:rotate-12 transition-transform" />
                        <span className="font-bold text-sm text-blue-400/90 tracking-tight">
                          @{post.profiles?.username || post.user_id?.slice(0, 8)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 sm:gap-6">
                        {/* メッセージボタン (ダミー) */}
                        <button className="flex items-center gap-2 text-gray-500 hover:text-blue-400 transition-colors group/btn">
                          <div className="p-2 rounded-full group-hover/btn:bg-blue-400/10">
                            <MessageCircle size={19} />
                          </div>
                        </button>

                        {/* ❤️ いいねトグルボタン */}
                        <button 
                          onClick={() => handleLike(post)}
                          className={`flex items-center gap-1 group/like transition-all ${isLiked ? 'text-pink-500' : 'text-gray-500 hover:text-pink-500'}`}
                        >
                          <div className={`p-2 rounded-full transition-colors ${isLiked ? 'bg-pink-500/10' : 'group-hover/like:bg-pink-500/10'}`}>
                            <Heart 
                              size={19} 
                              fill={isLiked ? "currentColor" : "none"} 
                              className={isLiked ? "animate-bounce" : ""}
                            />
                          </div>
                          {isLiked && <span className="text-[10px] font-bold">LIKED</span>}
                        </button>

                        {/* シェアボタン (ダミー) */}
                        <button className="flex items-center gap-2 text-gray-500 hover:text-green-400 transition-colors group/btn">
                          <div className="p-2 rounded-full group-hover/btn:bg-green-400/10">
                            <Share2 size={19} />
                          </div>
                        </button>

                        <div className="hidden sm:flex items-center gap-1 text-[10px] text-gray-600 font-mono">
                          <Clock size={12} />
                          <time>{new Date(post.created_at).toLocaleDateString('ja-JP')}</time>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })
            ) : (
              <div className="p-24 text-center flex flex-col items-center justify-center space-y-4">
                <div className="h-12 w-12 border-2 border-dashed border-gray-700 rounded-full animate-spin-slow" />
                <p className="text-gray-600 italic font-medium">
                  パルスが見つかりません。最初の信号を発信しましょう。
                </p>
              </div>
            )}
          </div>
        </main>

        {/* 右側サイドバー：拡張コンテンツ */}
        <aside className="hidden xl:block w-80 p-6 sticky top-0 h-screen overflow-y-auto">
          <div className="space-y-6">
            <div className="bg-zinc-900/40 rounded-3xl p-6 border border-gray-800/50 backdrop-blur-sm">
              <h3 className="text-lg font-black mb-4 text-white/90 flex items-center gap-2">
                <span className="h-2 w-2 bg-blue-500 rounded-full animate-ping"></span>
                トレンド
              </h3>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-1">
                    <div className="h-3 bg-gray-800/50 rounded-full w-3/4 animate-pulse"></div>
                    <div className="h-2 bg-gray-800/30 rounded-full w-1/2 animate-pulse"></div>
                  </div>
                ))}
              </div>
              <button className="mt-6 text-xs text-blue-500 font-bold hover:underline">さらに表示</button>
            </div>

            <div className="px-4 py-2 text-[10px] text-gray-600 flex flex-wrap gap-x-4 gap-y-2 uppercase tracking-widest font-bold">
              <span>利用規約</span>
              <span>プライバシー</span>
              <span>© 2026 Pulse</span>
              <span className="text-blue-900">v1.0.4-stable</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
