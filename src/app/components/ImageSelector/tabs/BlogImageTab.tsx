'use client';

interface BlogImage {
  imageId: number;
  url: string;
  sortOrder: number;
  contentType: string;
}

interface BlogImageTabProps {
  images: BlogImage[];
  onSelect: (url: string) => void;
}

export default function BlogImageTab({ images, onSelect }: BlogImageTabProps) {
  if (images.length === 0) {
    return (
      <div className="flex items-center justify-center h-40">
        <p className="text-gray-500">블로그 본문에 업로드된 이미지가 아직 없습니다.</p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm text-gray-600 mb-4">블로그 본문에 사용된 이미지 {images.length}개</p>

      {/* 이미지 목록 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {images.map((image) => (
          <div
            key={image.imageId}
            onClick={() => onSelect(image.url)}
            className="relative aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition border border-gray-200"
          >
            <img
              src={image.url}
              alt={`Blog image ${image.sortOrder}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
