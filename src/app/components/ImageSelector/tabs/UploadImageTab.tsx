import { FileImage, UploadCloud, X } from 'lucide-react';
import { ChangeEvent } from 'react';

interface UploadTabProps {
  uploadedFile: File | null;
  uploadedFileUrl: string | null;
  selectedImage: string | null;
  originalImage: string | null;
  setSelectedImage: (url: string | null) => void;
  setCroppingImage: (url: string | null) => void;
  setOriginalImage: (url: string | null) => void;
  setUploadedFile: (file: File | null) => void;
  setUploadedFileUrl: (url: string | null) => void;
  setImageSourceType: (type: 'file' | 'url') => void;
}

export default function UploadTab({
  uploadedFile,
  uploadedFileUrl,
  selectedImage,
  originalImage,
  setSelectedImage,
  setCroppingImage,
  setOriginalImage,
  setUploadedFile,
  setUploadedFileUrl,
  setImageSourceType,
}: UploadTabProps) {
  const handleUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setSelectedImage(url);
    setCroppingImage(url);
    setOriginalImage(url);
    setUploadedFile(file);
    setUploadedFileUrl(url);
    setImageSourceType('file');
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const url = URL.createObjectURL(file);
    setSelectedImage(url);
    setCroppingImage(url);
    setOriginalImage(url);
    setUploadedFile(file);
    setUploadedFileUrl(url);
    setImageSourceType('file');
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleFileClick = () => {
    if (!uploadedFile || !uploadedFileUrl) return;

    // 현재 선택된 이미지가 업로드된 파일인지 확인 (uploadedFileUrl로 비교)
    const isCurrentlySelected = originalImage === uploadedFileUrl;

    // 선택되지 않은 파일을 클릭하면 선택
    if (!isCurrentlySelected) {
      setSelectedImage(uploadedFileUrl);
      setCroppingImage(uploadedFileUrl);
      setOriginalImage(uploadedFileUrl);
      setImageSourceType('file');
    }
  };

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation();

    // 현재 선택된 이미지가 삭제하려는 파일인지 확인 (uploadedFileUrl로 비교)
    const isCurrentlySelected = originalImage === uploadedFileUrl;

    // 파일 삭제
    setUploadedFile(null);
    setUploadedFileUrl(null);

    // 선택된 이미지였다면 미리보기도 제거
    if (isCurrentlySelected) {
      setSelectedImage(null);
      setCroppingImage(null);
      setOriginalImage(null);
    }
  };

  // 현재 파일이 선택되어 있는지 확인 (uploadedFileUrl로 비교)
  const isSelected = uploadedFile && originalImage === uploadedFileUrl;

  return (
    <div>
      {!uploadedFile ? (
        // 파일이 없을 때: 업로드 영역 표시
        <div
          className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl h-56 cursor-pointer hover:bg-slate-50 transition"
          onClick={() => document.getElementById('thumbnail-upload')?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <UploadCloud className="w-10 h-10 mb-2 text-slate-600" />
          <p className="text-xs text-slate-600">이미지를 끌어오거나 클릭하여 업로드하세요</p>
        </div>
      ) : (
        // 파일이 있을 때: 파일 정보 표시
        <div
          className={`flex items-center justify-between border-2 rounded-xl h-56 p-6 cursor-pointer transition ${
            isSelected
              ? 'border-blue-500 bg-blue-50'
              : 'border-dashed border-gray-300 hover:bg-slate-50'
          }`}
          onClick={handleFileClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <FileImage className="w-10 h-10 text-slate-600 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800 truncate">{uploadedFile.name}</p>
              <p className="text-xs text-slate-500 mt-1">
                {(uploadedFile.size / 1024).toFixed(2)} KB
              </p>
            </div>
          </div>
          <button
            onClick={handleRemoveFile}
            className="p-2 hover:bg-red-100 rounded-full transition flex-shrink-0"
            aria-label="파일 삭제"
          >
            <X className="w-5 h-5 text-red-500" />
          </button>
        </div>
      )}

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
