'use client';

import { getCreatorOverview } from '@/src/api/dashboadOverview';
import { showGlobalToast } from '@/src/lib/toastStore';
import type { CreatorOverview } from '@/src/types/dashboard';
import { Bookmark, Eye, Heart, MessageCircle, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import LoadingSpinner from '../../common/LoadingSpinner';

type StatMode = 'TOTAL' | 7 | 30;

const STAT_OPTIONS: { key: StatMode; label: string }[] = [
  { key: 'TOTAL', label: '전체' },
  { key: 7, label: '주간' },
  { key: 30, label: '월간' },
];

export default function CreatorDashboardClient() {
  const [statMode, setStatMode] = useState<StatMode>('TOTAL');

  // ✅ 기본(30일) 데이터: 그래프(30일 고정) + 월간 period 값까지 담당
  const [data, setData] = useState<CreatorOverview | null>(null);

  // ✅ 주간(7일) 전용 period 값용 데이터 (TOTAL용 total*도 들어있긴 하지만 TOTAL은 data 기준으로만 씀)
  const [weekData, setWeekData] = useState<CreatorOverview | null>(null);

  const [loading, setLoading] = useState(true); // 최초 로딩(30일)
  const [weekLoading, setWeekLoading] = useState(false); // ✅ 주간 버튼 눌렀을 때만 별도 로딩

  useEffect(() => {
    load30();
  }, []);

  // ✅ 주간(7일) 선택 시에만 추가 호출 (캐시처럼 1번만)
  useEffect(() => {
    if (statMode !== 7) return;
    if (weekData) return; // 이미 받아왔으면 재호출 안 함
    load7();
  }, [statMode, weekData]);

  const load30 = async () => {
    try {
      setLoading(true);
      const res = await getCreatorOverview(30);
      setData(res);
    } catch (e) {
      console.error(e);
      showGlobalToast('통계 데이터를 불러오지 못했습니다.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const load7 = async () => {
    try {
      setWeekLoading(true);
      const res = await getCreatorOverview(7);
      setWeekData(res);
    } catch (e) {
      console.error(e);
      showGlobalToast('주간 통계 데이터를 불러오지 못했습니다.', 'error');
    } finally {
      setWeekLoading(false);
    }
  };

  /* 30일 그래프 요약 인사이트 */
  const chartInsights = useMemo(() => {
    if (!data?.dailyViews30d?.length) return null;

    const total = data.dailyViews30d.reduce((sum, d) => sum + d.blogViews + d.shorlogViews, 0);
    const avg = Math.round(total / data.dailyViews30d.length);

    const peak = data.dailyViews30d.reduce(
      (max, d) => {
        const t = d.blogViews + d.shorlogViews;
        return t > max.total ? { date: d.date, total: t } : max;
      },
      { date: data.dailyViews30d[0].date, total: 0 },
    );

    const start = data.dailyViews30d[0].date;
    const end = data.dailyViews30d[data.dailyViews30d.length - 1].date;

    return { total, avg, peak, start, end };
  }, [data]);

  const rightStatValues = useMemo(() => {
    if (!data) return null;

    if (statMode === 'TOTAL') {
      return {
        views: data.totalViews,
        likes: data.totalLikes,
        bookmarks: data.totalBookmarks,
        comments: data.totalComments,
        followersAdded: data.followerCount,
      };
    }

    if (statMode === 7) {
      if (!weekData) return null;
      return {
        views: weekData.periodViews,
        likes: weekData.periodLikes,
        bookmarks: weekData.periodBookmarks,
        comments: weekData.periodComments,
        followersAdded: weekData.periodFollowers,
      };
    }

    // statMode === 30
    return {
      views: data.periodViews,
      likes: data.periodLikes,
      bookmarks: data.periodBookmarks,
      comments: data.periodComments,
      followersAdded: data.periodFollowers,
    };
  }, [data, weekData, statMode]);

  const todayYesterday = useMemo(() => {
    const rows = data?.dailyViews30d ?? [];
    if (!rows.length) {
      return { today: 0, yesterday: 0, todayLabel: '오늘', yesterdayLabel: '어제' };
    }

    const last = rows[rows.length - 1];
    const prev = rows.length >= 2 ? rows[rows.length - 2] : null;

    const todayTotal = (last?.blogViews ?? 0) + (last?.shorlogViews ?? 0);
    const yesterdayTotal = prev ? (prev.blogViews ?? 0) + (prev.shorlogViews ?? 0) : 0;

    return {
      today: todayTotal,
      yesterday: yesterdayTotal,
      todayLabel: toMMDD(last.date),
      yesterdayLabel: prev ? toMMDD(prev.date) : '전일',
    };
  }, [data]);

  const chartData = useMemo(() => {
    if (!data?.dailyViews30d?.length) return [];
    return data.dailyViews30d.map((d, i, arr) => ({
      dateLabel: formatXAxis(d.date, i, arr),
      rawDate: d.date,
      blog: d.blogViews,
      shorlog: d.shorlogViews,
      total: d.blogViews + d.shorlogViews,
    }));
  }, [data]);

  const recentViewsStatus = useMemo(() => {
    const today = todayYesterday.today ?? 0;
    const yesterday = todayYesterday.yesterday ?? 0;

    if (yesterday === 0 && today === 0) {
      return {
        tone: 'neutral' as const,
        title: '데이터가 아직 충분하지 않아요',
      };
    }
    if (yesterday === 0 && today > 0) {
      return {
        tone: 'up' as const,
        title: '오늘부터 반응이 시작됐어요',
      };
    }

    const ratio = today / Math.max(1, yesterday);

    if (ratio >= 1.25) {
      return {
        tone: 'up' as const,
        title: '어제보다 반응이 눈에 띄게 좋아요',
      };
    }
    if (ratio <= 0.85) {
      return {
        tone: 'down' as const,
        title: '오늘은 반응이 다소 조용해요',
      };
    }
    return {
      tone: 'neutral' as const,
      title: '어제와 비슷한 조회 흐름이에요',
    };
  }, [todayYesterday]);

  return (
    <section className="space-y-10">
      {/*  상단 통계 */}
      <header className="space-y-4">
        {loading && (
          <div className="py-10 flex justify-center">
            <LoadingSpinner label="통계를 불러오는 중입니다" />
          </div>
        )}

        {!loading && data && (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            {/* 좌: 어제/오늘 조회수 (필터 영향 X) */}
            <section className="lg:col-span-5 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900">최근 조회수</h3>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <MiniStat
                  label="어제"
                  subLabel={todayYesterday.yesterdayLabel}
                  value={todayYesterday.yesterday}
                />
                <MiniStat
                  label="오늘"
                  subLabel={todayYesterday.todayLabel}
                  value={todayYesterday.today}
                  highlight
                />
              </div>

              <div
                className={[
                  'mt-4 rounded-xl px-3 py-2 text-[12px] ring-1',
                  recentViewsStatus.tone === 'up'
                    ? 'bg-sky-50 text-sky-900 ring-sky-100'
                    : recentViewsStatus.tone === 'down'
                      ? 'bg-slate-50 text-slate-700 ring-slate-200'
                      : 'bg-slate-50 text-slate-700 ring-slate-200',
                ].join(' ')}
              >
                <div className="rounded-xl text-[12px] text-slate-600">
                  {recentViewsStatus.title}
                </div>
              </div>
            </section>

            {/* 우: 조회수/좋아요/북마크/댓글 */}
            <section className="lg:col-span-7 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">반응 통계</h3>
                  <p className="mt-1 text-[11px] text-slate-500">
                    적용 기준:{' '}
                    <b className="text-slate-700">
                      {statMode === 'TOTAL'
                        ? '전체 누적'
                        : statMode === 7
                          ? '최근 7일'
                          : '최근 30일'}
                    </b>
                  </p>
                </div>

                <div className="inline-flex rounded-full bg-slate-100 p-0.5 text-[12px]">
                  {STAT_OPTIONS.map((opt) => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => setStatMode(opt.key)}
                      className={[
                        'px-4 py-1.5 rounded-full transition',
                        statMode === opt.key
                          ? 'bg-white shadow text-slate-900'
                          : 'text-slate-500 hover:text-slate-800',
                      ].join(' ')}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* ✅ 주간(7일) 첫 진입 시 weekLoading 동안만 우측 영역에서 “값” 대신 로딩 */}
              {statMode === 7 && weekLoading && (
                <div className="mt-6 flex justify-center py-6">
                  <LoadingSpinner label="주간 통계를 불러오는 중입니다" />
                </div>
              )}

              {!(statMode === 7 && weekLoading) && rightStatValues && (
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3">
                  <CompactStat
                    label="조회수"
                    value={rightStatValues.views}
                    icon={<Eye className="h-4 w-4" />}
                    compact
                  />
                  <CompactStat
                    label="좋아요"
                    value={rightStatValues.likes}
                    icon={<Heart className="h-4 w-4" />}
                    compact
                  />
                  <CompactStat
                    label="북마크"
                    value={rightStatValues.bookmarks}
                    icon={<Bookmark className="h-4 w-4" />}
                    compact
                  />
                  <CompactStat
                    label="댓글"
                    value={rightStatValues.comments}
                    icon={<MessageCircle className="h-4 w-4" />}
                    compact
                  />
                  <CompactStat
                    label="팔로워"
                    value={rightStatValues.followersAdded}
                    icon={<Users className="h-4 w-4" />}
                    compact
                  />
                </div>
              )}
            </section>
          </div>
        )}
      </header>

      {/* 하단 그래프 (30일 고정)*/}
      {!loading && data && (
        <section className="space-y-3">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-slate-900">최근 30일 조회수 현황</h3>
              </div>

              {chartInsights && (
                <p className="text-[12px] text-slate-500">
                  총 {chartInsights.total.toLocaleString()}회{' · '}
                  일평균 {chartInsights.avg.toLocaleString()}회{' · '}
                  피크 {formatISOToMMDD(chartInsights.peak.date)} (
                  {chartInsights.peak.total.toLocaleString()}회)
                </p>
              )}
            </div>

            <div className="flex items-center gap-3 text-[12px] text-slate-500">
              <LegendDot color="#3B82F6" label="숏로그" />
              <LegendDot color="#7DD3FC" label="블로그" />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            {data?.dailyViews30d?.length ? (
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.dailyViews30d.map((d, i, arr) => ({
                      label: formatXAxis(d.date, i, arr),
                      blog: d.blogViews,
                      shorlog: d.shorlogViews,
                    }))}
                    margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" fontSize={12} tickMargin={8} />
                    <YAxis fontSize={12} tickMargin={8} />
                    <Tooltip
                      formatter={(v: any, n: any) => [
                        Number(v).toLocaleString(),
                        n === 'blog' ? '블로그' : '숏로그',
                      ]}
                    />
                    <Bar dataKey="shorlog" stackId="a" barSize={16} fill="#3B82F6" />
                    <Bar dataKey="blog" stackId="a" barSize={16} fill="#7DD3FC" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="py-10 text-center text-sm text-slate-500">
                최근 30일 조회수 데이터가 없습니다.
              </div>
            )}
          </div>
        </section>
      )}
    </section>
  );
}

function MiniStat({
  label,
  subLabel,
  value,
  highlight,
}: {
  label: string;
  subLabel?: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div
      className={[
        'rounded-2xl p-4 ring-1',
        highlight ? 'bg-sky-50 ring-sky-100' : 'bg-white ring-slate-100',
      ].join(' ')}
    >
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-xs font-medium text-slate-700">{label}</span>
        {subLabel && <span className="text-[11px] text-slate-400">{subLabel}</span>}
      </div>
      <div className="mt-2 text-2xl font-semibold text-slate-900">{formatNumber(value)}</div>
    </div>
  );
}

function CompactStat({
  icon,
  label,
  value,
  compact,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  compact?: boolean;
}) {
  return (
    <div
      className={['rounded-2xl bg-white ring-1 ring-slate-100', compact ? 'p-3' : 'p-4'].join(' ')}
    >
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <span
          className={[
            'flex items-center justify-center rounded-lg bg-slate-50',
            compact ? 'h-7 w-7' : 'h-8 w-8',
          ].join(' ')}
        >
          {icon}
        </span>
        <span className={compact ? 'text-[11px]' : 'text-xs'}>{label}</span>
      </div>
      <p
        className={['mt-3 font-semibold text-slate-900', compact ? 'text-xl' : 'text-2xl'].join(
          ' ',
        )}
      >
        {formatNumber(value)}
      </p>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50">
          {icon}
        </span>
        {label}
      </div>
      <p className="mt-3 text-2xl font-semibold text-slate-900">{formatNumber(value)}</p>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}

function formatNumber(value: number): string {
  if (value >= 10_000) {
    return (value / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return value.toLocaleString();
}

function formatXAxis(dateStr: string, index: number, arr: { date: string }[]) {
  const [, m, d] = dateStr.split('-').map(Number);

  if (index === 0) return `${m}/${d}`;

  const [, pm] = arr[index - 1].date.split('-').map(Number);
  if (pm !== m) return `${m}/${d}`;

  return `${d}`;
}

function formatISOToMMDD(dateStr: string) {
  const [, m, d] = dateStr.split('-');
  return `${Number(m)}/${Number(d)}`;
}

function toMMDD(dateStr: string) {
  const [, m, d] = dateStr.split('-').map(Number);
  if (!m || !d) return dateStr;
  return `${m}/${d}`;
}
