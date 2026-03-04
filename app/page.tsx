"use client";

import { useState, useEffect } from "react";
import { useUser, UserButton } from "@clerk/nextjs";
import { createClient } from "@supabase/supabase-js";
// LandingPageの読み込み（パスと大文字小文字に注意！）
import LandingPage from "./components/LandingPage";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Home() {
  const { user, isLoaded } = useUser();
  const [posts, setPosts] = useState<any[]>([]);
  const [myProfile, setMyProfile] = useState<any>(null);

  // データを取得する関数
  const fetchData = async () => {
    if (!user) return;
    
    // 投稿を取得
    const { data: postData } = await supabase
      .from("posts")
      .select(`*, profiles:username (avatar_url)`)
      .order("created_at", { ascending: false });
    if (postData) setPosts(postData);

    // プロフィールを取得
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    if (profileData) setMyProfile(profileData);
  };

  useEffect(() => {
    if (isLoaded && user) {
      fetchData();
    }
  }, [user, isLoaded]);

  if (!isLoaded) return <div className="bg-black min-h-screen text-white p-10 font-mono">Loading pulse system...</div>;

  // ログインしていない場合はLandingPageを表示
  if (!user) return <LandingPage />;

  return (
    <div className="min-h-screen bg-black text-white p-4 font-sans">
      <div className="max-w-2xl mx-auto">
        <header className="flex justify-between items-center py-6 border-b border-zinc-800 mb-8">
          <h1 className="text-3xl font-black italic tracking-tighter">pulse</h1>
          <UserButton afterSignOutUrl="/" />
        </header>

        <div className="space-y-6">
          <p className="text-zinc-400">Welcome, <span className="text-white font-bold">@{myProfile?.username || user.username || "user"}</span></p>
          
          <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-3xl text-center">
            <p className="text-zinc-500 text-sm mb-2">Build Status</p>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-green-500 text-xs font-bold uppercase tracking-widest">System Online</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
