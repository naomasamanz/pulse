"use client";
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useAuth } from "@clerk/nextjs";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// 型をしっかり定義して、TypeScriptを安心させるよ
interface PostFormProps {
  onPostSuccess: (newPost: any) => void;
}

export default function PostForm({ onPostSuccess }: PostFormProps) {
  const [content, setContent] = useState("");
  const { userId } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content || !userId) return;

    // 投稿して、結果を受け取る
    const { data, error } = await supabase
      .from("posts")
      .insert([{ content, user_id: userId }])
      .select()
      .single();

    if (error) {
      console.error(error);
      alert("投稿に失敗しました");
    } else if (data) {
      setContent("");
      // ここで親（page.tsx）の関数を呼ぶ！
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
          disabled={!content}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-full font-bold disabled:opacity-50 transition"
        >
          投稿する
        </button>
      </div>
    </form>
  );
}
