import { getProjects } from '@/lib/db/queries';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const projects = await getProjects(userId);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-gray-900">All Waitlists</h1>
        <Button asChild>
          <Link href="/dashboard/new">New Waitlist</Link>
        </Button>
      </div>

      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50/50">
              <th className="text-left px-6 py-3 font-medium text-gray-500">Waitlist Name</th>
              <th className="text-left px-6 py-3 font-medium text-gray-500">Created At</th>
              <th className="text-left px-6 py-3 font-medium text-gray-500">Total Signups</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {projects.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-12 text-center text-gray-400">
                  No waitlists yet. Create one to get started.
                </td>
              </tr>
            ) : (
              projects.map((project) => (
                <tr key={project.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <Link href={`/dashboard/${project.slug}`} className="text-blue-600 hover:underline font-medium">
                      {project.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {new Date(project.createdAt).toISOString().split('T')[0]}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {project.signupCount}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
