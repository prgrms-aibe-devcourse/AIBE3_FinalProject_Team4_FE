import { Check, FileImage, UploadCloud, X } from 'lucide-react';
import { ChangeEvent, useEffect, useState } from 'react';

interface UploadTabProps {
  uploadedFile: File | null;
  uploadedFileUrl: string | null;
  originalImage: string | null;
  onSelect: (url: string | null) => void;
  setUploadedFile: (file: File | null) => void;
  setUploadedFileUrl: (url: string | null) => void;
  setImageSourceType: (type: 'file' | 'url') => void;
  showToast?: (message: string, type: 'success' | 'error' | 'warning') => void;
}

export default function UploadTab({
  uploadedFile,
  uploadedFileUrl,
  originalImage,
  onSelect,
  setUploadedFile,
  setUploadedFileUrl,
  setImageSourceType,
  showToast,
}: UploadTabProps) {
  const [isDragging, setIsDragging] = useState(false);

  // 해당 레이아웃 전체 드래그&드롭 방지
  useEffect(() => {
    const preventDefaults = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    window.addEventListener('dragover', preventDefaults);
    window.addEventListener('drop', preventDefaults);

    return () => {
      window.removeEventListener('dragover', preventDefaults);
      window.removeEventListener('drop', preventDefaults);
    };
  }, []);

  // 이미지 파일 유효성 검사
  function validateImageFile(file: File): boolean {
    if (!file.type.startsWith('image/')) {
      showToast?.('이미지 파일만 업로드할 수 있습니다.', 'warning');
      return false;
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      showToast?.('10MB 이하의 이미지만 업로드할 수 있습니다.', 'warning');
      return false;
    }

    const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!ext || !allowedExtensions.includes(ext)) {
      showToast?.('JPG, JPEG, PNG, WEBP 형식의 파일만 업로드할 수 있습니다.', 'warning');
      return false;
    }
    return true;
  }

  // 파일 적용 처리
  const applyFile = (file: File) => {
    if (!validateImageFile(file)) return;

    const url = URL.createObjectURL(file);

    setImageSourceType('file');
    setUploadedFile(file);
    setUploadedFileUrl(url);

    onSelect(url);
  };

  const handleUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    applyFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    applyFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  // 업로드된 파일이 현재 선택된 이미지인지 확인
  const isUploadedFileSelected = () => !!uploadedFileUrl && originalImage === uploadedFileUrl;

  const handleFileClick = () => {
    if (!uploadedFile) return;

    // 이미 선택된 파일이면 선택 해제
    if (isUploadedFileSelected()) {
      onSelect(null);
      return;
    }

    // 선택되지 않은 파일을 클릭하면 선택
    setImageSourceType('file');
    onSelect(uploadedFileUrl);
  };

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation();

    // 현재 선택된 이미지가 삭제하려는 파일인지 확인 (uploadedFileUrl로 비교)
    const wasSelected = isUploadedFileSelected();

    // 파일 삭제
    setUploadedFile(null);
    setUploadedFileUrl(null);

    // 선택된 이미지였다면 미리보기도 제거
    if (wasSelected) {
      onSelect(null);
    }
  };

  // 현재 파일이 선택되어 있는지 확인 (uploadedFileUrl로 비교)
  const isSelected = !!uploadedFile && isUploadedFileSelected();

  return (
    <div>
      {!uploadedFile ? (
        // 파일이 없을 때: 업로드 영역 표시
        <div
          className={`
            flex flex-col items-center justify-center
            border-2 border-dashed rounded-xl h-[141px]
            cursor-pointer transition
            hover:bg-slate-50
            ${isDragging ? 'border-main bg-main/10 ring-2 ring-main/20' : 'border-slate-200'}
          `}
          onClick={() => document.getElementById('thumbnail-upload')?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
        >
          <UploadCloud className="w-10 h-10 mb-3 text-slate-400" />
          <p className="text-xs text-slate-600">이미지를 끌어오거나 클릭하여 업로드하세요</p>
          <p className="mt-1 text-[11px] text-slate-400 text-center">
            JPG / JPEG / PNG / WEBP 형식의 이미지 파일을 업로드할 수 있어요. (최대 10MB)
          </p>
        </div>
      ) : (
        // 파일이 있을 때: 카드형 정보 박스
        <div
          className={`
            relative flex items-center gap-4 rounded-xl border bg-white/80 px-5 py-4
            backdrop-blur-sm transition cursor-pointer hover:bg-slate-50/60 hover:shadow-sm
            ${isDragging ? 'border-main bg-main/10 ring-2 ring-main/20' : ''}
            ${isSelected ? 'border-main border-[2px] bg-white shadow-sm' : 'border-slate-200'}
          `}
          onClick={handleFileClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
        >
          {/* 선택/삭제 아이콘 */}
          {isSelected ? (
            <div className="absolute top-2.5 right-2.5 h-6 w-6 rounded-full bg-main flex items-center justify-center shadow-sm">
              <Check className="w-4 h-4 text-white" />
            </div>
          ) : (
            <button
              onClick={handleRemoveFile}
              className="
                absolute top-2.5 right-2.5
                inline-flex items-center justify-center
                h-6 w-6 rounded-full
                text-slate-400 hover:text-rose-500
                hover:bg-rose-50    
                transition
              "
              aria-label="파일 삭제"
              tabIndex={0}
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* 파일 아이콘 */}
          <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-slate-50 border border-slate-100 flex-shrink-0">
            <FileImage className="w-6 h-6 text-slate-400" />
          </div>

          {/* 파일 정보 */}
          <div className="flex-1 min-w-0 pr-6">
            {uploadedFileUrl ? (
              <a
                href={uploadedFileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-slate-900 truncate underline hover:text-main transition"
                onClick={(e) => e.stopPropagation()}
              >
                {uploadedFile.name}
              </a>
            ) : (
              <div className="text-xs text-slate-900 truncate">{uploadedFile.name}</div>
            )}
            <div className="mt-0.5 text-[11px] text-slate-500">
              {(uploadedFile.size / 1024).toFixed(2)} KB
            </div>
          </div>
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
