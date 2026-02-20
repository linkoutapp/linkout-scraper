import { createProject } from '../actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function NewWaitlistPage() {
  return (
    <div className="p-8 max-w-3xl">
      <form action={createProject} className="space-y-10">
        {/* Waitlist Name */}
        <div className="grid grid-cols-[1fr_1fr] gap-12 items-start">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Waitlist Name</h2>
            <p className="text-sm text-gray-500 mt-1">
              This shows up to Signups in the no-code widget, when they sign up, and in any emails.
            </p>
          </div>
          <Input
            name="name"
            type="text"
            required
            placeholder="My Waitlist Name"
          />
        </div>

        {/* Waitlist URL */}
        <div className="grid grid-cols-[1fr_1fr] gap-12 items-start">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Waitlist URL</h2>
            <p className="text-sm text-gray-500 mt-1">
              If you&apos;re using a Waitlist no-code widget or the API, then write the exact URL where you will host your Waitlist. Leave it blank if you&apos;re going to use a hosted page from Waitlist.
            </p>
          </div>
          <Input
            name="waitlistUrl"
            type="url"
            placeholder="https://example.com"
          />
        </div>

        {/* Spots Skipped on Referral */}
        <div className="grid grid-cols-[1fr_1fr] gap-12 items-start">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Spots Skipped on Referral</h2>
            <p className="text-sm text-gray-500 mt-1">
              When one Signup refers another, then let the first Signup skip ahead in the Waitlist. This setting specifies how many spots to move ahead by.
            </p>
          </div>
          <Input
            name="spotsSkippedOnReferral"
            type="number"
            defaultValue={3}
            min={0}
          />
        </div>

        {/* Email New Signups */}
        <div className="grid grid-cols-[1fr_auto] gap-12 items-start">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Email New Signups</h2>
            <p className="text-sm text-gray-500 mt-1">
              New Signups on your Waitlist will receive an email containing their referral link and Waitlist status.
            </p>
          </div>
          <input
            name="emailNewSignups"
            type="checkbox"
            defaultChecked
            className="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
          />
        </div>

        {/* Verify Signups by Email */}
        <div className="grid grid-cols-[1fr_auto] gap-12 items-start">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Verify Signups by Email</h2>
            <p className="text-sm text-gray-500 mt-1">
              New Signups on your Waitlist will receive a verification email. Verification status will be shown in any CSV export.
            </p>
          </div>
          <input
            name="verifySignups"
            type="checkbox"
            className="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
          />
        </div>

        {/* Submit */}
        <div className="pt-2">
          <Button type="submit" size="lg">
            Create Waitlist
          </Button>
        </div>
      </form>
    </div>
  );
}
