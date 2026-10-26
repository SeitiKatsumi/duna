// Intentionally empty by default.
// Add Drizzle tables here when the site actually needs a database.
// See examples/d1/db/schema.ts for an opt-in example.
import {sqliteTable,text,integer,index} from 'drizzle-orm/sqlite-core';
export const leads=sqliteTable('leads',{
 id:text('id').primaryKey(), createdAt:integer('created_at').notNull(), name:text('name').notNull(),clinic:text('clinic').notNull(),specialty:text('specialty').notNull(),phone:text('phone').notNull(),location:text('location').notNull(),period:text('period').notNull(),plan:text('plan').notNull(),source:text('source').notNull(),referrer:text('referrer').notNull(),consentVersion:text('consent_version').notNull(),crmStatus:text('crm_status').notNull().default('pending')
},t=>[index('idx_leads_created').on(t.createdAt)]);
export const settings=sqliteTable('settings',{key:text('key').primaryKey(),value:text('value').notNull()});
export const rateLimits=sqliteTable('rate_limits',{key:text('key').primaryKey(),count:integer('count').notNull(),expires:integer('expires').notNull()});
export const events=sqliteTable('events',{key:text('key').primaryKey(),count:integer('count').notNull()});
