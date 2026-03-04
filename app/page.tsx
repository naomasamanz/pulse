"use client";

import { useState, useEffect } from "react";
import { useUser, UserButton } from "@clerk/nextjs";
import { createClient } from "@supabase/supabase-js";
import LandingPage from "./components/LandingPage";

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

  // 未ログイン時はあのカッコいい画面を表示
  if (!user) return <LandingPage />;

  // プロフィール未登録時の画面
  if (user && !myProfile) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6 border border-zinc-800 p-8 rounded-2xl bg-zinc-950 shadow-2xl">
          <h1 className="text-2xl font-bold text-center">ユーザー名を決めよう</h1>
          <input
            className="w-full bg-zinc-900 border border-zinc-800 p-3 rounded-xl outline-none focus:border-blue-500 transition-all"
            placeholder="ユーザー名を入力..."
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
          />
          <button onClick={handleRegister} className="w-full bg-white text-black font-bold p-3 rounded-xl hover:bg-zinc-200 transition-all">
            pulseを始める
          </button>
        </div>
      </div>
    );
  }

  // ログイン後のメイン画面
  return (
    <div className="min-h-screen bg-black text-white">
      {/* 右上のユーザーアイコン（ログアウト用） */}
      <div className="fixed top-4 right-4 z-50 bg-black/50 p-1 rounded-full backdrop-blur-md">
        <UserButton afterSignOutUrl="/" />
      </div>

      <main className="max-w-2xl mx-auto border-x border-zinc-800 min-h-screen">
        {/* 投稿エリア */}
        <div className="p-4 border-b border-zinc-800 sticky top-0 bg-black/80 backdrop-blur-md z-10">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-full bg-zinc-800 flex-shrink-0 overflow-hidden">
               {/* 自分のアイコンをここに表示することも可能 */}
            </div>
            <div className="flex-1">
              <textarea
                className="w-full bg-transparent text-xl outline-none resize-none placeholder-zinc-600"
                placeholder="いま、何が起きてる？"
                rows={2}
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              <div className="flex justify-between items-center mt-3 border-t border-zinc-900 pt-3">
                <span className="text-zinc-500 text-sm font-medium">@{myProfile?.username}</span>
                <button
                  onClick={handlePost}
                  disabled={!content}
                  className="bg-white text-black rounded-full px-5 py-1.5 font-bold disabled:opacity-50 hover:bg-zinc-200 transition-all"
                >
                  Post
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* タイムライン */}
        <div className="divide-y divide-zinc-800">
          {posts.map((post) => (
            <div key={post.id} className="p-4 hover:bg-zinc-900/30 transition-colors">
              <div className="flex gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 flex-shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold hover:underline cursor-pointer">@{post.username}</span>
                    <span className="text-zinc-500 text-sm">· 今</span>
                  </div>
                  <p className="mt-1 text-[15px] leading-normal">{post.content}</p>
                  
                  {/* アクションボタン（飾り） */}
                  <div className="flex justify-between mt-3 max-w-md text-zinc-500">
                    <button className="hover:text-blue-400 transition-colors">💬 0</button>
                    <button className="hover:text-green-400 transition-colors">🔄 0</button>
                    <button className="hover:text-pink-400 transition-colors">❤️ 0</button>
                    <button className="hover:text-blue-400 transition-colors">📊 0</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
