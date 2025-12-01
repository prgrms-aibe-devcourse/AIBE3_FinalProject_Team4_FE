import NewBlogPage from '../../new/NewBlogPage';
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const editId = Number(id);

  return <NewBlogPage editId={editId} />;
}
