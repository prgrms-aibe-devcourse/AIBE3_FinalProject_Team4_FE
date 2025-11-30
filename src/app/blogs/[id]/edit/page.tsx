import NewBlogPage from "../../new/NewBlogPage";
export default function Page({ params }: { params: { id: string } }) {
  const editId = Number(params.id);
  return <NewBlogPage editId={editId} />;
}
