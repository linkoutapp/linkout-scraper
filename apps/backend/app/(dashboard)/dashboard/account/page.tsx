import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import AccountClient from './account-client';

export default async function AccountPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress || '';

  return <AccountClient email={email} />;
}
