"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { createClient } from "@supabase/supabase-js";

// Supabaseの接続設定
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

  // 1. 投稿一覧と自分のプロフィールを取得する関数
  const fetchData = async () => {
    // 投稿を取得
    const { data: postData } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });
    if (postData) setPosts(postData);

    // 自分のプロフィールを取得
    if (user) {
      const { data: profileData, error } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .single();
      
      if (profileData) {
        setMyProfile(profileData);
      } else if (error) {
        console.log("プロフィール未登録またはエラー:", error.message);
      }
    }
  };

  useEffect(() => {
    if (isLoaded) fetchData();
  }, [user, isLoaded]);

  // 2. ユーザー名を登録する関数（エラー詳細表示版）
  const handleRegister = async () => {
    if (!newUsername || !user) {
      alert("ユーザー名を入力してください");
      return;
    }

    console.log("登録を試みます:", { id: user.id, username: newUsername });

    const { data, error } = await supabase
      .from("profiles")
      .insert([{ id: user.id, username: newUsername }])
      .select();
    
    if (error) {
      console.error("Supabase登録エラー詳細:", error);
      // 画面に英語のエラーメッセージをそのまま出す
      alert(`登録に失敗しました。理由: ${error.message}\n(ヒント: ${error.hint || "なし"})`);
    } else {
      console.log("登録成功！:", data);
      setMyProfile({ username: newUsername });
      fetchData(); // 登録後にデータを再取得
    }
  };

  // 3. 投稿する関数
  const handlePost = async () => {
    if (!content || !myProfile) return;
    const { error } = await supabase.from("posts").insert([
      {
        content: content,
        username: myProfile.username,
      },
    ]);
    if (!error) {
      setContent("");
      fetchData();
    }
  };

  // 読み込み中
  if (!isLoaded) return <div className="text-white p-4 text-center">Loading...</div>;

  // 未ログイン
  if (!user) return <div className="text-white p-4 text-center">ログインしてください</div>;

  // プロフィールがない場合は登録画面を表示
  if (user && !myProfile) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-4 border border-zinc-800 p-8 rounded-2xl bg-zinc-950">
          <h1 className="text-2xl font-bold text-center">ユーザー名を決めよう！</h1>
          <p className="text-zinc-500 text-sm text-center">これがあなたのSNS上の名前になります。</p>
          <input
            className="w-full bg-zinc-900 border border-zinc-800 p-3 rounded-lg focus:outline-none focus:border-white transition-colors"
            placeholder="例: naomasa_v3"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
          />
          <button
            onClick={handleRegister}
            className="w-full bg-white text-black font-bold p-3 rounded-lg hover:bg-zinc-200 transition-colors"
          >
            登録して始める
          </button>
        </div>
      </div>
    );
  }

  // メインのタイムライン画面
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
              className="bg-white text-black rounded-full px-6 py-2 font-bold disabled:opacity-50 hover:bg-zinc-200 transition-all shadow-lg"
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
                    <span className="font-bold hover:underline">@{post.username}</span>
                    <span className="text-zinc-500 text-sm">
                      {new Date(post.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="mt-1 text-[15px] leading-normal">{post.content}</p>
                </div>
              </div>
            </div>
          ))}
          {posts.length === 0 && (
            <div className="p-10 text-center text-zinc-500">まだ投稿がありません。最初の投稿をしてみよう！</div>
          )}
        </div>
      </main>
    </div>
  );
}
