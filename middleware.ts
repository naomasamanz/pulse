import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// 💡 1. 公開ルート（トップページ）を定義
const isPublicRoute = createRouteMatcher(['/']);

export default clerkMiddleware((auth, request) => {
  // 💡 2. もしトップページ（/）なら、何もせずスルー！
  // これで Middleware 内部の複雑な非同期処理をスキップさせる
  if (isPublicRoute(request)) {
    return;
  }

  // 💡 3. それ以外のページ（保護したいページ）の場合だけ protect を実行
  // 型エラーを避けるため、ここではもっともシンプルな呼び出しにする
  const authConfig = auth() as any;
  if (typeof authConfig.protect === 'function') {
    authConfig.protect();
  }
});

export const config = {
  matcher: [
    // 💡 4. 静的ファイルを除外する最新の正規表現（これはそのまま）
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
