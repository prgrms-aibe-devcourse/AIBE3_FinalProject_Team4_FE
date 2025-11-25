'use client';

import { useCallback } from 'react';

export default function UploadPanel() {
  const handleUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    console.log('uploaded:', file);
  }, []);

  return (
    <div>
      <label
        htmlFor="thumbnail-upload"
        className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl h-56 cursor-pointer hover:bg-slate-50 transition"
      >
        <span className="text-4xl mb-2">📄</span>
        <p className="text-sm text-slate-600">이미지를 끌어오거나 클릭하여 업로드하세요</p>
      </label>

      <input
        id="thumbnail-upload"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleUpload}
      />
    </div>
  );
}
