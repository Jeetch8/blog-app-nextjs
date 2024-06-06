import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@prisma_client/prisma';
import ProfileForm from './ProfileForm';
import { getUserProfilePageInfo } from '@/db_access/user';

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  const user = await getUserProfilePageInfo(session?.user?.username!);
  if (!user || !user.profile || user.profile === null) {
    return <div>User not found</div>;
  }

  return <ProfileForm initialData={user} />;
}
