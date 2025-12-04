'use client';

import { useRouter } from 'next/navigation';
import { useCurrentUser } from '@/src/hooks/useCurrentUser';
import { useLoginModal } from '@/src/providers/LoginModalProvider';
import './MainPage.css';

export default function MainPage() {
  const router = useRouter();
  const { data: currentUser, isLoading } = useCurrentUser();
  const { open: openLoginModal } = useLoginModal();

  const handleLogin = () => {
    openLoginModal();
  };

  const handleShorlogClick = () => {
    router.push('/shorlog/feed');
  };

  const handleBlogClick = () => {
    router.push('/blogs');
  };

  const handleCreateClick = () => {
    router.push('/create-content');
  };

  return (
    <div className="page">
      <main className="main">
        {/* 왼쪽: 텍스트 영역 */}
        <section className="hero">
          <div className="hero-badge">
            <span className="badge-dot"></span>
            <span>TEXTOK</span>
          </div>

          <h1 className="hero-title">텍톡(TexTok)</h1>
          <h2 className="hero-title" style={{ fontSize: '2.5rem', marginTop: '-1rem' }}>
            사람들의 생각과 이야기, 그리고 연결
          </h2>

          <p className="hero-subtitle">
            ✨ 짧은 생각을 깊게, 💭 깊은 생각을 다시 가볍게 풀어낼 수 있는
          </p>
          <p className="hero-description">
            🔄 양방향 텍스트 경험을 제공하는 서비스
          </p>

          <div className="hero-stats">
            <div className="stat-item">
              <div className="stat-number">1,000+</div>
              <div className="stat-label">활성 사용자</div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <div className="stat-number">5,000+</div>
              <div className="stat-label">작성된 글</div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <div className="stat-number">10,000+</div>
              <div className="stat-label">공유된 생각</div>
            </div>
          </div>

          <div className="hero-actions">
            {isLoading ? (
              <button className="btn" disabled>
                <span>로딩중...</span>
              </button>
            ) : currentUser ? (
              <>
                <button className="btn btn-primary" onClick={handleShorlogClick}>
                  <span>숏로그 보러가기</span>
                  <span className="btn-arrow">→</span>
                </button>
                <button className="btn btn-secondary" onClick={handleBlogClick}>
                  <span>블로그 보러가기</span>
                  <span className="btn-arrow">→</span>
                </button>
                <button className="btn btn-warning" onClick={handleCreateClick}>
                  <span>작성 하러가기</span>
                  <span className="btn-arrow">→</span>
                </button>
              </>
            ) : (
              <button className="btn" onClick={handleLogin}>
                <span>로그인 하러가기</span>
                <span className="btn-arrow">→</span>
              </button>
            )}
          </div>
        </section>

        {/* 오른쪽: 이미지 영역 */}
        <section className="illustration">
          <img
            src="https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&h=800&fit=crop&q=80"
            alt="Writing and Communication"
            className="hero-image"
          />
        </section>
      </main>
    </div>
  );
}
