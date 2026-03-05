"use client";
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useAuth } from "@clerk/nextjs";
import { ImagePlus, X } from "lucide-react"; // アイコン追加

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function PostForm({ onPostSuccess }: { onPostSuccess: (post: any) => void }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { userId } = useAuth();

  // 画像を選択したときの処理
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file)); // プレビュー表示
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content || !userId || isUploading) return;
    setIsUploading(true);

    let imageUrl = null;

    // 画像があればアップロード
    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const { data, error } = await supabase.storage
        .from('post_images')
        .upload(fileName, imageFile);

      if (error) {
        alert("画像のアップロードに失敗しました");
      } else {
        // 公開URLを取得
        const { data: { publicUrl } } = supabase.storage
          .from('post_images')
          .getPublicUrl(fileName);
        imageUrl = publicUrl;
      }
    }

    const { data, error } = await supabase
      .from("posts")
      .insert([{ title, content, user_id: userId, image_url: imageUrl }])
      .select()
      .single();

    if (data) {
      setTitle("");
      setContent("");
      setImageFile(null);
      setPreviewUrl(null);
      onPostSuccess(data);
    }
    setIsUploading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-b border-gray-800 bg-black">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="タイトル"
        className="w-full bg-transparent text-white font-bold text-xl outline-none mb-2"
      />
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="いまどうしてる？"
        className="w-full bg-transparent text-white text-lg outline-none resize-none"
      />

      {/* 画像プレビュー */}
      {previewUrl && (
        <div className="relative mt-2 mb-4">
          <img src={previewUrl} alt="Preview" className="rounded-2xl max-h-80 w-full object-cover border border-gray-800" />
          <button 
            onClick={() => { setImageFile(null); setPreviewUrl(null); }}
            className="absolute top-2 right-2 bg-black/50 p-1 rounded-full hover:bg-black"
          >
            <X size={20} />
          </button>
        </div>
      )}

      <div className="flex justify-between items-center mt-4">
        <label className="cursor-pointer text-blue-500 hover:bg-blue-500/10 p-2 rounded-full transition">
          <ImagePlus size={24} />
          <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
        </label>
        <button 
          type="submit" 
          disabled={!title || !content || isUploading}
          className="bg-blue-500 text-white px-6 py-2 rounded-full font-bold disabled:opacity-50"
        >
          {isUploading ? "送信中..." : "投稿する"}
        </button>
      </div>
    </form>
  );
}
