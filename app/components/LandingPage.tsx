import { SignInButton } from "@clerk/nextjs";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col md:flex-row font-sans">
      {/* 左半分：巨大ロゴ */}
      <div className="flex-1 flex items-center justify-center p-8">
        <h1 className="text-[80px] md:text-[180px] font-black tracking-tighter hover:scale-105 transition-transform cursor-default">
          pulse
        </h1>
      </div>

      {/* 右半分：登録エリア */}
      <div className="flex-1 flex flex-col justify-center p-8 md:p-24 bg-zinc-950/30">
        <h2 className="text-5xl md:text-7xl font-black mb-16 leading-[1.1] tracking-tight">
          すべての話題が、<br />いま、ここに。
        </h2>
        
        <div className="max-w-[320px] space-y-10">
          <h3 className="text-3xl font-bold tracking-tight">今すぐ参加しましょう。</h3>
          
          <div className="space-y-4">
            {/* Clerkのログインボタンをラップする */}
            <SignInButton mode="modal">
              <button className="w-full bg-white text-black rounded-full py-3.5 font-bold text-lg hover:bg-zinc-200 transition-all shadow-lg active:scale-95">
                Googleでログイン
              </button>
            </SignInButton>

            <div className="flex items-center gap-4 text-zinc-600">
              <div className="h-[1px] bg-zinc-800 flex-1"></div>
              <span className="text-xs font-bold uppercase tracking-widest">or</span>
              <div className="h-[1px] bg-zinc-800 flex-1"></div>
            </div>

            <SignInButton mode="modal">
              <button className="w-full border border-zinc-700 text-blue-400 rounded-full py-3.5 font-bold text-lg hover:bg-blue-400/10 transition-all active:scale-95">
                アカウントを作成
              </button>
            </SignInButton>
          </div>

          <p className="text-[11px] text-zinc-500 leading-relaxed">
            アカウントを登録することにより、<span className="text-blue-400 cursor-pointer">利用規約</span>と<span className="text-blue-400 cursor-pointer">プライバシーポリシー</span>（Cookieの使用を含む）に同意したとみなされます。
          </p>
        </div>
      </div>
    </div>
  );
}
