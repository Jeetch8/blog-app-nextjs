import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  console.log(session);
  redirect(
    '/profile/@' + encodeURIComponent(session?.user?.username as string)
  );
}
