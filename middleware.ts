import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// 💡 公開ルート（ログインなしでOKな場所）を定義
// トップページだけは誰でも見れるようにしておく
const isPublicRoute = createRouteMatcher(['/']);

export default clerkMiddleware(async (auth, request) => {
  // 💡 公開ルート以外（＝保護したいページ）にアクセスした場合
  if (!isPublicRoute(request)) {
    // 💡 auth() を await して取得
    const authObject = await auth();
    
    // 💡 protect メソッドを呼び出す
    // もし型エラーがしつこい場合は、このように直接呼び出せるはず
    await authObject.protect();
  }
});

export const config = {
  matcher: [
    // 静的ファイルを除外してすべてに適用
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
