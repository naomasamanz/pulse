"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useUser } from "@clerk/nextjs";
import { Clock, ArrowLeft, Edit3 } from "lucide-react";
import Link from "next/link";
import Sidebar from "../components/Sidebar";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ProfilePage() {
  const { user, isLoaded } = useUser();
  const [myPosts, setMyPosts] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState("");
  const [username, setUsername] = useState("");

  useEffect(() => {
    if (!user) return;

    const fetchProfileAndPosts = async () => {
      // 1. プロフィール情報を profiles テーブルから取得
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      
      if (profile) {
        setBio(profile.bio || "");
        setUsername(profile.username || user.fullName || "");
      } else {
        // まだプロフィールがない場合は初期値をセット
        setUsername(user.fullName || "");
      }

      // 2. 自分の投稿を取得
      const { data: posts } = await supabase
        .from("posts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      
      if (posts) setMyPosts(posts);
    };

    fetchProfileAndPosts();
  }, [user]);

  // 保存ボタンを押した時の処理
  const handleSave = async () => {
    const { error } = await supabase
      .from("profiles")
      .upsert({ 
        id: user?.id, 
        username: username, 
        bio: bio, 
        updated_at: new Date() 
      });

    if (error) {
      alert("エラーが発生したよ: " + error.message);
    } else {
      setIsEditing(false);
      // 成功したらページを軽く更新して反映（またはstateで管理）
    }
  };

  if (!isLoaded) return null;
  if (!user) return <div className="text-white text-center mt-20">ログインが必要です</div>;

  return (
    <div className="flex justify-center min-h-screen bg-black text-white">
      <div className="flex w-full max-w-[1300px] justify-start">
        
        <Sidebar />

        <main className="flex-1 max-w-2xl border-r border-gray-800 bg-black min-h-screen">
          {/* ヘッダー */}
          <div className="sticky top-0 bg-black/80 backdrop-blur-md border-b border-gray-800 p-4 flex items-center gap-6 z-10">
            <Link href="/" className="hover:bg-white/10 p-2 rounded-full transition">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-xl font-bold tracking-tight">{username || user.fullName}</h1>
              <p className="text-xs text-gray-500">{myPosts.length} パルス</p>
            </div>
          </div>

          {/* プロフィールヘッダー */}
          <div className="relative">
            <div className="h-32 bg-zinc-800 w-full" />
            <div className="absolute -bottom-12 left-4 flex justify-between items-end w-[calc(100%-2rem)]">
              <img 
                src={user.imageUrl} 
                alt="Profile" 
                className="w-24 h-24 rounded-full border-4 border-black bg-black"
              />
              <button 
                onClick={() => setIsEditing(true)}
                className="bg-black border border-gray-600 px-4 py-1.5 rounded-full font-bold text-sm hover:bg-white/10 transition mb-1"
              >
                プロフィールを編集
              </button>
            </div>
          </div>

          <div className="mt-16 px-4 pb-4 border-b border-gray-800">
            <h2 className="text-2xl font-black">{username || user.fullName}</h2>
            <p className="text-gray-500">@{user.username || user.id.slice(0, 8)}</p>
            <p className="mt-3 text-sm text-gray-300 whitespace-pre-wrap">
              {bio || "自己紹介を書いてみよう！"}
            </p>
          </div>

          {/* 編集用モーダル */}
          {isEditing && (
            <div className="fixed inset-0 bg-white/10 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-black border border-gray-800 w-full max-w-md rounded-2xl p-6 shadow-2xl">
                <h2 className="text-xl font-bold mb-4">プロフィールを編集</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-gray-500 font-bold uppercase">名前</label>
                    <input 
                      type="text" 
                      value={username} 
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-black border border-gray-800 rounded-lg p-2 mt-1 focus:border-blue-500 outline-none text-white"
                      placeholder="表示名を入力..."
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 font-bold uppercase">自己紹介</label>
                    <textarea 
                      value={bio} 
                      onChange={(e) => setBio(e.target.value)}
                      className="w-full bg-black border border-gray-800 rounded-lg p-2 mt-1 h-32 focus:border-blue-500 outline-none text-white resize-none"
                      placeholder="自己紹介を入力..."
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition">キャンセル</button>
                  <button onClick={handleSave} className="bg-white text-black px-6 py-2 rounded-full font-bold text-sm hover:bg-gray-200 transition">保存</button>
                </div>
              </div>
            </div>
          )}

          {/* 投稿一覧 */}
          <div className="divide-y divide-gray-800">
            {myPosts.map((post) => (
              <article key={post.id} className="p-6 hover:bg-white/[0.02] transition-colors group">
                <h2 className="text-xl font-bold text-white mb-2">{post.title}</h2>
                <p className="text-gray-400 leading-relaxed mb-4">{post.content}</p>
                {post.image_url && (
                  <div className="rounded-2xl border border-gray-800 overflow-hidden mb-4">
                    <img src={post.image_url} alt="Post" className="w-full h-auto" />
                  </div>
                )}
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock size={12} />
                  <time>{new Date(post.created_at).toLocaleDateString('ja-JP')}</time>
                </div>
              </article>
            ))}
          </div>
        </main>

        <div className="hidden xl:block w-80 p-4"></div>
      </div>
    </div>
  );
}
