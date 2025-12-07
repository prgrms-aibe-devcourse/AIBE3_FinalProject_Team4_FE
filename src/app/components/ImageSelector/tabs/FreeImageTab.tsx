'use client';

import { useEffect, useState } from 'react';
import FreeImageSearchResults from './FreeImageSearchResults';
import FreeImageSearchWithAi from './FreeImageSearchWithAi';

interface FreeImageTabProps {
  blogContent?: string;
  selectedTab: 'upload' | 'blog' | 'unsplash' | 'pixabay';
  searchKeyword: string;
  onSearchKeywordChange: (keyword: string) => void;
  originalImageId: string | null;
  onSelect: (url: string | null, id: string | null) => void;
}

export default function FreeImageTab({
  blogContent,
  selectedTab,
  searchKeyword,
  onSearchKeywordChange,
  originalImageId,
  onSelect,
}: FreeImageTabProps) {
  // keyword: 입력값, searchKeyword: 검색값(엔터 시 반영)
  const [keyword, setKeyword] = useState(searchKeyword);

  // searchKeyword가 변경되면 keyword도 동기화
  useEffect(() => {
    setKeyword(searchKeyword);
  }, [searchKeyword]);

  return (
    <>
      <FreeImageSearchWithAi
        keyword={keyword}
        setKeyword={setKeyword}
        onSearchKeywordChange={onSearchKeywordChange}
        blogContent={blogContent}
      />

      {selectedTab === 'unsplash' && (
        <FreeImageSearchResults
          apiEndpoint="unsplash"
          searchKeyword={searchKeyword}
          originalImageId={originalImageId}
          onSelect={onSelect}
        />
      )}

      {selectedTab === 'pixabay' && (
        <FreeImageSearchResults
          apiEndpoint="pixabay"
          searchKeyword={searchKeyword}
          originalImageId={originalImageId}
          onSelect={onSelect}
        />
      )}
    </>
  );
}
