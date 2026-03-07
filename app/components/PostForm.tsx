"use client";
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useAuth } from "@clerk/nextjs";
import { ImagePlus, X } from "lucide-react";

// 通常のクライアント（読み取り用などに使用）
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export default function PostForm({ onPostSuccess }: { onPostSuccess: (post: any) => void }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { userId, getToken } = useAuth();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!title && !content) || !userId || isUploading) return;
    setIsUploading(true);

    try {
      // 1. Clerkからトークンを取得
      const token = await getToken({ template: "supabase" });
      
      if (!token) {
        throw new Error("認証トークンの取得に失敗しました。");
      }

      // 💡 ポイント：投稿専用のSupabaseクライアントを「この瞬間」だけ作る
      // これにより「Auth session missing!」エラーを確実に回避する
      const authenticatedSupabase = createClient(supabaseUrl, supabaseAnonKey, {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      });

      console.log("🚀 認証済みクライアント作成成功");

      let imageUrl = null;

      // 2. 画像アップロード
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${userId}-${Math.random()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await authenticatedSupabase.storage
          .from('post_images')
          .upload(fileName, imageFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = authenticatedSupabase.storage
          .from('post_images')
          .getPublicUrl(fileName);
        imageUrl = publicUrl;
      }

      // 3. データベースに保存（認証済みクライアントを使用）
      const { data, error: dbError } = await authenticatedSupabase
        .from("posts")
        .insert([{ 
          title, 
          content, 
          user_id: userId, 
          image_url: imageUrl 
        }])
        .select()
        .single();

      if (dbError) throw dbError;

      if (data) {
        setTitle("");
        setContent("");
        setImageFile(null);
        setPreviewUrl(null);
        onPostSuccess(data);
        console.log("✅ 投稿成功！");
      }
    } catch (error: any) {
      console.error("⚠️ 詳細エラー:", error);
      alert(`エラー: ${error.message || "詳細はコンソールを確認してください"}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-b border-gray-800 bg-black">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="タイトル"
        className="w-full bg-transparent text-white font-extrabold text-2xl outline-none mb-1 placeholder:text-gray-700"
      />
      
      <div className="h-[1px] w-full bg-gray-900 my-3" />

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="本文"
        className="w-full bg-transparent text-white text-lg outline-none resize-none min-h-[100px] placeholder:text-gray-600"
      />

      {previewUrl && (
        <div className="relative mt-2 mb-4">
          <img src={previewUrl} alt="Preview" className="rounded-2xl max-h-80 w-full object-cover border border-gray-800" />
          <button 
            type="button"
            onClick={() => { setImageFile(null); setPreviewUrl(null); }}
            className="absolute top-2 right-2 bg-black/50 p-1 rounded-full hover:bg-black text-white"
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
          disabled={(!title && !content) || isUploading}
          className="bg-blue-500 text-white px-6 py-2 rounded-full font-bold disabled:opacity-50 hover:bg-blue-600 transition"
        >
          {isUploading ? "送信中..." : "投稿する"}
        </button>
      </div>
    </form>
  );
}
