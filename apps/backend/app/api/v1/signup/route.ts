import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { projects, signups } from '@/lib/db/schema';
import { eq, count } from 'drizzle-orm';
import crypto from 'crypto';
import { sendWelcomeEmail, sendVerificationEmail } from '@/lib/email';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, projectSlug, referredBy } = body;

    if (!email || !projectSlug) {
      return NextResponse.json(
        { error: 'email and projectSlug are required' },
        { status: 400, headers: corsHeaders }
      );
    }

    const project = await db
      .select()
      .from(projects)
      .where(eq(projects.slug, projectSlug))
      .limit(1);

    if (project.length === 0) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404, headers: corsHeaders }
      );
    }

    const proj = project[0];
    const projectId = proj.id;

    // Check for duplicate
    const existing = await db
      .select()
      .from(signups)
      .where(eq(signups.projectId, projectId))
      .limit(1000);

    const duplicate = existing.find(s => s.email === email);
    if (duplicate) {
      return NextResponse.json(
        {
          message: 'Already on the waitlist!',
          position: duplicate.position,
          referralCode: duplicate.referralCode,
          total: existing.length,
        },
        { status: 200, headers: corsHeaders }
      );
    }

    // Get current count for position
    const [{ count: currentCount }] = await db
      .select({ count: count() })
      .from(signups)
      .where(eq(signups.projectId, projectId));

    const position = (currentCount ?? 0) + 1;
    const referralCode = crypto.randomBytes(6).toString('hex');
    const verificationToken = proj.verifySignups ? crypto.randomBytes(16).toString('hex') : null;

    const [signup] = await db
      .insert(signups)
      .values({
        projectId,
        email,
        name: name || null,
        referralCode,
        referredBy: referredBy || null,
        position,
        verified: !proj.verifySignups,
        verificationToken,
      })
      .returning();

    // Send emails (non-blocking)
    const baseUrl = `${request.headers.get('x-forwarded-proto') || 'https'}://${request.headers.get('host')}`;
    const waitlistUrl = proj.waitlistUrl || `${baseUrl}/waitlist/${proj.slug}`;

    if (proj.emailNewSignups) {
      sendWelcomeEmail({
        to: email,
        projectName: proj.name,
        position,
        referralCode,
        waitlistUrl,
      });
    }

    if (proj.verifySignups && verificationToken) {
      sendVerificationEmail({
        to: email,
        projectName: proj.name,
        verificationToken,
        baseUrl,
      });
    }

    return NextResponse.json({
      message: "You're on the waitlist!",
      position: signup.position,
      referralCode: signup.referralCode,
      total: position,
      verified: signup.verified,
    }, { status: 201, headers: corsHeaders });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}
