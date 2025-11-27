import ProfileContent from './ProfileContent';
import { ProfileHeader } from './ProfileHeader';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

type ProfilePageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { id } = await params;

  const profile = await getProfileData(id);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-900">
      <div className="flex">
        <main className="flex-1 min-h-screen">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-8">
            <ProfileHeader profile={profile} />
            <div className="mt-8">
              <ProfileContent userId={id} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

async function getProfileData(userId: string) {
  const res = await fetch(`${API_BASE_URL}/api/v1/users/${userId}`, {
    method: 'GET',
    credentials: 'include',
  });
  const json = await res.json();
  if (json.resultCode !== '200') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        프로필을 불러올 수 없습니다.
      </div>
    );
  }
  return json.data;
}
