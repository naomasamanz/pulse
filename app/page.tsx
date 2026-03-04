"use client";

import { useState, useEffect } from "react";
import { useUser, UserButton } from "@clerk/nextjs";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
// ↓ ここ！大文字小文字が1ミリでも違うとVercelは怒るんだ
import LandingPage from "./components/LandingPage";

const ADMIN_USER_ID = "user_3AT5oMVRngSjFmGA1C4FTPKwDU5"; 

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Home() {
  const { user, isLoaded } = useUser();
  const [content, setContent] = useState("");
  const [posts, setPosts] = useState<any[]>([]);
  const [myProfile, setMyProfile] = useState<{ username: string; avatar_url?: string } | null>(null);
  const [newUsername, setNewUsername] = useState("");

  const fetchData = async () => {
    try {
      const { data: postData } = await supabase
        .from("posts")
        .select(`*, profiles:username (avatar_url)`)
        .order("created_at", { ascending: false });
      
      if (postData) setPosts(postData);

      if (user) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("username, avatar_url")
          .eq("id", user.id)
          .single();
        if (profileData) setMyProfile(profileData);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (isLoaded) fetchData();
  }, [user, isLoaded]);

  // --- 以下、さっきの機能と同じ ---
  if (!isLoaded) return <div className="bg-black min-h-screen text-white p-10">Loading...</div>;
  if (!user) return <LandingPage />;

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <div className="fixed top-4 right-4 z-50 flex items-center gap-3 bg-black/60 p-1.5 rounded-full backdrop-blur-md border border-zinc-800">
        <UserButton afterSignOutUrl="/" />
      </div>
      <main className="max-w-2xl mx-auto border-x border-zinc-800 min-h-screen p-4">
        <h1 className="text-2xl font-bold mb-8 italic">pulse</h1>
        {/* 投稿フォームなどのUI */}
        <p className="text-zinc-500 text-sm">Welcome back, @{myProfile?.username || "loading..."}</p>
      </main>
    </div>
  );
}
