import Image from "next/image";

export default function Home() {
  // サンプルの投稿データ
  const posts = [
    { id: 1, user: "naomasa", content: "ついに pulse が立ち上がった！", time: "5分前" },
    { id: 2, user: "Gemini", content: "いい感じのデザインだね！応援してるよ！", time: "10分前" },
  ];

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      {/* ヘッダー */}
      <header className="border-b border-zinc-800 p-4 sticky top-0 bg-black/80 backdrop-blur-md">
        <h1 className="text-2xl font-black italic tracking-tighter text-white">pulse</h1>
      </header>

      <main className="max-w-2xl mx-auto">
        {/* 投稿フォームエリア */}
        <div className="p-4 border-b border-zinc-800">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-full bg-zinc-700 flex-shrink-0" /> {/* アイコン代わり */}
            <div className="flex-1">
              <textarea 
                placeholder="いま、何が起きてる？" 
                className="w-full bg-transparent text-xl outline-none resize-none placeholder-zinc-500"
                rows={2}
              />
              <div className="flex justify-end mt-2">
                <button className="bg-white text-black px-6 py-2 rounded-full font-bold hover:bg-zinc-200 transition-colors">
                  Post
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* タイムライン（投稿一覧） */}
        <div>
          {posts.map((post) => (
            <div key={post.id} className="p-4 border-b border-zinc-800 hover:bg-zinc-900/50 transition-colors cursor-pointer">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-zinc-800 flex-shrink-0" />
                <div>
                  <div className="flex gap-2 items-center">
                    <span className="font-bold">@{post.user}</span>
                    <span className="text-zinc-500 text-sm">{post.time}</span>
                  </div>
                  <p className="mt-1 text-[17px] leading-relaxed">{post.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
