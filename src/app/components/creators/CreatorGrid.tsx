import CreatorCard, { Creator } from './CreatorCard';

export default function CreatorGrid({ creators }: { creators: Creator[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {creators.map((creator) => (
        <CreatorCard key={creator.id} creator={creator} />
      ))}
    </div>
  );
}
