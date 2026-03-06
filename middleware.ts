import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// 💡 ログインなしでもアクセスできるページを指定（トップページ）
const isPublicRoute = createRouteMatcher(['/']);

export default clerkMiddleware((auth, request) => {
  // 💡 公開ルート以外でログインしていない場合は、ログインを強制する
  if (!isPublicRoute(request)) {
    auth().protect();
  }
});

export const config = {
  matcher: [
    // Clerk公式の推奨設定（静的ファイルを除外してすべてに適用）
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
