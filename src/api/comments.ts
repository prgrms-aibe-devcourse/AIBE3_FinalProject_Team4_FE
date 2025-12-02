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
