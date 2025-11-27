'use client';

import AiChatSideBar from '../components/ai/AiChatPanel';

export default function AiChatDemoPage() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* 메인 컨텐츠 */}
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">AI 채팅 데모</h1>
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">사용 방법</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>오른쪽 하단의 파란색 버튼을 클릭하여 AI 채팅을 엽니다</li>
              <li>기본적으로 사이드바 모드로 열립니다 (페이지가 왼쪽으로 밀림)</li>
              <li>헤더의 아이콘 버튼을 클릭하여 플로팅 모드로 전환할 수 있습니다</li>
              <li>플로팅 모드에서도 사이드바 모드로 다시 전환할 수 있습니다</li>
              <li>X 버튼을 클릭하여 채팅을 닫을 수 있습니다</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">페이지 컨텐츠</h2>
            <p className="text-gray-700 mb-4">
              이 페이지는 AI 채팅 기능을 테스트하기 위한 데모 페이지입니다. 노션 AI처럼 사이드바
              또는 플로팅 윈도우로 AI와 대화할 수 있습니다.
            </p>
            <div className="space-y-4">
              <div className="border border-gray-200 rounded p-4">
                <h3 className="font-semibold mb-2">샘플 텍스트 1</h3>
                <p className="text-gray-600">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
                  incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
                  exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                </p>
              </div>
              <div className="border border-gray-200 rounded p-4">
                <h3 className="font-semibold mb-2">샘플 텍스트 2</h3>
                <p className="text-gray-600">
                  Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu
                  fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
                  culpa qui officia deserunt mollit anim id est laborum.
                </p>
              </div>
              <div className="border border-gray-200 rounded p-4">
                <h3 className="font-semibold mb-2">샘플 텍스트 3</h3>
                <p className="text-gray-600">
                  Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium
                  doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore
                  veritatis et quasi architecto beatae vitae dicta sunt explicabo.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI 채팅 사이드바/플로팅 컴포넌트 */}
      <AiChatSideBar />
    </div>
  );
}
