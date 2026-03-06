"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useUser, UserButton } from "@clerk/nextjs";
import { Clock, Heart, Loader2 } from "lucide-react"; // Loader2を追加
import Sidebar from "./components/Sidebar";
import PostForm from "./components/PostForm";
import LandingPage from "./components/LandingPage";

// Supabaseクライアントの初期化
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Home() {
  const { user, isLoaded } = useUser();
  const [posts, setPosts] = useState<any[]>([]);
  const [myLikes, setMyLikes] = useState<number[]>([]); // 自分がいいねした投稿IDのリスト

  // 1. 投稿一覧を取得する
  const fetchPosts = async () => {
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
  };

  // 2. 自分の「いいね」状態を取得する
  const fetchMyLikes = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("notifications")
      .select("post_id")
      .eq("actor_id", user.id)
      .eq("type", "like");
    
    if (data) {
      setMyLikes(data.map((l: any) => l.post_id));
    }
  };

  // ログイン状態が変わった時にデータを取得
  useEffect(() => {
    if (isLoaded && user) {
      fetchPosts();
      fetchMyLikes();
    }
  }, [isLoaded, user]);

  const handleNewPost = () => {
    fetchPosts();
  };

  // ❤️ いいねトグル処理（スパム防止・データクリーン版）
  const handleLike = async (post: any) => {
    if (!user) return;

    const isLiked = myLikes.includes(post.id);
    
    // 見た目を先に変える（楽観的更新）
    if (isLiked) {
      setMyLikes(myLikes.filter(id => id !== post.id));
    } else {
      setMyLikes([...myLikes, post.id]);
    }

    // DBに「今のいいね状態」があるか確認
    const { data: existingLike } = await supabase
      .from("notifications")
      .select("id")
      .eq("user_id", post.user_id)
      .eq("actor_id", user.id)
      .eq("post_id", post.id)
      .eq("type", "like")
      .maybeSingle();

    if (existingLike) {
      // すでにあれば削除（＝通知を取り消す）
      await supabase.from("notifications").delete().eq("id", existingLike.id);
    } else {
      // なければ新規作成（＝通知を送る）
      await supabase.from("notifications").insert({
        user_id: post.user_id,
        actor_id: user.id,
        type: "like",
        post_id: post.id,
      });
    }
  };

  // 💡 ここが大事！ログイン判定中の表示
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
        <p className="text-blue-500 font-bold tracking-widest animate-pulse">PULSE CONNECTING...</p>
      </div>
    );
  }

  // 💡 完全にログインしていないと確定したらランディングページへ
  if (!user) {
    return <LandingPage />;
  }

  return (
    <div className="flex justify-center min-h-screen bg-black text-white">
      <div className="flex w-full max-w-[1300px] justify-start">
        
        {/* 左側サイドバー */}
        <Sidebar />

        {/* 中央メインコンテンツ */}
        <main className="flex-1 max-w-2xl border-r border-gray-800 bg-black min-h-screen">
          {/* ヘッダー */}
          <div className="sticky top-0 bg-black/80 backdrop-blur-md border-b border-gray-800 p-4 flex justify-between items-center z-10">
            <h1 className="text-xl font-bold tracking-tight">ホーム</h1>
            <div className="md:hidden">
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
          
          {/* 投稿フォーム */}
          <PostForm onPostSuccess={handleNewPost} />

          {/* タイムライン */}
          <div className="divide-y divide-gray-800">
            {posts.length > 0 ? (
              posts.map((post) => {
                const isLiked = myLikes.includes(post.id);
                return (
                  <article key={post.id} className="p-6 hover:bg-white/[0.02] transition-colors group">
                    <div className="mb-3">
                      <h2 className="text-2xl font-extrabold text-white mb-2 break-words">
                        {post.title || "無題の投稿"}
                      </h2>
                      <p className="text-gray-400 text-lg leading-relaxed break-words whitespace-pre-wrap mb-4">
                        {post.content}
                      </p>
                      
                      {/* 投稿画像がある場合 */}
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
                    
                    {/* 投稿フッター */}
                    <div className="flex items-center justify-between text-xs text-gray-500 mt-4">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full" />
                        <span className="font-medium text-blue-400/80">
                          @{post.profiles?.username || post.user_id?.slice(0, 8)}
                        </span>
                      </div>

                      <div className="flex items-center gap-6">
                        {/* ❤️ いいねボタン */}
                        <button 
                          onClick={() => handleLike(post)}
                          className={`flex items-center gap-1 group/like transition-colors ${isLiked ? 'text-pink-500' : 'text-gray-500 hover:text-pink-500'}`}
                        >
                          <div className={`p-2 rounded-full transition-colors ${isLiked ? 'bg-pink-500/10' : 'group-hover/like:bg-pink-500/10'}`}>
                            <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
                          </div>
                        </button>

                        <div className="flex items-center gap-1 opacity-60">
                          <Clock size={12} />
                          <time>{new Date(post.created_at).toLocaleDateString('ja-JP')}</time>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })
            ) : (
              <div className="p-20 text-center text-gray-600 italic">
                パルスを読み込み中、または投稿がありません。
              </div>
            )}
          </div>
        </main>

        {/* 右側サイドバー（デスクトップのみ） */}
        <div className="hidden xl:block w-80 p-4">
          <div className="bg-gray-900/50 rounded-2xl p-4 border border-gray-800">
            <h3 className="text-lg font-bold mb-4">いまどうしてる？</h3>
            <p className="text-sm text-gray-500 italic">Coming Soon...</p>
            <div className="mt-4 space-y-4">
              <div className="h-4 bg-gray-800 rounded w-3/4 animate-pulse"></div>
              <div className="h-4 bg-gray-800 rounded w-1/2 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
