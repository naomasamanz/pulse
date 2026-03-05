"use client";
import { useUser, UserButton } from "@clerk/nextjs";
import Link from "next/link";

// LandingPageを読み込まない！
export default function ProfilePage() {
  const { user, isLoaded } = useUser();
  if (!isLoaded) return <div className="bg-black text-white p-10">Loading...</div>;
  
  // 未ログインならトップへ飛ばす（インポート不要）
  if (!user) {
    if (typeof window !== "undefined") window.location.href = "/";
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <Link href="/">← Back</Link>
      <div className="mt-4 border border-zinc-800 p-6 rounded-2xl">
        <UserButton />
        <p className="mt-2 font-bold">@{user.username}</p>
      </div>
    </div>
  );
}
