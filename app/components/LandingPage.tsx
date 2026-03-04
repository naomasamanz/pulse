"use client";

import { useSignIn } from "@clerk/nextjs";

export default function LandingPage() {
  const { signIn, isLoaded } = useSignIn();

  // Googleログインを直接実行する関数
  const loginWithGoogle = () => {
    if (!isLoaded) return;
    signIn.authenticateWithRedirect({
      strategy: "oauth_google",
      redirectUrl: "/sso-callback",
      redirectUrlComplete: "/",
    });
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col md:flex-row font-sans">
      
      {/* 【復活！】左半分：巨大ロゴ */}
      <div className="flex-1 flex items-center justify-center p-8">
        <h1 className="text-[70px] md:text-[140px] font-black tracking-tighter hover:scale-105 transition-transform cursor-default select-none">
          pulse
        </h1>
      </div>

      {/* 右半分：登録エリア */}
      <div className="flex-1 flex flex-col justify-center p-8 md:p-24 bg-zinc-950/30">
        <h2 className="text-4xl md:text-5xl font-black mb-10 leading-[1.1] tracking-tight text-white">
          すべての話題が、<br />いま、ここに。
        </h2>
        
        <div className="max-w-[300px] space-y-8">
          <h3 className="text-2xl font-bold tracking-tight text-white">今すぐ参加しましょう。</h3>
          
          <div className="space-y-3">
            {/* Googleログインボタン（直接ジャンプ） */}
            <button 
              onClick={loginWithGoogle}
              className="w-full bg-white text-black rounded-full py-2.5 font-bold text-base hover:bg-zinc-200 transition-all shadow-lg active:scale-95"
            >
              Googleでログイン
            </button>

            <div className="flex items-center gap-4 text-zinc-600">
              <div className="h-[1px] bg-zinc-800 flex-1"></div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">or</span>
              <div className="h-[1px] bg-zinc-800 flex-1"></div>
            </div>

            {/* アカウント作成ボタン（これもGoogleに飛ばす） */}
            <button 
              onClick={loginWithGoogle}
              className="w-full border border-zinc-700 text-blue-400 rounded-full py-2.5 font-bold text-base hover:bg-blue-400/10 transition-all active:scale-95"
            >
              アカウントを作成
            </button>
          </div>

          <p className="text-[11px] text-zinc-500 leading-relaxed">
            アカウントを登録することにより、<span className="text-blue-400 cursor-pointer hover:underline">利用規約</span>と<span className="text-blue-400 cursor-pointer hover:underline">プライバシーポリシー</span>に同意したとみなされます。
          </p>
        </div>
      </div>
    </div>
  );
}
