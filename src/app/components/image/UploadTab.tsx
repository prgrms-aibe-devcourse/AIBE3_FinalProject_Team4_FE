import { ChangeEvent } from 'react';

export default function UploadTab({ setSelectedImage, setCroppingImage }: any) {
  const handleUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setSelectedImage(url);
    setCroppingImage(url);
  };

  return (
    <div className="border-2 border-dashed rounded-xl p-10 text-center cursor-pointer hover:bg-gray-50">
      <input type="file" accept="image/*" onChange={handleUpload} />
      <p className="text-gray-500 mt-4">이미지를 선택하거나 업로드하세요</p>
    </div>
  );
}
