"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useUser, UserButton } from "@clerk/nextjs";
import { Clock, Heart } from "lucide-react";
import Sidebar from "./components/Sidebar";
import PostForm from "./components/PostForm";
import LandingPage from "./components/LandingPage";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Home() {
  const { user, isLoaded } = useUser();
  const [posts, setPosts] = useState<any[]>([]);
  const [myLikes, setMyLikes] = useState<number[]>([]); // 👈 自分がいいねした投稿IDを保存

  const fetchPosts = async () => {
    const { data } = await supabase
      .from("posts")
      .select(`*, profiles!left ( username )`)
      .order("created_at", { ascending: false });
    
    if (data) setPosts(data);
  };

  // 💡 自分がいいねした投稿を全部取ってくる関数
  const fetchMyLikes = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("notifications")
      .select("post_id")
      .eq("actor_id", user.id)
      .eq("type", "like");
    
    if (data) {
      // IDだけの配列 [1, 2, 5...] に変換して保存
      setMyLikes(data.map((l: any) => l.post_id));
    }
  };

  useEffect(() => {
    if (isLoaded && user) {
      fetchPosts();
      fetchMyLikes(); // 👈 起動時にいいね状態も取る
    }
  }, [isLoaded, user]);

  const handleLike = async (post: any) => {
    if (!user) return;

    // 💡 画面上の見た目を「先に」変えちゃう（爆速リアクション！）
    const isLiked = myLikes.includes(post.id);
    if (isLiked) {
      setMyLikes(myLikes.filter(id => id !== post.id)); // 赤を消す
    } else {
      setMyLikes([...myLikes, post.id]); // 赤くする
    }

    // 裏側でDBを更新
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
  };

  if (!isLoaded) return null;
  if (!user) return <LandingPage />;

  return (
    <div className="flex justify-center min-h-screen bg-black text-white">
      <div className="flex w-full max-w-[1300px] justify-start">
        <Sidebar />
        <main className="flex-1 max-w-2xl border-r border-gray-800 bg-black min-h-screen">
          <div className="sticky top-0 bg-black/80 backdrop-blur-md border-b border-gray-800 p-4 flex justify-between items-center z-10">
            <h1 className="text-xl font-bold tracking-tight">ホーム</h1>
            <div className="md:hidden"><UserButton afterSignOutUrl="/" /></div>
          </div>
          <PostForm onPostSuccess={fetchPosts} />

          <div className="divide-y divide-gray-800">
            {posts.map((post) => {
              const isLiked = myLikes.includes(post.id); // 👈 この投稿にいいねしてるか判定！

              return (
                <article key={post.id} className="p-6 hover:bg-white/[0.02] transition-colors group">
                  <div className="mb-3">
                    <h2 className="text-2xl font-extrabold mb-2 break-words">{post.title || "無題"}</h2>
                    <p className="text-gray-400 text-lg mb-4 break-words whitespace-pre-wrap">{post.content}</p>
                    {post.image_url && (
                      <img src={post.image_url} className="rounded-2xl border border-gray-800 w-full" />
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full" />
                      <span className="text-xs text-blue-400 font-medium">@{post.profiles?.username || post.user_id?.slice(0, 8)}</span>
                    </div>

                    <div className="flex items-center gap-6">
                      <button 
                        onClick={() => handleLike(post)}
                        className={`flex items-center gap-1 group/like transition-colors ${isLiked ? 'text-pink-500' : 'text-gray-500 hover:text-pink-500'}`}
                      >
                        <div className={`p-2 rounded-full transition-colors ${isLiked ? 'bg-pink-500/10' : 'group-hover/like:bg-pink-500/10'}`}>
                          {/* 💡 isLiked なら fill（塗りつぶし）にする！ */}
                          <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
                        </div>
                      </button>
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <Clock size={12} />
                        <time>{new Date(post.created_at).toLocaleDateString('ja-JP')}</time>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </main>
        <div className="hidden xl:block w-80 p-4"></div>
      </div>
    </div>
  );
}
