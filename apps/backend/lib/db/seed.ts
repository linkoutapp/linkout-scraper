import { db } from './drizzle';
import { projects, signups } from './schema';
import crypto from 'crypto';

async function seed() {
  console.log('Seeding database...');

  // Use a placeholder Clerk userId — replace with your real Clerk userId after signing in
  const clerkUserId = process.argv[2] || 'user_placeholder';

  const [project] = await db
    .insert(projects)
    .values({
      userId: clerkUserId,
      name: 'My App Waitlist',
      slug: 'my-app-waitlist',
    })
    .returning();

  console.log(`Project created: ${project.name} (${project.slug})`);

  const sampleEmails = [
    'alice@example.com',
    'bob@example.com',
    'carol@example.com',
    'dave@example.com',
    'eve@example.com',
  ];

  for (let i = 0; i < sampleEmails.length; i++) {
    const refCode = crypto.randomBytes(6).toString('hex');
    await db.insert(signups).values({
      projectId: project.id,
      email: sampleEmails[i],
      name: sampleEmails[i].split('@')[0],
      referralCode: refCode,
      referredBy: i > 0 ? 'seed' : null,
      position: i + 1,
    });
  }

  console.log(`${sampleEmails.length} sample signups created.`);
  console.log('\nSign in with Clerk to access the dashboard.');
}

seed()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(() => {
    console.log('Done.');
    process.exit(0);
  });
