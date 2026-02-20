import { db } from '@/lib/db/drizzle';
import { projects } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { WaitlistForm } from './waitlist-form';

export default async function WaitlistPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ embed?: string }>;
}) {
  const { slug } = await params;
  const { embed } = await searchParams;
  const isEmbed = embed === 'true';

  const project = await db
    .select({ id: projects.id, name: projects.name, slug: projects.slug })
    .from(projects)
    .where(eq(projects.slug, slug))
    .limit(1);

  if (project.length === 0) notFound();

  if (isEmbed) {
    return (
      <div className="p-4" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
        <div className="text-center mb-4">
          <h2 className="text-lg font-bold text-gray-900">{project[0].name}</h2>
          <p className="text-xs text-gray-500 mt-1">Join the waitlist to get early access.</p>
        </div>
        <WaitlistForm slug={project[0].slug} />
        <p className="text-center text-[10px] text-gray-400 mt-4">
          Powered by <span className="font-semibold">w8list</span>
        </p>
      </div>
    );
  }

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
