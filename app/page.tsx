"use client"; // クライアントコンポーネントにするよ
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import PostForm from "./components/PostForm";
import { useUser } from "@clerk/nextjs"; // サーバーサイドのcurrentUserの代わり
import LandingPage from "./components/LandingPage";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Home() {
  const { user, isLoaded } = useUser();
  const [posts, setPosts] = useState<any[]>([]);

  // 最初にデータを取ってくる
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

  // 新しい投稿が来た時に、今のリストの「一番上」に追加する魔法の関数
  const handleNewPost = (newPost: any) => {
    setPosts([newPost, ...posts]);
  };

  if (!isLoaded) return null;
  if (!user) return <LandingPage />;

  return (
    <main className="max-w-2xl mx-auto border-x border-gray-800 min-h-screen bg-black text-white">
      <h1 className="p-4 text-xl font-bold border-b border-gray-800">ホーム</h1>
      
      {/* 投稿成功時の動きを渡してあげる */}
      <PostForm onPostSuccess={handleNewPost} />

      <div className="divide-y divide-gray-800">
        {posts.map((post) => (
          <div key={post.id} className="p-4 transition hover:bg-white/5">
            <p className="text-gray-500 text-sm">User: {post.user_id.slice(0, 8)}</p>
            <p className="text-lg">{post.content}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
