'use client';

import { Search } from 'lucide-react';

type SearchFieldProps = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  onSearch?: () => void;
  placeholder?: string;
  className?: string;
};

export function SearchField({
  id = 'search',
  value,
  onChange,
  onSearch,
  placeholder = '검색어를 입력하세요',
  className = '',
}: SearchFieldProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch();
    }
  };

  return (
    <div className={`flex-1 ${className}`}>
      <label className="sr-only" htmlFor={id}>
        {placeholder}
      </label>
      <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 focus-within:border-[#2979FF] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#2979FF]/20">
        <Search size={16} className="text-slate-400" aria-hidden />
        <input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
        />
      </div>
    </div>
  );
}
