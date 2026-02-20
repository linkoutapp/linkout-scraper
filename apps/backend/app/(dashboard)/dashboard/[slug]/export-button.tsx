'use client';

import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import type { Signup } from '@/lib/db/schema';

export function ExportButton({ signups, projectName }: { signups: Signup[]; projectName: string }) {
  function handleExport() {
    const headers = ['Email', 'Name', 'Position', 'Referral Code', 'Referred By', 'Verified', 'Offboarded', 'Signed Up'];
    const rows = signups.map(s => [
      s.email,
      s.name || '',
      String(s.position),
      s.referralCode,
      s.referredBy || '',
      s.verified ? 'Yes' : 'No',
      s.offboarded ? 'Yes' : 'No',
      s.createdAt,
    ]);

    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName}-signups.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Button variant="outline" size="sm" onClick={handleExport}>
      <Download className="mr-1 h-4 w-4" />
      Export CSV
    </Button>
  );
}
