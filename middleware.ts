import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// 💡 ここに /sso-callback を追加！
const isPublicRoute = createRouteMatcher(['/', '/sso-callback(.*)']);

export default clerkMiddleware((auth, request) => {
  // 💡 公開ルートなら即終了してスルーさせる
  if (isPublicRoute(request)) {
    return;
  }

  // 💡 それ以外は保護
  const authConfig = auth() as any;
  if (typeof authConfig.protect === 'function') {
    authConfig.protect();
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
