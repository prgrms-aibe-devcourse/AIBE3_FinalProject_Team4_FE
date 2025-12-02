'use client';
import { fetchBlogDetail } from '@/src/api/blogDetail';
import { uploadBlogImage } from '@/src/api/blogImageApi';
import { createDraft, deleteBlog, fetchDrafts, updateBlog } from '@/src/api/blogWrite';
import apiClient from '@/src/api/clientForRs';
import type {
  BlogDraftDto,
  BlogFileDto,
  BlogFormValues,
  BlogMediaUploadResponse,
  BlogStatus,
  BlogVisibility,
  BlogWriteReqBody,
  RsData,
} from '@/src/types/blog';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import AiChatPanel from '../../components/ai/chat/AiChatPanel';
import { BlogMetaForm } from '../../components/blogs/write/BlogMetaForm';
import { BlogWriteHeader } from '../../components/blogs/write/BlogWriteHeader';
import { DraftListModal } from '../../components/blogs/write/DraftListModal';
import { MarkdownEditor } from '../../components/blogs/write/MarkdownEditor';
import { LoginRequiredModal } from '../../components/common/LoginRequireModal';
import ImageSelector from '../../components/ImageSelector/ImageSelector';
import { useChatPanelSlot } from '../Slot';

type NewBlogPageProps = {
  editId?: number;
};

export default function NewBlogPage({ editId }: NewBlogPageProps) {
  const router = useRouter();

  const [form, setForm] = useState<BlogFormValues>({
    title: '',
    contentMarkdown: '',
    tags: [],
    status: 'DRAFT',
    visibility: 'PRIVATE',
  });
  const { setChatPanel } = useChatPanelSlot();

  // AI 채팅 패널
  useEffect(() => {
    setChatPanel(<AiChatPanel title={form.title} content={form.contentMarkdown} />);
    return () => setChatPanel(null); // 페이지 벗어나면 제거
  }, [form.title, form.contentMarkdown, setChatPanel]);

  const [blogId, setBlogId] = useState<number | null>(editId ?? null);
  // 이미지/썸네일 상태
  const [blogImages, setBlogImages] = useState<BlogFileDto[]>([]);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  // 발행 버튼 상태
  const [isPublishing, setIsPublishing] = useState(false);
  // 임시저장 목록 모달 상태
  const [isDraftModalOpen, setIsDraftModalOpen] = useState(false);
  const [drafts, setDrafts] = useState<BlogDraftDto[]>([]);
  const [isLoadingDrafts, setIsLoadingDrafts] = useState(false);
  // ---------------- 인증 상태 ----------------
  const [authChecked, setAuthChecked] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // 로그인 유저 조회 엔드포인트 사용
        const me = await apiClient<any>('/api/v1/users/me', {
          method: 'GET',
        });

        if (me) {
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
          setShowLoginModal(true);
        }
      } catch (e: any) {
        // 401 포함: 비로그인으로 간주
        setIsLoggedIn(false);
        setShowLoginModal(true);
      } finally {
        setAuthChecked(true);
      }
    };

    checkAuth();
  }, []);
  /* 폼 업데이트 헬퍼 */
  const update = <K extends keyof BlogFormValues>(key: K, value: BlogFormValues[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };
  const buildReqBody = (status: BlogStatus): BlogWriteReqBody => ({
    title: form.title.trim(),
    content: form.contentMarkdown.trim(),
    status,
    hashtagNames: form.tags,
  });

  useEffect(() => {
    if (!editId) return;

    const load = async () => {
      try {
        const detail = await fetchBlogDetail(editId);

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
      } catch (e) {
        console.error(e);
        alert('글 정보를 불러오지 못했습니다.');

        router.push('/blogs');
      }
    };

    load();
  }, [editId, router]);

  const ensureDraft = async (): Promise<number> => {
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
      // if (!requireAuth('임시저장')) return;
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
      // if (!requireAuth('발행')) {
      //   setIsPublishing(false);
      //   return;
      // }
      const id = await ensureDraft();
      const dto = await updateBlog(id, buildReqBody('PUBLISHED'));
      router.push(`/blogs/${dto.id}`);
    } catch (e) {
      console.error(e);
      alert('발행 중 오류가 발생했습니다.');
    } finally {
      setIsPublishing(false);
    }
  };
  // 임시저장 목록 관련 로직
  const openDraftModal = async () => {
    // if (!requireAuth('임시저장 목록 보기')) return;

    setIsDraftModalOpen(true);
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
  if (!authChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">로그인 상태를 확인 중입니다…</p>
      </div>
    );
  }
  // 이미지 업로드 함수
  const handleUploadContentImage = async (file: File): Promise<string> => {
    const id = await ensureDraft(); // draft 없으면 여기서 생성
    const formData = new FormData();
    formData.append('files', file);
    formData.append('type', 'CONTENT');

    // TODO: aspectRatios 추후 적용
    const res = await uploadBlogImage(id, formData);

    if (!res.ok) {
      throw new Error(`이미지 업로드 실패 (status: ${res.status})`);
    }

    const rs: RsData<BlogMediaUploadResponse> = await res.json();
    if (!rs.data) {
      throw new Error('이미지 업로드 응답이 올바르지 않습니다.');
    }

    const dto = rs.data;

    return dto.url;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-sky-50/40 to-slate-50">
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
            content={form.contentMarkdown}
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
            onUploadImage={handleUploadContentImage}
          />
        </section>

        <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
          <ImageSelector
            blogId={blogId}
            blogImages={blogImages}
            thumbnailUrl={thumbnailUrl}
            blogContent={form.contentMarkdown}
            onChangeImages={setBlogImages}
            onChangeThumbnail={setThumbnailUrl}
            ensureDraft={ensureDraft}
          />
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
      <LoginRequiredModal
        open={showLoginModal && !isLoggedIn}
        onClose={() => router.push(`/blogs`)}
        onConfirmLogin={() => {
          // TODO: 배포 환경에서는 바꾸기
          router.push(`/auth/login`);
        }}
      />
    </div>
  );
}
