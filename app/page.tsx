"use client";

import { useUser, UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function Home() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) return <div className="bg-black min-h-screen text-white p-10">Loading...</div>;

  return (
    <div className="bg-black min-h-screen text-white p-10 flex flex-col items-center justify-center gap-6">
      <h1 className="text-4xl font-bold italic text-white tracking-tighter">pulse</h1>
      
      {user ? (
        <div className="flex flex-col items-center gap-4">
          <p className="text-zinc-400">Welcome back, @{user.username || "user"}</p>
          <div className="flex gap-4">
            <Link href="/profile" className="bg-white text-black px-6 py-2 rounded-full font-bold hover:bg-zinc-200 transition-all">
              My Profile
            </Link>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      ) : (
        <p className="text-zinc-500 text-center">Please sign in to continue.</p>
      )}
    </div>
  );
}
