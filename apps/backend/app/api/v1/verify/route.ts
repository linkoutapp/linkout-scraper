import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { signups } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');

  if (!token) {
    return NextResponse.json({ error: 'Token required' }, { status: 400 });
  }

  // Find signup with this token
  const [signup] = await db
    .select()
    .from(signups)
    .where(and(eq(signups.verificationToken, token), eq(signups.verified, false)))
    .limit(1);

  if (!signup) {
    // Already verified or invalid token
    const host = request.headers.get('host') || 'localhost:3001';
    const proto = request.headers.get('x-forwarded-proto') || 'https';
    return NextResponse.redirect(`${proto}://${host}/verified?status=invalid`);
  }

  // Mark as verified, clear token
  await db
    .update(signups)
    .set({ verified: true, verificationToken: null })
    .where(eq(signups.id, signup.id));

  const host = request.headers.get('host') || 'localhost:3001';
  const proto = request.headers.get('x-forwarded-proto') || 'https';
  return NextResponse.redirect(`${proto}://${host}/verified?status=success&email=${encodeURIComponent(signup.email)}`);
}
