import './globals.css';
import ReactQueryProvider from '../providers/ReactQueryProvider';
import Sidebar from './components/common/SideBar';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <ReactQueryProvider>
          <div className="flex min-h-screen">
            <Sidebar />
            <main className="ml-64 flex-1 bg-slate-50">{children}</main>
          </div>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
