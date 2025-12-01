import { AuthProvider } from '../providers/AuthProvider';
import ReactQueryProvider from '../providers/ReactQueryProvider';
import Sidebar from './components/sidebar/SideBar';
import './globals.css';
import { ToastContainer } from './components/common/ToastContainer';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <AuthProvider>
          <ReactQueryProvider>
            <div className="flex min-h-screen">
              <Sidebar />
              <main className="ml-64 flex-1 bg-slate-50">{children}</main>
              <ToastContainer />
            </div>
          </ReactQueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
