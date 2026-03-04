"use client";

import { useState, useEffect } from "react";
import { useUser, UserButton } from "@clerk/nextjs";
import { createClient } from "@supabase/supabase-js";
import LandingPage from "./components/LandingPage";

// ★自分の管理用IDをここに入れる（Clerkのダッシュボードか、console.log(user.id)で確認してね）
const ADMIN_USER_ID = "user_2tmS..."; 

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

  // ★投稿削除用の関数
  const handleDelete = async (postId: number) => {
    if (!confirm("この投稿を削除しますか？")) return;
    
    const { error } = await supabase
      .from("posts")
      .delete()
      .eq("id", postId);
    
    if (error) {
      alert("削除に失敗しました");
    } else {
      fetchData(); // タイムラインを更新
    }
  };

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
  if (!user) return <LandingPage />;

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

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="fixed top-4 right-4 z-50 bg-black/50 p-1 rounded-full backdrop-blur-md">
        <UserButton afterSignOutUrl="/" />
      </div>

      <main className="max-w-2xl mx-auto border-x border-zinc-800 min-h-screen">
        <div className="p-4 border-b border-zinc-800 sticky top-0 bg-black/80 backdrop-blur-md z-10">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-full bg-zinc-800 flex-shrink-0" />
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

        <div className="divide-y divide-zinc-800">
          {posts.map((post) => (
            <div key={post.id} className="p-4 hover:bg-zinc-900/30 transition-colors group relative">
              <div className="flex gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 flex-shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold hover:underline cursor-pointer">@{post.username}</span>
                      <span className="text-zinc-500 text-sm">· 今</span>
                    </div>

                    {/* ★管理者（あなた）だけに表示される削除ボタン */}
                    {user.id === ADMIN_USER_ID && (
                      <button 
                        onClick={() => handleDelete(post.id)}
                        className="text-zinc-600 hover:text-red-500 transition-colors p-1"
                        title="投稿を削除"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                  <p className="mt-1 text-[15px] leading-normal">{post.content}</p>
                  
                  <div className="flex justify-between mt-3 max-w-md text-zinc-500">
                    <button className="hover:text-blue-400">💬 0</button>
                    <button className="hover:text-green-400">🔄 0</button>
                    <button className="hover:text-pink-400">❤️ 0</button>
                    <button className="hover:text-blue-400">📊 0</button>
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
