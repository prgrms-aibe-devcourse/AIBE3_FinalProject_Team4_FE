import ImageSelector from '@/components/ImageSelector/ImageSelector';

export default function BlogForm() {
  return (
    <>
      {/* ... */}

      {/* 섬네일용 이미지 선택 */}
      <main className="w-full min-h-screen bg-gray-50 p-6">
        <h1 className="text-2xl font-bold mb-6">섬네일 이미지 선택</h1>
        <p className="text-sm text-slate-500 mb-6">
          블로그의 내용을 알려주는 이미지를 선택하거나 업로드하세요
        </p>
        <ImageSelector />
      </main>
    </>
  );
}
