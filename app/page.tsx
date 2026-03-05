import { createClient } from "@supabase/supabase-js";
import PostForm from "../components/PostForm";
import { currentUser } from "@clerk/nextjs/server";
// ↓ここ！LandingPageをインポートしてね
import LandingPage from "../components/LandingPage"; 

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function Home() {
  const user = await currentUser();

  // 【重要】ログインしていなければ、Homeの内容を隠してLandingPageを出す！
  if (!user) {
    return <LandingPage />;
  }

  // ここから下は「ログインしている人だけ」が見れる世界
  const { data: posts } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10);

  return (
    <main className="max-w-2xl mx-auto border-x border-gray-800 min-h-screen bg-black text-white">
      <div className="sticky top-0 bg-black/80 backdrop-blur-md border-b border-gray-800 p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">ホーム</h1>
        {/* ここにClerkのUserButtonを置くとログアウトもできて便利だよ！ */}
      </div>

      <PostForm />

      <div className="divide-y divide-gray-800">
        {posts?.map((post) => (
          <div key={post.id} className="p-4">
            <p className="text-gray-500 text-sm">User: {post.user_id.slice(0, 8)}</p>
            <p className="text-lg">{post.content}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
