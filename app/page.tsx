"use client";

import { useUser, UserButton } from "@clerk/nextjs";

export default function Home() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) return <div className="min-h-screen bg-black text-white p-10 font-sans">Loading...</div>;

  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col items-center justify-center gap-8">
      <div className="text-center space-y-2">
        <h1 className="text-6xl font-black italic tracking-tighter text-white">pulse</h1>
        <p className="text-zinc-500 font-medium">Next generation social pulse.</p>
      </div>

      <div className="bg-zinc-950 border border-zinc-800 p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-6 w-full max-w-sm">
        {user ? (
          <>
            <div className="w-20 h-20 rounded-full border-2 border-zinc-700 p-1">
              <img src={user.imageUrl} className="w-full h-full rounded-full object-cover" alt="me" />
            </div>
            <div className="text-center">
              <p className="text-xl font-bold">Welcome back!</p>
              <p className="text-zinc-500 text-sm">@{user.username || "User"}</p>
            </div>
            <div className="flex items-center gap-4">
               <UserButton afterSignOutUrl="/" />
               <div className="h-4 w-[1px] bg-zinc-800" />
               <p className="text-sm font-bold">Signed In</p>
            </div>
          </>
        ) : (
          <div className="text-center space-y-4">
            <p className="text-zinc-400">Please sign in from the header.</p>
          </div>
        )}
      </div>

      <p className="text-zinc-700 text-xs">System Status: Testing Deploy Mode</p>
    </div>
  );
}
