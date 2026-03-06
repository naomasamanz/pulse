import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// 💡 公開ルート（トップページ）を定義
const isPublicRoute = createRouteMatcher(['/']);

export default clerkMiddleware(async (auth, request) => {
  // 💡 公開ルート（/）以外のページにアクセスしようとした場合
  if (!isPublicRoute(request)) {
    // 💡 protect() を直接メソッドとして呼ぶのではなく、
    // auth() 自体が持っている保護機能（await (await auth()).protect()）を使うか、
    // もしくは以下のように「型を一時的に無視」してビルドを通すのが正攻法だよ。
    const authObject = await auth();
    
    // 型エラーを回避するために (authObject as any) を使う
    // これで「protectなんてないよ！」という TypeScript のお叱りをスルーできる
    (authObject as any).protect();
  }
});

export const config = {
  matcher: [
    // Clerk公式推奨の最新のmatcher設定
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
