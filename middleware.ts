import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// 💡 公開ルート（ログインなしでOKな場所）を定義
const isPublicRoute = createRouteMatcher(['/']);

export default clerkMiddleware(async (auth, request) => {
  // 💡 公開ルート以外でログインしていない場合は、ログインを強制
  if (!isPublicRoute(request)) {
    // 💡 ここ！ await をつけるのが最新のルールだよ
    await auth().protect();
  }
});

export const config = {
  matcher: [
    // 静的ファイルを除外してすべてに適用
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
