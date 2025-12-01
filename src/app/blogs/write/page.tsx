'use client';
import { fetchBlogDetail } from '@/src/api/blogDetail';
import { createDraft, deleteBlog, fetchDrafts, updateBlog } from '@/src/api/blogWrite';
import type {
  BlogDraftDto,
  BlogFileDto,
  BlogFormValues,
  BlogStatus,
  BlogVisibility,
  BlogWriteReqBody,
} from '@/src/types/blog';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import AiChatPanel from '../../components/ai/chat/AiChatPanel';
import { BlogMetaForm } from '../../components/blogs/write/BlogMetaForm';
import { BlogWriteHeader } from '../../components/blogs/write/BlogWriteHeader';
import { DraftListModal } from '../../components/blogs/write/DraftListModal';
import { MarkdownEditor } from '../../components/blogs/write/MarkdownEditor';
// import { isUnauthorizedError } from '@/src/api/ApiError';
import ImageSelector from '../../components/ImageSelector/ImageSelector';
import { useChatPanelSlot } from '../Slot';

export default function NewBlogPage() {
  const router = useRouter();

  const [form, setForm] = useState<BlogFormValues>({
    title: '',
    contentMarkdown: '',
    tags: [],
    status: 'DRAFT',
    visibility: 'PRIVATE',
  });

  const [blogId, setBlogId] = useState<number | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isDraftModalOpen, setIsDraftModalOpen] = useState(false);
  const [drafts, setDrafts] = useState<BlogDraftDto[]>([]);
  const [isLoadingDrafts, setIsLoadingDrafts] = useState(false);
  const [blogImages, setBlogImages] = useState<BlogFileDto[]>([]);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const { setChatPanel } = useChatPanelSlot();

  // AI 채팅 패널
  useEffect(() => {
    setChatPanel(<AiChatPanel title={form.title} content={form.contentMarkdown} />);
    return () => setChatPanel(null); // 페이지 벗어나면 제거
  }, [form.title, form.contentMarkdown, setChatPanel]);

  const buildReqBody = (status: BlogStatus): BlogWriteReqBody => ({
    title: form.title.trim(),
    content: form.contentMarkdown.trim(),
    status,
    hashtagNames: form.tags,
  });
  const update = <K extends keyof BlogFormValues>(key: K, value: BlogFormValues[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    if (!blogId) return;
    if (isPublishing) return;
    if (form.status !== 'DRAFT') return;
    if (!form.title && !form.contentMarkdown && form.tags.length === 0) return;
    const handler = setTimeout(async () => {
      try {
        await updateBlog(blogId, buildReqBody('DRAFT'));
      } catch (e) {
        console.error(e);
      } finally {
      }
    }, 1500);

    return () => clearTimeout(handler);
  }, [blogId, form.title, form.contentMarkdown, form.tags, form.status, isPublishing]);

  const ensureDraft = async (): Promise<number> => {
    // 이미 draft 있으면 그대로 사용
    if (blogId) return blogId;

    // 없으면 새로 생성
    const dto = await createDraft(buildReqBody('DRAFT'));
    if (!dto || dto.id == null) {
      throw new Error('임시저장 생성에 실패했습니다.');
    }
    setBlogId(dto.id);
    return dto.id;
  };

  const handleSaveDraft = async () => {
    try {
      const id = await ensureDraft(); // 없으면 새 draft 생성, 있으면 그거 사용
      const dto = await updateBlog(id, buildReqBody('DRAFT'));

      setForm((prev) => ({
        ...prev,
        status: 'DRAFT',
        title: dto.title ?? prev.title,
        contentMarkdown: dto.content ?? prev.contentMarkdown,
        tags: dto.hashtagNames ?? prev.tags,
      }));

      alert('임시저장 되었습니다.');
    } catch (e) {
      // if (isUnauthorizedError(e)) {
      //   alert('로그인이 필요합니다.');
      //   router.push(`/login?next=/blogs/write`);
      //   return;
      // }
      console.error(e);
      alert('임시저장 중 오류가 발생했습니다.');
    }
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
      const id = await ensureDraft();
      const dto = await updateBlog(id, buildReqBody('PUBLISHED'));
      router.push(`/blogs/${dto.id}`);
    } catch (e) {
      // if (isUnauthorizedError(e)) {
      //   alert('로그인이 필요합니다.');
      //   router.push(`/login?next=/blogs/write`);
      //   return;
      // }
      console.error(e);
      alert('발행 중 오류가 발생했습니다.');
    } finally {
      setIsPublishing(false);
    }
  };
  // 임시저장 목록 관련 로직
  const openDraftModal = async () => {
    setIsDraftModalOpen(true);
    // if (drafts.length > 0) return; // 이미 로딩된 경우 재요청 스킵
    setIsLoadingDrafts(true);
    try {
      const list = await fetchDrafts();
      setDrafts(list);
    } catch (e) {
      console.error(e);
      alert('임시저장 목록을 불러오지 못했습니다.');
    } finally {
      setIsLoadingDrafts(false);
    }
  };

  const handleSelectDraft = async (draft: BlogDraftDto) => {
    try {
      const detail = await fetchBlogDetail(draft.id);

      setBlogId(detail.id);
      setForm((prev) => ({
        ...prev,
        title: detail.title ?? '',
        contentMarkdown: detail.content ?? '',
        tags: detail.hashtagNames ?? [],
        status: (detail.status as BlogStatus) ?? 'DRAFT',
      }));
      setBlogImages(detail.images ?? []);
      setThumbnailUrl(detail.thumbnailUrl ?? null);

      setIsDraftModalOpen(false);
    } catch (e) {
      console.error(e);
      alert('임시저장 글을 불러오지 못했습니다.');
    }
  };

  const handleDeleteDraft = async (draftId: number) => {
    if (!confirm('이 임시저장을 삭제할까요?')) return;
    try {
      await deleteBlog(draftId);
      setDrafts((prev) => prev.filter((d) => d.id !== draftId));
      if (blogId === draftId) {
        setBlogId(null);
        setForm({
          title: '',
          contentMarkdown: '',
          tags: [],
          status: 'DRAFT',
          visibility: 'PRIVATE',
        });
      }
    } catch (e) {
      console.error(e);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <BlogWriteHeader
        onSaveDraft={handleSaveDraft}
        onPublish={handlePublish}
        isPublishing={isPublishing}
        onOpenDrafts={openDraftModal}
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

        <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
          <ImageSelector blogId={blogId} blogImages={blogImages} />
        </section>
      </main>
      <DraftListModal
        isOpen={isDraftModalOpen}
        onClose={() => setIsDraftModalOpen(false)}
        drafts={drafts}
        isLoading={isLoadingDrafts}
        onSelectDraft={handleSelectDraft}
        onDeleteDraft={handleDeleteDraft}
      />
    </div>
  );
}
