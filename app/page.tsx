"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useUser, UserButton } from "@clerk/nextjs";
import { Clock } from "lucide-react";
import Sidebar from "./components/Sidebar";
import PostForm from "./components/PostForm";
import LandingPage from "./components/LandingPage";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Home() {
  const { user, isLoaded } = useUser();
  const [posts, setPosts] = useState<any[]>([]);

  // 💡 エラーを防ぐために、結合(Join)を「Left Join」として明示的に扱う書き方に変えたよ
  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from("posts")
      .select(`
        *,
        profiles!left (
          username
        )
      `) // !left を付けることで、プロフィールが無くても投稿は出す設定になるよ
      .order("created_at", { ascending: false });
    
    if (error) {
      console.error("エラー詳細:", error);
      // もし結合でコケたら、結合なしでリトライする安全装置
      const { data: simpleData } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false });
      if (simpleData) setPosts(simpleData);
    } else if (data) {
      setPosts(data);
    }
  };

  useEffect(() => {
    if (isLoaded && user) {
      fetchPosts();
    }
  }, [isLoaded, user]);

  const handleNewPost = () => {
    fetchPosts(); // リロードなしで最新の投稿を反映！
  };

  if (!isLoaded) return null;
  if (!user) return <LandingPage />;

  return (
    <div className="flex justify-center min-h-screen bg-black text-white">
      <div className="flex w-full max-w-[1300px] justify-start">
        
        <Sidebar />

        <main className="flex-1 max-w-2xl border-r border-gray-800 bg-black min-h-screen">
          <div className="sticky top-0 bg-black/80 backdrop-blur-md border-b border-gray-800 p-4 flex justify-between items-center z-10">
            <h1 className="text-xl font-bold tracking-tight">ホーム</h1>
            <div className="md:hidden">
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
          
          <PostForm onPostSuccess={handleNewPost} />

          <div className="divide-y divide-gray-800">
            {posts.length > 0 ? (
              posts.map((post) => (
                <article key={post.id} className="p-6 hover:bg-white/[0.02] transition-colors group">
                  <div className="mb-3">
                    <h2 className="text-2xl font-extrabold text-white mb-2 break-words">
                      {post.title || "無題の投稿"}
                    </h2>
                    <p className="text-gray-400 text-lg leading-relaxed break-words whitespace-pre-wrap mb-4">
                      {post.content}
                    </p>
                    
                    {post.image_url && (
                      <div className="mt-4 overflow-hidden rounded-2xl border border-gray-800">
                        <img 
                          src={post.image_url} 
                          alt="Post content" 
                          className="w-full h-auto max-h-[512px] object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 mt-4">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full" />
                      <span className="font-medium text-blue-400/80">
                        {/* 💡 どんなデータ形式で来ても名前を出すためのガードレール */}
                        @{post.profiles?.username || post.user_id?.slice(0, 8)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 opacity-60">
                      <Clock size={12} />
                      <time>{new Date(post.created_at).toLocaleDateString('ja-JP')}</time>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="p-20 text-center text-gray-600 italic">
                パルスを読み込み中、または投稿がありません。
              </div>
            )}
          </div>
        </main>

        <div className="hidden xl:block w-80 p-4">
          <div className="bg-gray-900/50 rounded-2xl p-4 border border-gray-800">
            <h3 className="text-lg font-bold mb-4">いまどうしてる？</h3>
            <p className="text-sm text-gray-500 italic">Coming Soon...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
