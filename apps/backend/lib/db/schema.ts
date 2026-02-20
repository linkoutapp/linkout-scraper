import {
  pgTable,
  text,
  integer,
  serial,
  boolean,
  timestamp,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const projects = pgTable('projects', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  waitlistUrl: text('waitlist_url'),
  spotsSkippedOnReferral: integer('spots_skipped_on_referral').notNull().default(3),
  emailNewSignups: boolean('email_new_signups').notNull().default(true),
  verifySignups: boolean('verify_signups').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const signups = pgTable('signups', {
  id: serial('id').primaryKey(),
  projectId: integer('project_id').notNull().references(() => projects.id),
  email: text('email').notNull(),
  name: text('name'),
  referralCode: text('referral_code').notNull(),
  referredBy: text('referred_by'),
  position: integer('position').notNull(),
  offboarded: boolean('offboarded').notNull().default(false),
  verified: boolean('verified').notNull().default(false),
  verificationToken: text('verification_token'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Relations
export const projectsRelations = relations(projects, ({ many }) => ({
  signups: many(signups),
}));

export const signupsRelations = relations(signups, ({ one }) => ({
  project: one(projects, {
    fields: [signups.projectId],
    references: [projects.id],
  }),
}));

// Types
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type Signup = typeof signups.$inferSelect;
export type NewSignup = typeof signups.$inferInsert;
