import { AuthProvider } from '../providers/AuthProvider';
import ReactQueryProvider from '../providers/ReactQueryProvider';
import Sidebar from './components/sidebar/SideBar';
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <script
          src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js"
          integrity="sha384-TiCUE00h649CAMonG018J2ujOgDKW/kVWlChEuu4jK2vxfAAD0eZxzCKakxg55G4"
          crossOrigin="anonymous"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.addEventListener('load', function() {
                if (window.Kakao && !window.Kakao.isInitialized()) {
                  const kakaoKey = '${process.env.NEXT_PUBLIC_KAKAO_APP_KEY || ''}';
                  if (kakaoKey) {
                    try {
                      window.Kakao.init(kakaoKey);
                    } catch (error) {
                      console.warn('Kakao SDK 초기화 실패');
                    }
                  }
                }
              });
            `
          }}
        />
      </head>
      <body>
        <AuthProvider>
          <ReactQueryProvider>
            <div className="flex min-h-screen">
              <Sidebar />
              <main className="ml-64 flex-1 bg-slate-50">{children}</main>
            </div>
          </ReactQueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
