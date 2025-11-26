import './globals.css';
import QueryProvider from './components/QueryProvider';
import Sidebar from './components/SideBar';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <QueryProvider>
          <div className="flex min-h-screen">
            <Sidebar />
            <main className="ml-64 flex-1 bg-slate-50">{children}</main>
          </div>
        </QueryProvider>
      </body>
    </html>
  );
}
