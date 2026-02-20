import { db } from '@/lib/db/drizzle';
import { projects } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { WaitlistForm } from './waitlist-form';

export default async function WaitlistPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const project = await db
    .select({ id: projects.id, name: projects.name, slug: projects.slug })
    .from(projects)
    .where(eq(projects.slug, slug))
    .limit(1);

  if (project.length === 0) notFound();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">{project[0].name}</h1>
            <p className="text-sm text-gray-500 mt-2">Join the waitlist to get early access.</p>
          </div>
          <WaitlistForm slug={project[0].slug} />
        </div>
        <p className="text-center text-xs text-gray-400 mt-6">
          Powered by <span className="font-semibold">w8list</span>
        </p>
      </div>
    </div>
  );
}
