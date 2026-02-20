'use client';

import { useState } from 'react';
import { Search, Upload, AlertTriangle, X, UserPlus, FileText, Puzzle, ArrowRight, Copy, Trash2 } from 'lucide-react';
import type { Project, Signup } from '@/lib/db/schema';
import { CopyButton } from './copy-button';
import { ExportButton } from './export-button';
import { updateProject, deleteProject } from '../actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Tab = 'signups' | 'widget' | 'settings';
type SignupSubTab = 'all' | 'import-export';

export function WaitlistDetail({
  project,
  signups,
  count,
  embedCode,
}: {
  project: Project;
  signups: Signup[];
  count: number;
  embedCode: string;
}) {
  const [activeTab, setActiveTab] = useState<Tab>('signups');
  const [subTab, setSubTab] = useState<SignupSubTab>('all');
  const [search, setSearch] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const filtered = signups.filter(
    (s) =>
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      (s.name && s.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="flex flex-col h-full">
      {/* Top tabs */}
      <div className="border-b border-gray-200 px-8 pt-4 flex gap-6">
        <TabButton active={activeTab === 'signups'} onClick={() => setActiveTab('signups')}>
          Signups
        </TabButton>
        <TabButton active={activeTab === 'widget'} onClick={() => setActiveTab('widget')}>
          Widget Builder
        </TabButton>
        <TabButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')}>
          Settings
        </TabButton>
      </div>

      {activeTab === 'signups' && count === 0 && (
        <NoSignupsYet project={project} />
      )}

      {activeTab === 'signups' && count > 0 && (
        <div className="flex-1 flex flex-col">
          {/* Sub-tabs + search + actions */}
          <div className="px-8 pt-4 pb-3 flex items-center justify-between">
            <div className="flex gap-4">
              <SubTabButton active={subTab === 'all'} onClick={() => { setSubTab('all'); setSelected(new Set()); }}>
                All Signups
              </SubTabButton>
              <SubTabButton active={subTab === 'import-export'} onClick={() => { setSubTab('import-export'); setSelected(new Set()); }}>
                Import and Export
              </SubTabButton>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search Signups"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 pr-3 h-8 w-56"
                />
              </div>
            </div>
          </div>

          {subTab === 'all' && (
            <div className="flex-1 overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-y border-gray-200 bg-gray-50/50">
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Position</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Email</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Joined</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Referred</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Referrals Made</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center text-gray-400">
                        No signups match your search.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((signup) => (
                      <tr key={signup.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-gray-700">{signup.position}</td>
                        <td className="px-4 py-3 text-gray-900">{signup.email}</td>
                        <td className="px-4 py-3 text-gray-600">{new Date(signup.createdAt).toISOString().split('T')[0]}</td>
                        <td className="px-4 py-3 text-gray-600">{signup.referredBy ? 'Yes' : 'No'}</td>
                        <td className="px-4 py-3 text-gray-600">0</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {subTab === 'import-export' && (
            <div className="p-8 flex gap-4">
              <ExportButton signups={signups} projectName={project.name} />
              <Button variant="outline" size="sm" asChild>
                <label className="cursor-pointer">
                  <Upload className="mr-1 h-4 w-4" />
                  Import CSV
                  <input type="file" accept=".csv" className="hidden" />
                </label>
              </Button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'widget' && (
        <div className="p-8 max-w-3xl space-y-8">
          {/* Embed Code */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Embed Code</h2>
            <p className="text-sm text-gray-500 mb-4">
              Paste this snippet into your website&apos;s HTML to show the waitlist signup form.
            </p>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <code className="block text-sm font-mono text-gray-800 break-all whitespace-pre-wrap mb-3">
                {embedCode}
              </code>
              <CopyButton text={embedCode} label="Get Embed Code" />
            </div>
          </div>

          {/* Live Preview */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Preview</h2>
            <p className="text-sm text-gray-500 mb-4">
              This is how the widget will look on your site.
            </p>
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', maxWidth: 400 }}>
                <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 rounded-md border border-gray-300 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15"
                    readOnly
                  />
                  <button
                    type="button"
                    className="whitespace-nowrap rounded-md px-5 py-2.5 text-sm font-medium text-white"
                    style={{ background: '#111827' }}
                  >
                    Join Waitlist
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
      {activeTab === 'settings' && (
        <div className="p-8 max-w-3xl space-y-10">
          {/* General */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-6">General</h2>
            <form action={updateProject} className="space-y-8">
              <input type="hidden" name="projectId" value={project.id} />

              {/* Waitlist ID */}
              <div className="grid grid-cols-[1fr_1fr] gap-12 items-start border-b border-gray-100 pb-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Waitlist ID</h3>
                  <p className="text-sm text-gray-500 mt-1">The public ID for your Waitlist</p>
                </div>
                <p className="text-sm text-gray-700 py-2">{project.slug}</p>
              </div>

              {/* Waitlist URL */}
              <div className="grid grid-cols-[1fr_1fr] gap-12 items-start border-b border-gray-100 pb-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Waitlist URL</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    If you&apos;re using a Waitlist no-code widget or the API, then write the exact URL where you will host your Waitlist. Leave it blank if you&apos;re going to use a hosted page from us.
                  </p>
                </div>
                <Input
                  name="waitlistUrl"
                  type="url"
                  defaultValue={project.waitlistUrl || ''}
                  placeholder="https://example.com"
                />
              </div>

              {/* Waitlist Name */}
              <div className="grid grid-cols-[1fr_1fr] gap-12 items-start border-b border-gray-100 pb-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Waitlist Name</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    This shows up to Signups in the no-code widget, when they sign up, and in any emails.
                  </p>
                </div>
                <Input
                  name="name"
                  type="text"
                  defaultValue={project.name}
                />
              </div>

              {/* Email New Signups */}
              <div className="grid grid-cols-[1fr_1fr] gap-12 items-start border-b border-gray-100 pb-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Email New Signups</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    New signups on your waitlist will receive an email containing their referral link and waitlist status.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer mt-2">
                  <input type="hidden" name="emailNewSignups" value="false" />
                  <input
                    type="checkbox"
                    name="emailNewSignups"
                    defaultChecked={project.emailNewSignups}
                    value="true"
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#1C1B18]"></div>
                </label>
              </div>

              {/* Verify Signups by Email */}
              <div className="grid grid-cols-[1fr_1fr] gap-12 items-start border-b border-gray-100 pb-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Verify Signups by Email</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    New signups on your waitlist will receive a verification email. Verification status will be shown in any CSV export.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer mt-2">
                  <input type="hidden" name="verifySignups" value="false" />
                  <input
                    type="checkbox"
                    name="verifySignups"
                    defaultChecked={project.verifySignups}
                    value="true"
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#1C1B18]"></div>
                </label>
              </div>

              <Button type="submit">
                Save Changes
              </Button>
            </form>
          </div>

          {/* Delete */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Delete</h2>
            <div className="flex items-start justify-between gap-8 border-t border-gray-100 pt-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Delete Waitlist</h3>
                <p className="text-sm text-gray-500 mt-1">
                  All of the data for this waitlist will be permanently removed from our servers. This action cannot be undone.
                </p>
              </div>
              <Button
                variant="destructive"
                type="button"
                onClick={() => setShowDeleteModal(true)}
              >
                Delete Waitlist
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowDeleteModal(false)} />
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowDeleteModal(false)}
              className="absolute top-4 right-4"
            >
              <X className="h-5 w-5" />
            </Button>
            <div className="flex items-start gap-3 mb-4">
              <div className="shrink-0 mt-0.5 flex items-center justify-center h-8 w-8 rounded-full bg-red-100">
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">Delete Waitlist</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Are you sure you want to delete this waitlist? All of the data for this waitlist will be permanently removed from our servers forever. This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="outline"
                type="button"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </Button>
              <form action={deleteProject}>
                <input type="hidden" name="projectId" value={project.id} />
                <Button variant="destructive" type="submit">
                  Delete Waitlist
                </Button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
        active
          ? 'border-gray-900 text-gray-900'
          : 'border-transparent text-gray-500 hover:text-gray-700'
      }`}
    >
      {children}
    </button>
  );
}

function NoSignupsYet({ project }: { project: Project }) {
  const [copied, setCopied] = useState(false);
  const [urlCopied, setUrlCopied] = useState(false);

  const shareUrl = `${window.location.origin}/waitlist/${project.slug}`;

  function copyToClipboard(text: string, type: 'id' | 'url') {
    navigator.clipboard.writeText(text);
    if (type === 'id') {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else {
      setUrlCopied(true);
      setTimeout(() => setUrlCopied(false), 2000);
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="w-full max-w-lg py-16 flex flex-col items-center">
        <div className="mb-4">
          <UserPlus className="h-8 w-8" style={{ color: '#1C1B18' }} />
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">No Signups Yet</h2>
        <p className="text-sm text-gray-500 mb-8">
          Your waitlist is almost ready. Here are next steps to get it ready for launch.
        </p>

        {/* Waitlist ID */}
        <div className="w-full rounded-lg border border-gray-200 flex items-center mb-3 overflow-hidden">
          <span className="text-xs font-semibold px-4 py-3 whitespace-nowrap" style={{ background: '#E4F22230', color: '#1C1B18' }}>
            Waitlist ID
          </span>
          <span className="flex-1 px-4 py-3 text-sm text-gray-900 font-medium">{project.slug}</span>
          <button
            onClick={() => copyToClipboard(project.slug, 'id')}
            className="flex items-center gap-1.5 px-4 py-3 text-sm font-medium hover:bg-gray-50 transition-colors border-l border-gray-200"
            style={{ color: '#1C1B18' }}
          >
            {copied ? 'Copied!' : 'Copy'}
            <Copy className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Action links */}
        <ActionLink icon={<FileText className="h-5 w-5" style={{ color: '#1C1B18' }} />} label="Documentation" href="/dashboard/docs" />
        <ActionLink icon={<Puzzle className="h-5 w-5" style={{ color: '#1C1B18' }} />} label="Widget Builder" onClick={() => {}} />
        <ActionLink icon={<UserPlus className="h-5 w-5" style={{ color: '#1C1B18' }} />} label="Import Users" onClick={() => {}} />

        {/* Share URL */}
        <p className="text-sm mt-6 mb-3" style={{ color: '#1C1B18' }}>Or share your waitlist</p>
        <div className="w-full rounded-lg border border-gray-200 flex items-center overflow-hidden">
          <span className="flex-1 px-4 py-3 text-sm text-gray-600 truncate">{shareUrl}</span>
          <button
            onClick={() => copyToClipboard(shareUrl, 'url')}
            className="text-white text-sm font-medium hover:opacity-90 px-5 py-3 whitespace-nowrap"
            style={{ background: '#1C1B18' }}
          >
            {urlCopied ? 'Copied!' : 'Copy URL'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ActionLink({ icon, label, href, onClick }: { icon: React.ReactNode; label: string; href?: string; onClick?: () => void }) {
  const Tag = href ? 'a' : 'button';
  return (
    <Tag
      href={href}
      onClick={onClick}
      className="w-full rounded-lg border border-gray-200 flex items-center px-4 py-3.5 mb-3 hover:bg-gray-50 transition-colors text-left"
    >
      <span className="mr-3">{icon}</span>
      <span className="flex-1 text-sm font-medium text-gray-900">{label}</span>
      <ArrowRight className="h-4 w-4 text-gray-400" />
    </Tag>
  );
}

function SubTabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`text-sm font-medium pb-1 border-b-2 transition-colors ${
        active
          ? 'border-gray-900 text-gray-900'
          : 'border-transparent text-gray-400 hover:text-gray-600'
      }`}
    >
      {children}
    </button>
  );
}
