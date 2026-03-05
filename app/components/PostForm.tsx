"use client";
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useAuth } from "@clerk/nextjs";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface PostFormProps {
  onPostSuccess: (newPost: any) => void;
}

export default function PostForm({ onPostSuccess }: PostFormProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const { userId } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content || !userId) return;

    const { data, error } = await supabase
      .from("posts")
      .insert([{ title, content, user_id: userId }])
      .select()
      .single();

    if (error) {
      console.error(error);
      alert("投稿に失敗しました");
    } else if (data) {
      setTitle("");
      setContent("");
      onPostSuccess(data);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-b border-gray-800 flex flex-col gap-4 bg-black">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="タイトル"
        className="w-full bg-transparent text-white font-bold text-xl outline-none border-b border-gray-800 pb-2 focus:border-blue-500 transition"
      />
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="本文"
        className="w-full bg-transparent text-white text-lg outline-none resize-none min-h-[100px]"
      />
      <div className="flex justify-end">
        <button 
          type="submit" 
          disabled={!title || !content}
          className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-2 rounded-full font-bold disabled:opacity-50 transition-all shadow-lg active:scale-95"
        >
          投稿する
        </button>
      </div>
    </form>
  );
}
