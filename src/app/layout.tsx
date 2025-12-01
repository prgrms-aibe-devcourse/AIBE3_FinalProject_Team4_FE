import { AuthProvider } from '../providers/AuthProvider';
import ReactQueryProvider from '../providers/ReactQueryProvider';
import { ToastContainer } from './components/common/ToastContainer';
import Sidebar from './components/sidebar/SideBar';
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <AuthProvider>
          <ReactQueryProvider>
            <div className="flex min-h-screen">
              <Sidebar />
              <main
                className="flex-1 bg-slate-50
                  pl-20 
                  xl:pl-60
                  transition-all duration-300"
              >
                {children}
              </main>
              <ToastContainer />
            </div>
          </ReactQueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
