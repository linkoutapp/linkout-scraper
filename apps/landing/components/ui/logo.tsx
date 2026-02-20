import Link from "next/link";
import { Zap } from "lucide-react";

export default function Logo() {
  return (
    <Link href="/" className="inline-flex items-center gap-2" aria-label="w8list">
      <span className="flex items-center justify-center h-7 w-7 rounded-lg" style={{ background: '#E4F222' }}>
        <Zap className="h-4 w-4" style={{ color: '#1C1B18', fill: '#1C1B18' }} />
      </span>
      <span className="text-lg font-bold text-gray-900">w8list</span>
    </Link>
  );
}
