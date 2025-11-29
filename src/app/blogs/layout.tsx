import Sidebar from '@/src/app/components/sidebar/SideBar';

export default function BlogsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Main Content */}
      <main className="flex-1">
        <div className="mx-auto w-full max-w-5xl px-4 pb-16 pt-10">{children}</div>
      </main>
    </div>
  );
}
