export async function createComment(shorlogId: number, content: string, parentId?: number) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/comments`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      targetType: 'SHORLOG',
      targetId: shorlogId,
      parentId: parentId ?? null,
      content,
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.msg || '댓글 작성 실패');
  return data.data;
}

export async function getComments(shorlogId: number) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/comments/SHORLOG/${shorlogId}`,
    {
      credentials: 'include',
    },
  );

  const data = await res.json();
  if (!res.ok) throw new Error(data.msg || '댓글 조회 실패');
  return data.data;
}

export async function editComment(commentId: number, newContent: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/comments/${commentId}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: newContent }),
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.msg || '댓글 수정 실패');
  return json.data;
}

export async function deleteComment(commentId: number) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/comments/${commentId}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.msg || '댓글 삭제 실패');
  return json.data;
}

export async function likeComment(commentId: number) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/comments/${commentId}/like`,
    {
      method: 'POST',
      credentials: 'include',
    },
  );

  const json = await res.json();
  if (!res.ok) throw new Error(json.msg || '좋아요 실패');
  return json.data;
}

export async function unlikeComment(commentId: number) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/comments/${commentId}/unlike`,
    {
      method: 'POST',
      credentials: 'include',
    },
  );

  const json = await res.json();
  if (!res.ok) throw new Error(json.msg || '좋아요 취소 실패');
  return json.data;
}
