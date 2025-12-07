import AiGeneration from '@/src/app/components/ai/generate/AiGeneration';
import { SearchField } from '@/src/app/components/common/SearchField';

interface FreeImageSearchWithAiProps {
  keyword: string;
  setKeyword: (value: string) => void;
  onSearchKeywordChange: (keyword: string) => void;
  blogContent?: string;
}

export default function FreeImageSearchWithAi({
  keyword,
  setKeyword,
  onSearchKeywordChange,
  blogContent,
}: FreeImageSearchWithAiProps) {
  const onSearch = () => {
    if (keyword.trim()) {
      onSearchKeywordChange(keyword.trim());
    }
  };

  return (
    <div className="group/ai mb-4 flex items-center gap-4">
      <SearchField
        id="image-search"
        value={keyword}
        onChange={setKeyword}
        onSearch={onSearch}
        placeholder="이미지 검색어를 입력하세요"
      />
      {/* AI 키워드 생성기 */}
      <AiGeneration
        mode="keyword"
        contentType="blog"
        content={blogContent}
        onApply={(value) => {
          onSearchKeywordChange(value);
        }}
      />
    </div>
  );
}
