import { desc, eq, count, sql } from 'drizzle-orm';
import { db } from './drizzle';
import { projects, signups } from './schema';

export async function getProjects(userId: string) {
  const result = await db
    .select({
      id: projects.id,
      name: projects.name,
      slug: projects.slug,
      createdAt: projects.createdAt,
      signupCount: count(signups.id),
    })
    .from(projects)
    .leftJoin(signups, eq(projects.id, signups.projectId))
    .where(eq(projects.userId, userId))
    .groupBy(projects.id)
    .orderBy(desc(projects.createdAt));

  return result;
}

export async function getProjectBySlug(slug: string, userId: string) {
  const result = await db
    .select()
    .from(projects)
    .where(eq(projects.slug, slug))
    .limit(1);

  if (result.length === 0 || result[0].userId !== userId) {
    return null;
  }

  return result[0];
}

export async function getSignups(projectId: number) {
  return await db
    .select()
    .from(signups)
    .where(eq(signups.projectId, projectId))
    .orderBy(desc(signups.createdAt));
}

export async function getSignupCount(projectId: number) {
  const result = await db
    .select({ count: count() })
    .from(signups)
    .where(eq(signups.projectId, projectId));

  return result[0]?.count ?? 0;
}
