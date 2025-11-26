import Sidebar from '@/src/app/components/common/SideBar';

export default function BlogsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Sidebar */}
      <aside className="hidden w-64 border-r border-slate-100 bg-white/80 backdrop-blur-md md:block">
        <Sidebar />
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        <div className="mx-auto w-full max-w-5xl px-4 pb-16 pt-10">{children}</div>
      </main>
    </div>
  );
}
