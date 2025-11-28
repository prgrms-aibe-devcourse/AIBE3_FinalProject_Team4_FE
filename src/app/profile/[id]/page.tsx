import { getSessionUser } from '@/src/lib/getSessionUser';
import ProfileContent from '../../components/profile/ProfileContent';
import { ProfileHeader } from '../../components/profile/ProfileHeader';
import UserNotFound from '../../components/profile/UserNotFound';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

type ProfilePageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { id } = await params;

  const profile = await getProfileData(id);
  if (!profile) {
    return <UserNotFound />;
  }
  const currentUser = await getSessionUser();
  const currentUserId = currentUser?.id?.toString() || '';

  const isMyPage = currentUserId === id;

  return (
    <div className="min-h-screen text-slate-900">
      <div className="flex">
        <main className="flex-1 min-h-screen">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-8">
            <ProfileHeader profile={profile} isMyPage={isMyPage} />
            <div className="mt-8">
              <ProfileContent userId={id} isMyPage={isMyPage} />
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
  if (!json.resultCode || res.status !== 200) {
    return null;
  }
  return json.data;
}
