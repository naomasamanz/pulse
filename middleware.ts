import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// 💡 公開ルート（トップページ）の定義
const isPublicRoute = createRouteMatcher(['/']);

export default clerkMiddleware(async (auth, request) => {
  // 💡 もし公開ルート（/）へのアクセスなら、何もしない（スルーする）
  if (isPublicRoute(request)) {
    return;
  }

  // 💡 公開ルート以外の場合は保護をかける
  // プロパティを直接叩かずに protect() を実行する
  const authObj = await auth();
  authObj.protect();
});

export const config = {
  matcher: [
    // Clerk公式が推奨する、静的ファイルを除外する最新の正規表現
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
