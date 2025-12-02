import CreatorCard, { Creator } from './CreatorCard';

export default function CreatorGrid({ creators }: { creators: Creator[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {creators.map((creator) => (
        <CreatorCard key={creator.id} creator={creator} />
      ))}
    </div>
  );
}
