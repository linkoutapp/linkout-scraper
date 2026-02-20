'use server';

import { eq, inArray } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { projects, signups } from '@/lib/db/schema';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import crypto from 'crypto';

function generateSlug(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  const suffix = crypto.randomBytes(3).toString('hex');
  return `${base}-${suffix}`;
}

export async function createProject(formData: FormData) {
  const { userId } = await auth();
  if (!userId) {
    redirect('/sign-in');
  }

  const name = formData.get('name') as string;
  if (!name || name.trim().length === 0) {
    redirect('/dashboard/new');
  }

  const spotsSkippedOnReferral = parseInt(formData.get('spotsSkippedOnReferral') as string) || 3;
  const emailNewSignups = formData.get('emailNewSignups') === 'on';
  const verifySignups = formData.get('verifySignups') === 'on';

  const slug = generateSlug(name.trim());

  const [project] = await db
    .insert(projects)
    .values({
      userId,
      name: name.trim(),
      slug,
      spotsSkippedOnReferral,
      emailNewSignups,
      verifySignups,
    })
    .returning();

  redirect(`/dashboard/${project.slug}`);
}

export async function updateProject(formData: FormData) {
  const { userId } = await auth();
  if (!userId) {
    redirect('/sign-in');
  }

  const projectId = Number(formData.get('projectId'));
  const name = (formData.get('name') as string)?.trim();
  const waitlistUrl = (formData.get('waitlistUrl') as string)?.trim() || null;

  const project = await db
    .select()
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1);

  if (project.length === 0 || project[0].userId !== userId) {
    redirect('/dashboard');
  }

  const emailNewSignupsRaw = formData.get('emailNewSignups');
  const verifySignupsRaw = formData.get('verifySignups');

  const updates: Record<string, any> = {};
  if (name && name.length > 0) updates.name = name;
  if (waitlistUrl !== undefined) updates.waitlistUrl = waitlistUrl;
  if (emailNewSignupsRaw !== null) updates.emailNewSignups = emailNewSignupsRaw === 'on' || emailNewSignupsRaw === 'true';
  if (verifySignupsRaw !== null) updates.verifySignups = verifySignupsRaw === 'on' || verifySignupsRaw === 'true';

  if (Object.keys(updates).length > 0) {
    await db.update(projects).set(updates).where(eq(projects.id, projectId));
  }

  redirect(`/dashboard/${project[0].slug}`);
}

export async function deleteProject(formData: FormData) {
  const { userId } = await auth();
  if (!userId) {
    redirect('/sign-in');
  }

  const projectId = Number(formData.get('projectId'));

  const project = await db
    .select()
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1);

  if (project.length === 0 || project[0].userId !== userId) {
    redirect('/dashboard');
  }

  // Delete signups first, then project
  await db.delete(signups).where(eq(signups.projectId, projectId));
  await db.delete(projects).where(eq(projects.id, projectId));

  redirect('/dashboard');
}

export async function bulkOffboardSignups(signupIds: number[]) {
  const { userId } = await auth();
  if (!userId) return { error: 'Not authenticated' };
  if (signupIds.length === 0) return { error: 'No signups selected' };

  await db
    .update(signups)
    .set({ offboarded: true })
    .where(inArray(signups.id, signupIds));

  return { success: true };
}

export async function bulkDeleteSignups(signupIds: number[]) {
  const { userId } = await auth();
  if (!userId) return { error: 'Not authenticated' };
  if (signupIds.length === 0) return { error: 'No signups selected' };

  await db.delete(signups).where(inArray(signups.id, signupIds));

  return { success: true };
}
