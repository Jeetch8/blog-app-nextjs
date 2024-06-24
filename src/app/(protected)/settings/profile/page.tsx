import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import ProfileForm from './ProfileForm';
import { getUserProfilePageInfo } from '@/db_access/user';

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  const data = await getUserProfilePageInfo(session?.user?.username!);
  if (!data || !data.profiles || data.profiles === null) {
    return <div>User not found</div>;
  }

  return (
    <ProfileForm initialData={{ user: data.users, profiles: data.profiles }} />
  );
}
