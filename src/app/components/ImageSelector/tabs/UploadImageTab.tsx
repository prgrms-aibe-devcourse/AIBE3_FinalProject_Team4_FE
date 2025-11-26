import { UploadCloud } from 'lucide-react';
import { ChangeEvent } from 'react';

export default function UploadTab({
  setSelectedImage,
  setCroppingImage,
  setOriginalImage,
  setUploadedFile,
  setImageSourceType,
}: any) {
  const handleUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setSelectedImage(url);
    setCroppingImage(url);
    setOriginalImage(url);
    setUploadedFile(file);
    setImageSourceType('file');
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const url = URL.createObjectURL(file);
    setSelectedImage(url);
    setCroppingImage(url);
    setOriginalImage(url);
    setUploadedFile(file);
    setImageSourceType('file');
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div>
      <label
        htmlFor="thumbnail-upload"
        className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl h-56 cursor-pointer hover:bg-slate-50 transition"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <UploadCloud className="w-10 h-10 mb-2 text-slate-600" />
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
