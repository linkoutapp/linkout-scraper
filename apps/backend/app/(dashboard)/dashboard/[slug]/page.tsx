import { getProjectBySlug, getSignups, getSignupCount } from '@/lib/db/queries';
import { auth } from '@clerk/nextjs/server';
import { redirect, notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { WaitlistDetail } from './waitlist-detail';

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const { slug } = await params;
  const project = await getProjectBySlug(slug, userId);
  if (!project) notFound();

  const allSignups = await getSignups(project.id);
  const count = await getSignupCount(project.id);

  const headersList = await headers();
  const host = headersList.get('host') || 'localhost:3001';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const baseUrl = `${protocol}://${host}`;

  const embedCode = `<script src="${baseUrl}/embed.js" data-project="${project.slug}"></script>`;

  return (
    <WaitlistDetail
      project={project}
      signups={allSignups}
      count={count}
      embedCode={embedCode}
    />
  );
}
