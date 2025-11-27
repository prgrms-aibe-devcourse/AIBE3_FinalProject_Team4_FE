'use client';

import type { BlogFormValues, BlogVisibility } from '@/src/types/blog';
import { useState } from 'react';
import { BlogMetaForm } from '../../components/blogs/write/BlogMetaForm';
import { BlogWriteHeader } from '../../components/blogs/write/BlogWriteHeader';
import { MarkdownEditor } from '../../components/blogs/write/MarkdownEditor';

export default function NewBlogPage() {
  const [form, setForm] = useState<BlogFormValues>({
    title: '',
    contentMarkdown: '',
    tags: [],
    visibility: 'PUBLIC',
  });
  const [isPublishing, setIsPublishing] = useState(false);

  const update = <K extends keyof BlogFormValues>(key: K, value: BlogFormValues[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveDraft = async () => {
    // TODO: 임시저장 API 연동
    console.log('draft save', form);
  };

  const handlePublish = async () => {
    if (!form.title.trim()) {
      alert('제목을 입력해 주세요.');
      return;
    }
    if (!form.contentMarkdown.trim()) {
      alert('내용을 입력해 주세요.');
      return;
    }

    setIsPublishing(true);
    try {
      // TODO: 백엔드에 POST /api/v1/blogs 같은 API 연동
      console.log('publish', form);
      // 성공 시 라우팅
      // router.push(/blogs/${id});
    } catch (e) {
      console.error(e);
      alert('발행 중 오류가 발생했습니다.');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <BlogWriteHeader
        onSaveDraft={handleSaveDraft}
        onPublish={handlePublish}
        isPublishing={isPublishing}
      />

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-4 px-4 py-4">
        <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
          <BlogMetaForm
            title={form.title}
            onTitleChange={(v) => update('title', v)}
            tags={form.tags}
            onTagsChange={(tags) => update('tags', tags)}
            visibility={form.visibility}
            onVisibilityChange={(v: BlogVisibility) => update('visibility', v)}
          />
        </section>

        <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
          <MarkdownEditor
            value={form.contentMarkdown}
            onChange={(v) => update('contentMarkdown', v)}
            placeholder="마크다운으로 블로그 내용을 작성해 주세요."
          />
        </section>
      </main>
    </div>
  );
}
