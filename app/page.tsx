"use client";

import { useState, useEffect } from "react";
import { useUser, UserButton } from "@clerk/nextjs";
import { createClient } from "@supabase/supabase-js";
// ファイル名が LandingPage.tsx であることを確認してね！
import LandingPage from "./components/LandingPage";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Home() {
  const { user, isLoaded } = useUser();
  const [myProfile, setMyProfile] = useState<any>(null);

  useEffect(() => {
    async function fetchProfile() {
      if (isLoaded && user) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        if (data) setMyProfile(data);
      }
    }
    fetchProfile();
  }, [user, isLoaded]);

  if (!isLoaded) return <div className="min-h-screen bg-black text-white p-10 font-mono">Loading...</div>;

  // ログインしてない時はLandingPageへ
  if (!user) return <LandingPage />;

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-xl mx-auto border border-zinc-800 rounded-3xl p-8 bg-zinc-900/20">
        <header className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-black italic tracking-tighter">pulse</h1>
          <UserButton afterSignOutUrl="/" />
        </header>
        
        <div className="space-y-4">
          <p className="text-zinc-400">Status: <span className="text-green-500 font-bold">ONLINE</span></p>
          <p className="text-2xl font-bold">Welcome, @{myProfile?.username || user.username}</p>
        </div>
      </div>
    </div>
  );
}
