import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

export default function SSOCallbackPage() {
  // 💡 このコンポーネントが、URLに含まれる認証トークンを処理してログインを完了させる
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-white font-black animate-pulse tracking-tighter text-2xl">
        PULSE AUTHENTICATING...
      </div>
      <AuthenticateWithRedirectCallback />
    </div>
  );
}
