"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { Home as HomeIcon, Search, Bell, Mail, User } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { name: "ホーム", href: "/", icon: HomeIcon },
    { name: "見つける", href: "/explore", icon: Search },
    { name: "通知", href: "/notifications", icon: Bell },
    { name: "メッセージ", href: "/messages", icon: Mail },
    { name: "プロフィール", href: "/profile", icon: User },
  ];

  return (
    <aside className="w-20 lg:w-64 hidden md:flex flex-col sticky top-0 h-screen p-2 lg:p-4 border-r border-gray-800 items-center lg:items-start">
      {/* ロゴ部分 */}
      <div className="mb-8 px-4 text-3xl font-black tracking-tighter italic text-blue-500 hidden lg:block">
        PULSE
      </div>
      <div className="mb-8 text-3xl font-black text-blue-500 lg:hidden block">
        P
      </div>

      {/* ナビゲーション */}
      <nav className="flex-1 flex flex-col gap-2 w-full">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-4 px-4 py-3 rounded-full cursor-pointer transition-all hover:bg-white/10 active:scale-95 w-fit lg:w-full ${
                isActive ? "font-bold text-white bg-white/5" : "text-gray-400"
              }`}
            >
              <item.icon size={28} className={isActive ? "text-blue-500" : ""} />
              <span className="text-xl hidden lg:inline">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* アカウントボタン */}
      <div className="mt-auto mb-4 p-3 flex items-center gap-3 hover:bg-white/10 rounded-full transition cursor-pointer w-fit lg:w-full text-gray-400 hover:text-white">
        <UserButton />
        <span className="font-bold text-sm hidden lg:inline ml-1">アカウント</span>
      </div>
    </aside>
  );
}
