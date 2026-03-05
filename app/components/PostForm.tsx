"use client";
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useAuth } from "@clerk/nextjs";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// プロップスとして onPostSuccess という関数を受け取るようにするよ
export default function PostForm({ onPostSuccess }: { onPostSuccess: (newPost: any) => void }) {
  const [content, setContent] = useState("");
  const { userId } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content || !userId) return;

    // 投稿して、その結果（新しいデータ）を返してもらう
    const { data, error } = await supabase
      .from("posts")
      .insert([{ content, user_id: userId }])
      .select() // これを付けると、今入れたデータが戻ってくる！
      .single();

    if (error) {
      alert("失敗しちゃった...");
    } else {
      setContent("");
      // リロードの代わりに、親にデータを渡す！
      onPostSuccess(data);
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
          className="bg-blue-500 text-white px-6 py-2 rounded-full font-bold"
        >
          Post
        </button>
      </div>
    </form>
  );
}
