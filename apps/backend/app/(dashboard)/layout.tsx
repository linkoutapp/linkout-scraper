import Link from 'next/link';
import { Home, UserCircle, PlusCircle, List, Zap } from 'lucide-react';
import { getProjects } from '@/lib/db/queries';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const projects = await getProjects(userId);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-56 border-r border-gray-200 flex flex-col shrink-0">
        {/* Logo */}
        <div className="px-5 py-5">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="flex items-center justify-center h-7 w-7 rounded-lg" style={{ background: '#E4F222' }}>
              <Zap className="h-4 w-4" style={{ color: '#1C1B18', fill: '#1C1B18' }} />
            </span>
            <span className="text-lg font-semibold text-gray-900">w8list</span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="px-3 flex flex-col gap-0.5">
          <NavItem href="/dashboard" icon={<Home className="h-4 w-4" />} label="Home" />
          <NavItem href="/dashboard/account" icon={<UserCircle className="h-4 w-4" />} label="My Account" />
          <NavItem href="/dashboard/new" icon={<PlusCircle className="h-4 w-4" />} label="New Waitlist" />
        </nav>

        {/* Waitlists */}
        <div className="mt-6 px-5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2">Waitlists</p>
        </div>
        <nav className="px-3 flex flex-col gap-0.5 overflow-y-auto">
          {projects.map((p) => (
            <NavItem
              key={p.id}
              href={`/dashboard/${p.slug}`}
              icon={<List className="h-4 w-4" />}
              label={p.name}
            />
          ))}
        </nav>

        <div className="flex-1" />
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto bg-background">
        {children}
      </main>
    </div>
  );
}

function NavItem({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
    >
      <span className="text-gray-500">{icon}</span>
      {label}
    </Link>
  );
}
