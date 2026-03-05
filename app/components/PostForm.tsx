"use client";
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useAuth } from "@clerk/nextjs";

// Vercelに設定した鍵を読み込むよ
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function PostForm() {
  const [content, setContent] = useState("");
  const { userId } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content || !userId) return;

    // Supabaseのpostsテーブルにデータを投げ込む！
    const { error } = await supabase
      .from("posts")
      .insert([{ content, user_id: userId }]);

    if (error) {
      console.error(error);
      alert("エラーが起きたよ...");
    } else {
      setContent("");
      alert("投稿完了！画面を更新してみてね。");
      window.location.reload(); // 投稿を反映させるためにリロード
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-b border-gray-800">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="今、何してる？"
        className="w-full bg-transparent text-white p-2 outline-none resize-none text-xl"
        rows={3}
      />
      <div className="flex justify-end mt-2">
        <button 
          type="submit" 
          disabled={!content}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-full font-bold disabled:opacity-50 transition"
        >
          投稿する
        </button>
      </div>
    </form>
  );
}
