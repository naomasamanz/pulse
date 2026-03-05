import { createClient } from "@supabase/supabase-js";
import PostForm from "@/components/PostForm";
import { currentUser } from "@clerk/nextjs/server";

// Supabaseクライアントの準備
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function Home() {
  // 1. Clerkから現在のユーザー情報を取得
  const user = await currentUser();

  // 2. Supabaseから最新の投稿を10件取得
  const { data: posts, error } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    console.error("データ取得エラー:", error);
  }

  return (
    <main className="max-w-2xl mx-auto border-x border-gray-800 min-h-screen bg-black text-white">
      {/* ヘッダー */}
      <div className="sticky top-0 bg-black/80 backdrop-blur-md border-b border-gray-800 p-4">
        <h1 className="text-xl font-bold">ホーム</h1>
      </div>

      {/* ログインしていれば投稿フォームを表示 */}
      {user ? (
        <PostForm />
      ) : (
        <div className="p-8 text-center border-b border-gray-800">
          <p className="text-gray-500">ログインすると投稿できるよ！</p>
        </div>
      )}

      {/* 投稿一覧 */}
      <div className="divide-y divide-gray-800">
        {posts && posts.length > 0 ? (
          posts.map((post) => (
            <div key={post.id} className="p-4 hover:bg-white/5 transition">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-gray-400">User: {post.user_id.slice(0, 8)}...</span>
                <span className="text-xs text-gray-600">
                  {new Date(post.created_at).toLocaleString('ja-JP')}
                </span>
              </div>
              <p className="text-lg break-words">{post.content}</p>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-gray-500">
            まだ投稿がないよ。最初のつぶやきを投げよう！
          </div>
        )}
      </div>
    </main>
  );
}
