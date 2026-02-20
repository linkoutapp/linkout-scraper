import { Zap, CheckCircle, XCircle } from 'lucide-react';

export default async function VerifiedPage({ searchParams }: { searchParams: Promise<{ status?: string; email?: string }> }) {
  const params = await searchParams;
  const success = params.status === 'success';
  const email = params.email || '';

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm text-center px-6">
        <div className="mb-6 inline-flex items-center justify-center h-12 w-12 rounded-xl" style={{ background: '#E4F222' }}>
          <Zap className="h-6 w-6" style={{ color: '#1C1B18', fill: '#1C1B18' }} />
        </div>
        {success ? (
          <>
            <div className="mb-4 inline-flex items-center justify-center h-10 w-10 rounded-full bg-green-100">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Email Verified</h1>
            <p className="text-sm text-gray-500">
              {email ? `${email} has been verified.` : 'Your email has been verified.'} Your spot on the waitlist is confirmed.
            </p>
          </>
        ) : (
          <>
            <div className="mb-4 inline-flex items-center justify-center h-10 w-10 rounded-full bg-red-100">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Invalid or Expired Link</h1>
            <p className="text-sm text-gray-500">
              This verification link is no longer valid. It may have already been used or expired.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
