'use client';

import {
  createBlogComment,
  deleteBlogComment,
  editBlogComment,
  getBlogComments,
  likeBlogComment,
  unlikeBlogComment,
} from '@/src/api/BlogComments';
import BlogCommentList from '@/src/app/components/comments/BlogCommentList';
import { useRequireAuth } from '@/src/hooks/userRequireAuth';
import { handleApiError } from '@/src/lib/handleApiError';
import { showGlobalToast } from '@/src/lib/toastStore';
import { MessageCircle } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

interface Props {
  blogId: number;
  initialCommentCount: number;
}

export default function BlogCommentSection({ blogId, initialCommentCount }: Props) {
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(initialCommentCount);
  const [loading, setLoading] = useState(true);

  const requireAuth = useRequireAuth();
  const searchParams = useSearchParams();

  /** 🔥 highlight가 적용될 댓글 DOM 참조 */
  const highlightRef = useRef<HTMLDivElement | null>(null);

  /** URL 파라미터: /blog/3?commentId=10 */
  const highlightCommentId = searchParams.get('commentId')
    ? Number(searchParams.get('commentId'))
    : null;

  /** =============================
   *  정렬 (오래된 댓글 → 최신순)
   * ============================= */
  const sortCommentsOldest = (list: any[]): any[] => {
    return [...list]
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .map((c) => ({
        ...c,
        children: c.children
          ? [...c.children].sort(
              (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
            )
          : [],
      }));
  };

  /** 전체 댓글 수 계산 */
  const countAllComments = (list: any[]): number => {
    let count = 0;
    for (const c of list) {
      count++;
      if (c.children?.length) count += countAllComments(c.children);
    }
    return count;
  };

  /** =============================
   *  highlight + 자동 펼침 처리
   * ============================= */
  const applyHighlightAndExpand = (list: any[], targetId: number) => {
    let found = false;

    const dfs = (nodeList: any[]): any[] =>
      nodeList.map((node) => {
        let newNode = { ...node };

        if (node.children && node.children.length > 0) {
          const updatedChildren = dfs(node.children);
          newNode.children = updatedChildren;

          if (updatedChildren.some((c: any) => c._highlight || c._forceOpen)) {
            newNode._forceOpen = true;
            found = true;
          }
        }

        if (node.id === targetId) {
          newNode._highlight = true;
          newNode._forceOpen = true;
          found = true;
        }

        return newNode;
      });

    const updated = dfs(list);
    return found ? updated : list;
  };

  /** =============================
   *  최초 로딩
   * ============================= */
  useEffect(() => {
    const fetch = async () => {
      try {
        let data = await getBlogComments(blogId);
        data = sortCommentsOldest(data);

        if (highlightCommentId) {
          data = applyHighlightAndExpand(data, highlightCommentId);
        }

        setComments(data);
        setTotalCount(countAllComments(data));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [blogId, highlightCommentId]);

  /** =============================
   *  댓글 작성
   * ============================= */
  const handleCommentSubmit = async () => {
    if (!requireAuth('댓글 작성')) return;
    if (!commentText.trim()) return showGlobalToast('내용을 입력해주세요.', 'warning');

    const content = commentText.trim();
    setCommentText('');

    try {
      const newComment = await createBlogComment(blogId, content, undefined);

      setComments((prev) => sortCommentsOldest([newComment, ...prev]));
      setTotalCount((prev) => prev + 1);
    } catch (err: any) {
      showGlobalToast(err.message);
    }
  };

  const handleCommentFocus = () => {
    if (!requireAuth('댓글 작성')) {
      (document.activeElement as HTMLElement)?.blur();
    }
  };

  /** =============================
   *  답글 작성
   * ============================= */
  const handleReply = async (parentId: number, replyText: string) => {
    if (!requireAuth('답글 작성')) return;
    if (!replyText.trim()) return showGlobalToast('내용을 입력해주세요.');

    try {
      const newReply = await createBlogComment(blogId, replyText.trim(), parentId);

      setComments((prev) =>
        prev.map((c) =>
          c.id === parentId
            ? {
                ...c,
                children: sortCommentsOldest([...(c.children ?? []), newReply]),
                _forceOpen: true,
              }
            : c,
        ),
      );

      setTotalCount((prev) => prev + 1);
    } catch (err: any) {
      handleApiError(err.message);
    }
  };

  /** =============================
   *  좋아요
   * ============================= */
  const handleLike = async (commentId: number) => {
    if (!requireAuth('좋아요')) return;

    const optimistic = (list: any[]): any[] =>
      list.map((c) => {
        if (c.id === commentId) {
          return {
            ...c,
            isLiked: !c.isLiked,
            likeCount: c.isLiked ? c.likeCount - 1 : c.likeCount + 1,
          };
        }
        return {
          ...c,
          children: optimistic(c.children || []),
        };
      });

    setComments((prev) => optimistic(prev));

    try {
      const target = comments.find((c) => c.id === commentId);
      target?.isLiked ? await unlikeBlogComment(commentId) : await likeBlogComment(commentId);
    } catch (err: any) {
      showGlobalToast('좋아요 처리 실패', 'error');
    }
  };

  /** =============================
   *  댓글 수정
   * ============================= */
  const handleEdit = async (commentId: number, newContent: string) => {
    if (!requireAuth('댓글 수정')) return;

    try {
      const updated = await editBlogComment(commentId, newContent);

      const updateTree = (list: any[]): any[] =>
        list.map((c) =>
          c.id === commentId
            ? updated
            : {
                ...c,
                children: updateTree(c.children || []),
              },
        );

      setComments((prev) => updateTree(prev));
    } catch (err: any) {
      handleApiError(err.message);
    }
  };

  /** =============================
   *  댓글 삭제
   * ============================= */
  const handleDelete = async (commentId: number) => {
    if (!requireAuth('댓글 삭제')) return;

    try {
      await deleteBlogComment(commentId);

      const removeTree = (list: any[]): any[] =>
        list
          .filter((c) => c.id !== commentId)
          .map((c) => ({
            ...c,
            children: removeTree(c.children || []),
          }));

      setComments((prev) => removeTree(prev));
      setTotalCount((prev) => prev - 1);
    } catch (err: any) {
      handleApiError(err.message);
    }
  };

  /** =============================
   * 렌더
   * ============================= */
  return (
    <section className="border-slate-100 px-3 py-1 sm:px-1">
      {/* 헤더 */}
      <div className="flex items-center gap-1 mb-4">
        <div className="flex h-6 w-6 items-center justify-center rounded-full text-slate-500">
          <MessageCircle className="h-3.5 w-3.5" />
        </div>

        <p className="text-sm font-semibold text-slate-900">
          댓글 <span className="ml-0.5 font-bold text-sky-600">{totalCount}</span>개
        </p>
      </div>

      {/* 입력창 */}
      <div className="rounded-2xl border border-slate-100 bg-slate-50/80 px-3 py-7 sm:px-0.5 sm:py-2">
        <div className="flex items-center gap-2">
          <input
            type="text"
            className="flex-1 rounded-full bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-[#2979FF]/40"
            placeholder="따뜻한 댓글을 남겨보세요"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onFocus={handleCommentFocus}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleCommentSubmit();
              }
            }}
          />
          <button
            onClick={handleCommentSubmit}
            className="shrink-0 rounded-full bg-[#2979FF] px-3.5 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-[#1f5ecc] transition-colors"
          >
            등록
          </button>
        </div>
      </div>

      {/* 댓글 리스트 */}
      <div className="mt-5 space-y-3">
        {loading ? (
          <p className="py-4 text-center text-xs text-slate-400">댓글을 불러오는 중입니다…</p>
        ) : (
          <BlogCommentList
            comments={comments}
            onReply={handleReply}
            onLike={handleLike}
            onEdit={handleEdit}
            onDelete={handleDelete}
            highlightRef={highlightRef}
          />
        )}
      </div>
    </section>
  );
}
