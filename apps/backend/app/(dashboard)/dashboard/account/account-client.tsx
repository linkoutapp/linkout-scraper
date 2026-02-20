'use client';

import { useClerk } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LogOut, Trash2, Mail, Lock, X } from 'lucide-react';
import { useState } from 'react';

export default function AccountClient({ email }: { email: string }) {
  const { signOut, openUserProfile } = useClerk();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  const handleDelete = () => {
    if (confirmText === 'DELETE MY ACCOUNT') {
      openUserProfile();
      setShowDeleteModal(false);
      setConfirmText('');
    }
  };

  return (
    <>
      <div className="mx-auto max-w-2xl px-8 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">My Account</h1>

        <div className="space-y-6">
          {/* Email */}
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Email Address</p>
                  <p className="mt-1 text-sm text-gray-500">Current: {email}</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => openUserProfile()}
              >
                Change Email
              </Button>
            </div>
          </div>

          {/* Password */}
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <Lock className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Password</p>
                  <p className="mt-1 text-sm text-gray-500">Change your account password</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => openUserProfile()}
              >
                Change Password
              </Button>
            </div>
          </div>

          {/* Log Out */}
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <LogOut className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Log Out</p>
                  <p className="mt-1 text-sm text-gray-500">Sign out of your account</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => signOut({ redirectUrl: '/sign-in' })}
              >
                Log Out
              </Button>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="rounded-lg border border-red-200 bg-white p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <Trash2 className="h-5 w-5 text-red-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Danger Zone</p>
                  <p className="mt-1 text-sm text-gray-500">Once you delete your account, there is no going back. Please be certain.</p>
                </div>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowDeleteModal(true)}
              >
                Delete Account
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => { setShowDeleteModal(false); setConfirmText(''); }}
          />
          <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
            <button
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
              onClick={() => { setShowDeleteModal(false); setConfirmText(''); }}
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Delete Account</h2>
            </div>

            <p className="text-sm text-gray-600 mb-1">
              This will permanently delete your account and all associated data including waitlists, signups, and settings.
            </p>
            <p className="text-sm text-gray-600 mb-4">
              This action cannot be undone.
            </p>

            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type <span className="font-mono text-red-600">DELETE MY ACCOUNT</span> to confirm
            </label>
            <Input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="DELETE MY ACCOUNT"
              className="mb-4"
            />

            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setShowDeleteModal(false); setConfirmText(''); }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={confirmText !== 'DELETE MY ACCOUNT'}
                onClick={handleDelete}
              >
                Delete My Account
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
