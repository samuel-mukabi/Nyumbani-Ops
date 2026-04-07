import { pgTable, serial, text, varchar, timestamp, boolean, integer, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const organizations = pgTable('organizations', {
  id: serial('id').primaryKey(),
  clerkId: varchar('clerk_id', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  clerkId: varchar('clerk_id', { length: 255 }).notNull().unique(),
  email: varchar('email', { length: 255 }).notNull(),
  firstName: varchar('first_name', { length: 255 }),
  lastName: varchar('last_name', { length: 255 }),
  role: varchar('role', { length: 50 }).notNull().default('host'), // host, manager, cleaner
  organizationId: varchar('organization_id', { length: 255 }), // Clerk Org ID
  phoneNumber: varchar('phone_number', { length: 20 }), // for clean payouts via M-Pesa
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const properties = pgTable('properties', {
  id: serial('id').primaryKey(),
  organizationId: varchar('organization_id', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  address: text('address'),
  kplcMeterNumber: varchar('kplc_meter_number', { length: 100 }),
  ttlockLockId: varchar('ttlock_lock_id', { length: 255 }),
  airbnbIcalUrl: text('airbnb_ical_url'),
  wifiName: varchar('wifi_name', { length: 255 }),
  wifiPassword: varchar('wifi_password', { length: 255 }),
  houseRules: text('house_rules'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const bookings = pgTable('bookings', {
  id: serial('id').primaryKey(),
  propertyId: integer('property_id').references(() => properties.id).notNull(),
  guestName: varchar('guest_name', { length: 255 }).notNull(),
  guestPhone: varchar('guest_phone', { length: 20 }), // For WhatsApp messages
  checkInDate: timestamp('check_in_date').notNull(),
  checkOutDate: timestamp('check_out_date').notNull(),
  source: varchar('source', { length: 50 }).notNull(), // airbnb, direct
  status: varchar('status', { length: 50 }).notNull(), // PENDING, CONFIRMED, CHECKED_IN, CHECKED_OUT, CANCELLED
  mpesaReceiptNumber: varchar('mpesa_receipt_number', { length: 100 }),
  checkoutRequestId: varchar('checkout_request_id', { length: 255 }), // from Safaricom STK Push
  etimsReceiptUrl: text('etims_receipt_url'),
  totalAmount: integer('total_amount'), // stored in KES (whole numbers usually)
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const tasks = pgTable('tasks', {
  id: serial('id').primaryKey(),
  propertyId: integer('property_id').references(() => properties.id).notNull(),
  bookingId: integer('booking_id').references(() => bookings.id),
  assignedTo: integer('assigned_to').references(() => users.id),
  taskType: varchar('task_type', { length: 50 }).notNull().default('cleaning'),
  status: varchar('status', { length: 50 }).notNull().default('pending'), // pending, in_progress, completed, verified
  photoUrls: jsonb('photo_urls'),
  mpesaB2cReceipt: varchar('mpesa_b2c_receipt', { length: 100 }),
  totalPayout: integer('total_payout'),
  createdAt: timestamp('created_at').defaultNow(),
  completedAt: timestamp('completed_at'),
});

// Relations
export const propertiesRelations = relations(properties, ({ many }) => ({
  bookings: many(bookings),
  tasks: many(tasks),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  property: one(properties, {
    fields: [bookings.propertyId],
    references: [properties.id],
  }),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  property: one(properties, {
    fields: [tasks.propertyId],
    references: [properties.id],
  }),
  booking: one(bookings, {
    fields: [tasks.bookingId],
    references: [bookings.id],
  }),
  assignee: one(users, {
    fields: [tasks.assignedTo],
    references: [users.id],
  }),
}));
