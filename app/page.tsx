"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { createClient } from "@supabase/supabase-js";
import LandingPage from "./components/LandingPage"; // ログイン前画面を読み込む

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Home() {
  const { user, isLoaded } = useUser();
  const [content, setContent] = useState("");
  const [posts, setPosts] = useState<any[]>([]);
  const [myProfile, setMyProfile] = useState<{ username: string } | null>(null);
  const [newUsername, setNewUsername] = useState("");

  const fetchData = async () => {
    const { data: postData } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });
    if (postData) setPosts(postData);

    if (user) {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .single();
      if (profileData) setMyProfile(profileData);
    }
  };

  useEffect(() => {
    if (isLoaded) fetchData();
  }, [user, isLoaded]);

  const handleRegister = async () => {
    if (!newUsername || !user) return;
    const { error } = await supabase
      .from("profiles")
      .insert([{ id: user.id, username: newUsername }]);
    
    if (error) {
      alert(`登録エラー: ${error.message}`);
    } else {
      setMyProfile({ username: newUsername });
      fetchData();
    }
  };

  const handlePost = async () => {
    if (!content || !myProfile) return;
    const { error } = await supabase.from("posts").insert([
      { content: content, username: myProfile.username },
    ]);
    if (!error) {
      setContent("");
      fetchData();
    }
  };

  if (!isLoaded) return <div className="text-white p-4 text-center">Loading...</div>;

  // 【ここがポイント！】未ログインなら別ファイルの「LandingPage」を表示
  if (!user) return <LandingPage />;

  // プロフィール未登録なら登録画面
  if (user && !myProfile) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-4 border border-zinc-800 p-8 rounded-2xl bg-zinc-950">
          <h1 className="text-2xl font-bold text-center">ユーザー名を決めよう！</h1>
          <input
            className="w-full bg-zinc-900 border border-zinc-800 p-3 rounded-lg outline-none focus:border-white"
            placeholder="例: naomasa_v3"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
          />
          <button onClick={handleRegister} className="w-full bg-white text-black font-bold p-3 rounded-lg hover:bg-zinc-200">
            登録して始める
          </button>
        </div>
      </div>
    );
  }

  // メインのタイムライン（ログイン後）
  return (
    <div className="min-h-screen bg-black text-white">
      <main className="max-w-2xl mx-auto border-x border-zinc-800 min-h-screen">
        <div className="p-4 border-b border-zinc-800">
          <textarea
            className="w-full bg-transparent text-xl outline-none resize-none"
            placeholder="いま、何が起きてる？"
            rows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <div className="flex justify-end mt-2 items-center gap-4">
            {myProfile && <span className="text-zinc-500 font-medium">@{myProfile.username}</span>}
            <button
              onClick={handlePost}
              disabled={!content}
              className="bg-white text-black rounded-full px-6 py-2 font-bold disabled:opacity-50"
            >
              Post
            </button>
          </div>
        </div>

        <div className="divide-y divide-zinc-800">
          {posts.map((post) => (
            <div key={post.id} className="p-4 hover:bg-zinc-900/50 transition-colors cursor-pointer">
              <div className="flex gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold">@{post.username}</span>
                  </div>
                  <p className="mt-1 text-[15px]">{post.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
