import LoadingSpinner from '../../../components/common/LoadingSpinner';

export default function ShorlogModalLoading() {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#a7adb8]/65 backdrop-blur-[3px]">
      <div className="flex h-[82vh] w-full max-w-[1200px] items-center justify-center rounded-3xl bg-white shadow-xl">
        <LoadingSpinner label="숏로그를 불러오는 중..." size="md" />
      </div>
    </div>
  );
}

