'use client';

import { getCreatorOverview } from '@/src/api/dashboadOverview';
import { showGlobalToast } from '@/src/lib/toastStore';
import type { CreatorOverview } from '@/src/types/dashboard';
import {
  ArrowDownRight,
  ArrowUpRight,
  Bookmark,
  Eye,
  Heart,
  MessageCircle,
  Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import LoadingSpinner from '../../common/LoadingSpinner';

const PERIOD_OPTIONS = [
  { key: 7, label: '최근 7일' },
  { key: 30, label: '최근 30일' },
  { key: 90, label: '최근 90일' },
];

export default function CreatorDashboardClient() {
  const [period, setPeriod] = useState<number>(7);
  const [data, setData] = useState<CreatorOverview | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const load = async (days: number) => {
    try {
      setLoading(true);
      setError(null);
      const res = await getCreatorOverview(days);
      setData(res);
    } catch (e: any) {
      console.error(e);
      setError(e?.message ?? '대시보드 데이터를 불러오지 못했습니다.');
      showGlobalToast('대시보드 데이터를 불러오지 못했습니다.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(period);
  }, [period]);

  const effectivePeriod = data?.periodDays ?? period;

  return (
    <section className="space-y-8">
      {/* 상단 헤더 */}
      <header className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            {/* <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-600">
              CREATOR DASHBOARD
            </p>
            <h3 className="mt-2 text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
              크리에이터 대시보드
            </h3> */}
            <p className="mt-2 text-sm font-semibold  text-[#1f5ecc]">
              내 숏로그·블로그의 조회/반응/팔로워 흐름을 한눈에 확인해 보세요.
            </p>
          </div>

          {/* 기간 선택 */}
          <div className="inline-flex items-center rounded-full bg-slate-100 p-0.5 text-[12px]">
            {PERIOD_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setPeriod(opt.key)}
                className={[
                  'min-w-[80px] rounded-full px-3 py-1.5 transition-all',
                  period === opt.key
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800',
                ].join(' ')}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* 로딩/에러 상태 */}
      {loading && !data && (
        <div className="flex justify-center py-16">
          <LoadingSpinner label="대시보드 데이터를 불러오는 중입니다" />
        </div>
      )}

      {error && !data && (
        <div className="rounded-2xl border border-dashed border-rose-100 bg-rose-50/50 p-6 text-center text-sm text-rose-600">
          {error}
        </div>
      )}

      {!loading && data && (
        <>
          {/* 전체 통계 */}
          <section className="space-y-4">
            <h2 className="text-base font-semibold text-slate-900">전체 통계</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                icon={<Eye className="h-5 w-5 text-sky-500" />}
                label="전체 조회수"
                value={data.totalViews}
              />
              <StatCard
                icon={<Heart className="h-5 w-5 text-rose-500" />}
                label="전체 좋아요"
                value={data.totalLikes}
              />
              <StatCard
                icon={<Bookmark className="h-5 w-5 text-amber-500" />}
                label="전체 북마크"
                value={data.totalBookmarks}
              />
              <StatCard
                icon={<Users className="h-5 w-5 text-emerald-500" />}
                label="전체 팔로워"
                value={data.followerCount}
              />
            </div>
          </section>

          {/* 최근 N일 활동 */}
          <section className="space-y-4">
            <h2 className="text-base font-semibold text-slate-900">
              최근 {effectivePeriod}일 활동
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                icon={<Heart className="h-5 w-5 text-rose-500" />}
                label="좋아요"
                value={data.periodLikes}
                subLabel={`전체의 ${data.likeRate.toFixed(1)}%`}
                changeRate={data.likesChangeRate}
              />
              <StatCard
                icon={<Bookmark className="h-5 w-5 text-amber-500" />}
                label="북마크"
                value={data.periodBookmarks}
                subLabel={`전체의 ${data.bookmarkRate.toFixed(1)}%`}
                changeRate={data.bookmarksChangeRate}
              />
              <StatCard
                icon={<MessageCircle className="h-5 w-5 text-sky-500" />}
                label="댓글"
                value={data.periodComments}
                subLabel={`최근 ${effectivePeriod}일 동안`}
              />
              <StatCard
                icon={<Users className="h-5 w-5 text-emerald-500" />}
                label="새 팔로워"
                value={data.periodFollowers}
                subLabel="전체 팔로워 기준"
                changeRate={data.followersChangeRate}
              />
            </div>
          </section>

          {/* 하단: 성과 요약 + 성장 팁 */}
          <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {/* 성과 요약 */}
            <div className="rounded-2xl border border-slate-100 bg-white/80 p-4 sm:p-5 shadow-sm">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-sky-50 text-sky-500">
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </span>
                성과 요약
              </h3>
              <dl className="mt-4 space-y-3 text-sm">
                <Row label="평균 좋아요율">{data.likeRate.toFixed(1)}%</Row>
                <Row label="평균 북마크율">{data.bookmarkRate.toFixed(1)}%</Row>
                <Row label="팔로워당 조회수">{data.viewsPerFollower.toFixed(1)}</Row>
              </dl>
            </div>

            {/* 성장 팁 */}
            <div className="rounded-2xl border border-sky-100  bg-gradient-to-br from-[#EAF3FF]  to-[#F5F9FF] p-4 sm:p-5 shadow-sm">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-sky-#EAF3FF text-indigo-600">
                  💡
                </span>
                성장 팁
              </h3>
              <ul className="mt-4 space-y-2 text-xs sm:text-sm text-slate-600">
                <li>• 일정한 주기로 콘텐츠를 발행해 팔로워와의 접점을 유지해 보세요.</li>
                <li>• 댓글에 성실히 답변해 커뮤니티를 활성화해 보세요.</li>
                <li>• 반응이 좋은 해시태그/주제를 분석해 비슷한 콘텐츠를 더 만들어 보세요.</li>
              </ul>
            </div>
          </section>
        </>
      )}
    </section>
  );
}

/* 재사용 카드/부가 컴포넌트  */

type StatCardProps = {
  icon: React.ReactNode;
  label: string;
  value: number;
  subLabel?: string;
  changeRate?: number | null;
};

function StatCard({ icon, label, value, subLabel, changeRate }: StatCardProps) {
  return (
    <div className="flex flex-col justify-between rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 px-4 py-4 sm:px-5 sm:py-5">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50">
            {icon}
          </div>
          <span className="text-xs font-medium text-slate-500">{label}</span>
        </div>
        {typeof changeRate === 'number' && <TrendBadge value={changeRate} />}
      </div>

      <div className="mt-4">
        <p className="text-2xl font-semibold tracking-tight text-slate-900">
          {formatNumber(value)}
        </p>
        {subLabel && <p className="mt-1 text-[11px] text-slate-400">{subLabel}</p>}
      </div>
    </div>
  );
}

function TrendBadge({ value }: { value: number }) {
  const isUp = value >= 0;
  const display = Math.abs(value).toFixed(1);

  return (
    <span
      className={[
        'inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-medium',
        isUp ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600',
      ].join(' ')}
    >
      {isUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
      {display}%
    </span>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="text-sm font-medium text-slate-900">{children}</dd>
    </div>
  );
}

function formatNumber(value: number): string {
  if (value >= 10_000) {
    return (value / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return value.toLocaleString();
}
