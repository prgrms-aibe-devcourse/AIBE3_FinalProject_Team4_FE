import { fetchMainSummary } from '../api/main';
import PopularContentsSection from './components/main/PopularContentsSection';
import RecommendedUsersSection from './components/main/RecommendedUsersSection';
import TrendingHashtagsSection from './components/main/TrendingHastagsSection';

export default async function Page() {
  const summary = await fetchMainSummary();

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 flex flex-col gap-10">
      <PopularContentsSection items={summary.popularContents} />

      <div className="grid md:grid-cols-[2fr,1.3fr] gap-8">
        <TrendingHashtagsSection tags={summary.trendingHashtags} />

        <RecommendedUsersSection users={summary.recommendedUsers} />
      </div>
    </main>
  );
}
