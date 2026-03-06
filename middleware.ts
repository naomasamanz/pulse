import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// 💡 公開ルート（ログインなしでOKな場所）を定義
const isPublicRoute = createRouteMatcher(['/']);

export default clerkMiddleware(async (auth, request) => {
  // 💡 公開ルート以外でログインしていない場合は、ログインを強制
  if (!isPublicRoute(request)) {
    // 💡 (await auth()) と書くことで、Promiseを解決してから protect を呼び出す！
    const authObject = await auth();
    authObject.protect();
  }
});

export const config = {
  matcher: [
    // 静的ファイルを除外してすべてに適用
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
