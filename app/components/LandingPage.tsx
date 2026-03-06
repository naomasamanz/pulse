"use client";

import { useSignIn, useSignUp, useAuth } from "@clerk/nextjs"; 
import { Github, Chrome, Zap } from "lucide-react";

export default function LandingPage() {
  // 💡 最新のClerkでは、ロード判定を useAuth から取るのが最も確実で型エラーが起きにくい
  const { isLoaded } = useAuth();
  const { signIn } = useSignIn();
  const { signUp } = useSignUp();

  // 認証の共通関数
  const loginWithStrategy = async (strategy: "oauth_google" | "oauth_github") => {
    // 💡 ロードが完了していない、またはSDKの準備ができていない場合は何もしない
    if (!isLoaded || !signIn || !signUp) return;

    try {
      // 💡 プロパティ名は型エラーが出ない最新の組み合わせに固定
      await signIn.authenticateWithRedirect({
        strategy: strategy,
        redirectUrl: "/sso-callback", // Clerkが内部で使用するエンドポイント
        redirectUrlComplete: "/",      // 認証完了後に戻る場所
      });
    } catch (err) {
      console.error("認証エラー:", err);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col md:flex-row font-sans selection:bg-blue-500/30">
      {/* 左半分：ロゴセクション */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent pointer-events-none" />
        <h1 className="text-[80px] md:text-[160px] font-black tracking-tighter hover:scale-105 transition-transform duration-500 cursor-default select-none z-10 drop-shadow-[0_0_30px_rgba(59,130,246,0.2)]">
          pulse
        </h1>
        <div className="z-10 flex items-center gap-2 text-blue-500 font-mono text-sm tracking-widest uppercase opacity-50">
          <Zap size={14} fill="currentColor" />
          <span>Keep the beat alive</span>
        </div>
      </div>

      {/* 右半分：登録エリア */}
      <div className="flex-1 flex flex-col justify-center p-8 md:p-24 bg-zinc-950/50 backdrop-blur-3xl border-l border-zinc-900">
        <h2 className="text-5xl md:text-7xl font-black mb-12 leading-[1.05] tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-500">
          すべての話題が、<br />いま、ここに。
        </h2>
        
        <div className="max-w-[360px] space-y-10">
          <div className="space-y-2">
            <h3 className="text-3xl font-black tracking-tight">今すぐ参加。</h3>
            <p className="text-zinc-500 text-sm">世界中の信号（パルス）を受け取りましょう。</p>
          </div>
          
          <div className="space-y-4">
            {/* Googleログインボタン */}
            <button 
              onClick={() => loginWithStrategy("oauth_google")}
              disabled={!isLoaded}
              className="w-full bg-white text-black rounded-full py-3.5 font-bold text-base hover:bg-zinc-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Googleで登録
            </button>

            {/* GitHubログインボタン */}
            <button 
              onClick={() => loginWithStrategy("oauth_github")}
              disabled={!isLoaded}
              className="w-full bg-[#1a1f24] text-white border border-zinc-800 rounded-full py-3.5 font-bold text-base hover:bg-zinc-900 transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Github size={20} />
              GitHubで登録
            </button>

            <div className="flex items-center gap-4 text-zinc-700 py-2">
              <div className="h-[1px] bg-zinc-900 flex-1"></div>
              <span className="text-[10px] font-black uppercase tracking-widest">or</span>
              <div className="h-[1px] bg-zinc-900 flex-1"></div>
            </div>

            <button 
              onClick={() => loginWithStrategy("oauth_google")}
              disabled={!isLoaded}
              className="w-full border-2 border-zinc-800 text-white rounded-full py-3.5 font-bold text-base hover:bg-white hover:text-black transition-all active:scale-[0.98] disabled:opacity-50"
            >
              メールアドレスでアカウント作成
            </button>
          </div>

          <div className="space-y-4">
            <p className="text-[11px] text-zinc-600 leading-relaxed">
              登録することで、<span className="text-blue-500 cursor-pointer hover:underline">利用規約</span>、
              <span className="text-blue-500 cursor-pointer hover:underline">プライバシーポリシー</span>、
              および<span className="text-blue-500 cursor-pointer hover:underline">Cookieの使用</span>に同意したものとみなされます。
            </p>
            
            <div className="pt-6">
              <h4 className="text-sm font-bold mb-3">すでにアカウントをお持ちですか？</h4>
              <button 
                onClick={() => loginWithStrategy("oauth_google")}
                className="w-full border border-zinc-700 text-blue-500 rounded-full py-2.5 font-bold text-sm hover:bg-blue-500/5 transition-all"
              >
                サインイン
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
