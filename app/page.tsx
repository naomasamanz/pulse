"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { createClient } from "@supabase/supabase-js";

// Supabaseとの接続設定
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Home() {
  const { user } = useUser();
  const [content, setContent] = useState("");
  const [posts, setPosts] = useState<any[]>([]);

  // 1. 投稿一覧をデータベースから取ってくる
  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (data) setPosts(data);
    if (error) console.error("Error fetching:", error);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // 2. 投稿ボタンを押した時の処理
  const handlePost = async () => {
    if (!content || !user) return;

    const { error } = await supabase.from("posts").insert([
      {
        content: content,
        username: user.username || user.firstName || "匿名ユーザー",
      },
    ]);

    if (!error) {
      setContent(""); // 入力欄を空にする
      fetchPosts();   // 最新の投稿一覧に更新する
    } else {
      console.error("Error posting:", error);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <main className="max-w-2xl mx-auto">
        {/* 投稿フォーム */}
        <div className="p-4 border-b border-zinc-800">
          <textarea
            className="w-full bg-transparent text-xl outline-none resize-none"
            placeholder="いま、何が起きてる？"
            rows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <div className="flex justify-end mt-2">
            <button
              onClick={handlePost}
              disabled={!user || !content}
              className="bg-white text-black rounded-full px-6 py-2 font-bold disabled:opacity-50"
            >
              Post
            </button>
          </div>
        </div>

        {/* タイムライン */}
        <div className="divide-y divide-zinc-800">
          {posts.map((post) => (
            <div key={post.id} className="p-4 hover:bg-zinc-900/50 transition">
              <div className="flex gap-3">
                <div className="w-12 h-12 rounded-full bg-zinc-800 flex-shrink-0" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">@{post.username}</span>
                    <span className="text-zinc-500 text-sm">
                      {new Date(post.created_at).toLocaleString('ja-JP')}
                    </span>
                  </div>
                  <p className="mt-1 text-[15px] leading-normal">{post.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
