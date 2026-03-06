"use client";

import { useSignIn, useSignUp } from "@clerk/nextjs"; // 💡 SignUpも追加

export default function LandingPage() {
  const { signIn, isLoaded: signInLoaded } = useSignIn();
  const { signUp, isLoaded: signUpLoaded } = useSignUp(); // 💡 追加

  // 認証の共通関数
  const loginWithStrategy = async (strategy: "oauth_google" | "oauth_github") => {
    if (!signInLoaded || !signUpLoaded) return;

    // 💡 authenticateWithRedirect を使うときは、
    // signIn または signUp のどちらから始めても、Clerkが自動で判別してくれる設定にするよ
    try {
      await signIn.authenticateWithRedirect({
        strategy: strategy,
        redirectUrl: "/sso-callback", // 💡 ここを一時的なコールバックに向けるのが確実
        redirectUrlComplete: "/",
      });
    } catch (err) {
      console.error("認証エラー:", err);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col md:flex-row font-sans">
      {/* 左半分：ロゴ */}
      <div className="flex-1 flex items-center justify-center p-8">
        <h1 className="text-[70px] md:text-[140px] font-black tracking-tighter hover:scale-105 transition-transform cursor-default select-none">
          pulse
        </h1>
      </div>

      {/* 右半分：登録エリア */}
      <div className="flex-1 flex flex-col justify-center p-8 md:p-24 bg-zinc-950/30">
        <h2 className="text-4xl md:text-5xl font-black mb-10 leading-[1.1] tracking-tight">
          すべての話題が、<br />いま、ここに。
        </h2>
        
        <div className="max-w-[300px] space-y-8">
          <h3 className="text-2xl font-bold tracking-tight">今すぐ参加しましょう。</h3>
          
          <div className="space-y-3">
            {/* Googleログインボタン */}
            <button 
              onClick={() => loginWithStrategy("oauth_google")}
              className="w-full bg-white text-black rounded-full py-2.5 font-bold text-base hover:bg-zinc-200 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-3"
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
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
              className="w-full bg-[#24292f] text-white rounded-full py-2.5 font-bold text-base hover:bg-[#24292f]/90 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-3"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
              </svg>
              GitHubで登録
            </button>

            <div className="flex items-center gap-4 text-zinc-600 pt-2">
              <div className="h-[1px] bg-zinc-800 flex-1"></div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">or</span>
              <div className="h-[1px] bg-zinc-800 flex-1"></div>
            </div>

            <button 
              onClick={() => loginWithStrategy("oauth_google")}
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
