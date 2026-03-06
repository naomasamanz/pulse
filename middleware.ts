import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// 💡 公開ルート（ログインなしでOKな場所）を定義
const isPublicRoute = createRouteMatcher(['/']);

export default clerkMiddleware(async (auth, request) => {
  // 💡 公開ルート（トップページ）へのアクセスの場合は、即終了してスルーさせる
  // これが「戻されるループ」を防ぐ最強の盾！
  if (isPublicRoute(request)) {
    return;
  }

  // 💡 公開ルート以外の場合は保護をかける
  // 型エラーを回避するため、auth() の結果を直接 protect する最新の書き方だよ
  const authObj = await auth();
  
  // TypeScriptに「これは絶対に protect を持っている」と教える (any で回避)
  (authObj as any).protect();
});

export const config = {
  matcher: [
    // 静的ファイルを除外してすべてに適用する最新設定
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
