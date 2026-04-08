import { pgTable, serial, text, varchar, timestamp, integer, jsonb, numeric, date, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const organizations = pgTable('organizations', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).unique(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  authId: varchar('auth_id', { length: 255 }).unique(), // Supabase auth.uid(). Nullable for headless staff.
  email: varchar('email', { length: 255 }).notNull(),
  firstName: varchar('first_name', { length: 255 }),
  lastName: varchar('last_name', { length: 255 }),
  role: varchar('role', { length: 50 }).notNull().default('host'), // host, manager, cleaner
  organizationId: integer('organization_id').references(() => organizations.id),
  phoneNumber: varchar('phone_number', { length: 20 }), // for clean payouts via M-Pesa
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const properties = pgTable('properties', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').references(() => organizations.id).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  address: text('address'),
  area: varchar('area', { length: 100 }),
  sharedWifiRouterId: varchar('shared_wifi_router_id', { length: 255 }),
  securityContact: varchar('security_contact', { length: 100 }),
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
  organizationId: integer('organization_id').references(() => organizations.id),
  unitId: integer('unit_id'),
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
  grossAmount: integer('gross_amount'),
  platformFeeAmount: integer('platform_fee_amount').default(0),
  channel: varchar('channel', { length: 50 }),
  currency: varchar('currency', { length: 10 }).default('KES'),
  externalId: varchar('external_id', { length: 255 }),
  externalSource: varchar('external_source', { length: 50 }),
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

export const owners = pgTable('owners', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').references(() => organizations.id).notNull(),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 20 }),
  email: varchar('email', { length: 255 }),
  payoutMethod: varchar('payout_method', { length: 50 }).notNull().default('mpesa'),
  payoutDetails: jsonb('payout_details'),
  secureToken: varchar('secure_token', { length: 255 }).unique(),
  tokenExpiresAt: timestamp('token_expires_at'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const buildings = pgTable('buildings', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').references(() => organizations.id).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).unique(),
  address: text('address'),
  area: varchar('area', { length: 100 }),
  sharedWifiRouterId: varchar('shared_wifi_router_id', { length: 255 }),
  securityContact: varchar('security_contact', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const units = pgTable('units', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').references(() => organizations.id).notNull(),
  buildingId: integer('building_id').references(() => buildings.id).notNull(),
  ownerId: integer('owner_id').references(() => owners.id),
  unitCode: varchar('unit_code', { length: 100 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  listingUrl: text('listing_url'),
  channelListingId: varchar('channel_listing_id', { length: 255 }),
  kplcMeterNo: varchar('kplc_meter_no', { length: 100 }),
  ttlockDeviceId: varchar('ttlock_device_id', { length: 255 }),
  status: varchar('status', { length: 50 }).notNull().default('active'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const unitContracts = pgTable('unit_contracts', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').references(() => organizations.id).notNull(),
  unitId: integer('unit_id').references(() => units.id).notNull(),
  model: varchar('model', { length: 20 }).notNull(),
  commissionPercent: numeric('commission_percent', { precision: 5, scale: 2 }),
  monthlyRent: integer('monthly_rent'),
  leaseStart: date('lease_start'),
  leaseEnd: date('lease_end'),
  activeFrom: date('active_from').notNull(),
  activeTo: date('active_to'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const ownerStatements = pgTable('owner_statements', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').references(() => organizations.id).notNull(),
  ownerId: integer('owner_id').references(() => owners.id).notNull(),
  statementMonth: date('statement_month').notNull(),
  currency: varchar('currency', { length: 10 }).notNull().default('KES'),
  grossRevenue: integer('gross_revenue').notNull().default(0),
  platformFees: integer('platform_fees').notNull().default(0),
  cleaningFees: integer('cleaning_fees').notNull().default(0),
  maintenanceCosts: integer('maintenance_costs').notNull().default(0),
  utilityCosts: integer('utility_costs').notNull().default(0),
  transactionFees: integer('transaction_fees').notNull().default(0),
  agencyCommission: integer('agency_commission').notNull().default(0),
  netOwnerPayout: integer('net_owner_payout').notNull().default(0),
  status: varchar('status', { length: 50 }).notNull().default('draft'),
  generatedAt: timestamp('generated_at').defaultNow(),
  finalizedAt: timestamp('finalized_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const ownerStatementLines = pgTable('owner_statement_lines', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').references(() => organizations.id).notNull(),
  statementId: integer('statement_id').references(() => ownerStatements.id).notNull(),
  ownerId: integer('owner_id').references(() => owners.id).notNull(),
  unitId: integer('unit_id').references(() => units.id),
  bookingId: integer('booking_id').references(() => bookings.id),
  lineType: varchar('line_type', { length: 50 }).notNull(),
  description: text('description'),
  amount: integer('amount').notNull(),
  occurredAt: timestamp('occurred_at'),
  referenceType: varchar('reference_type', { length: 50 }),
  referenceId: integer('reference_id'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const complianceExpenses = pgTable('compliance_expenses', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').references(() => organizations.id).notNull(),
  propertyId: integer('property_id').references(() => properties.id),
  unitId: integer('unit_id').references(() => units.id),
  expenseDate: date('expense_date').notNull(),
  category: varchar('category', { length: 100 }).notNull(),
  amount: integer('amount').notNull(),
  currency: varchar('currency', { length: 10 }).notNull().default('KES'),
  vendorName: varchar('vendor_name', { length: 255 }),
  etimsReceiptNumber: varchar('etims_receipt_number', { length: 100 }),
  etimsReceiptUrl: text('etims_receipt_url'),
  notes: text('notes'),
  createdByUserId: integer('created_by_user_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const complianceMonthClosures = pgTable('compliance_month_closures', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').references(() => organizations.id).notNull(),
  monthKey: varchar('month_key', { length: 7 }).notNull(), // YYYY-MM
  status: varchar('status', { length: 20 }).notNull().default('open'), // open, closed
  tourismLevyTotal: integer('tourism_levy_total').notNull().default(0),
  bookingRevenueTotal: integer('booking_revenue_total').notNull().default(0),
  expenseTotal: integer('expense_total').notNull().default(0),
  closedByUserId: integer('closed_by_user_id').references(() => users.id),
  closedAt: timestamp('closed_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const auditLogs = pgTable('audit_logs', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').references(() => organizations.id).notNull(),
  actorUserId: integer('actor_user_id').references(() => users.id),
  action: varchar('action', { length: 100 }).notNull(),
  entityType: varchar('entity_type', { length: 100 }).notNull(),
  entityId: varchar('entity_id', { length: 100 }),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const etimsDocuments = pgTable('etims_documents', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').references(() => organizations.id).notNull(),
  expenseId: integer('expense_id').references(() => complianceExpenses.id),
  bookingId: integer('booking_id').references(() => bookings.id),
  documentType: varchar('document_type', { length: 50 }).notNull().default('expense_invoice'),
  status: varchar('status', { length: 30 }).notNull().default('pending'),
  externalDocumentId: varchar('external_document_id', { length: 255 }),
  receiptNumber: varchar('receipt_number', { length: 100 }),
  receiptUrl: text('receipt_url'),
  payload: jsonb('payload'),
  responsePayload: jsonb('response_payload'),
  errorMessage: text('error_message'),
  createdByUserId: integer('created_by_user_id').references(() => users.id),
  issuedAt: timestamp('issued_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const kplcMeterReadings = pgTable('kplc_meter_readings', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').references(() => organizations.id).notNull(),
  unitId: integer('unit_id').references(() => units.id).notNull(),
  meterNumber: varchar('meter_number', { length: 100 }).notNull(),
  tokenBalance: numeric('token_balance', { precision: 10, scale: 2 }).notNull(),
  balanceUnit: varchar('balance_unit', { length: 20 }).notNull().default('token'),
  status: varchar('status', { length: 20 }).notNull().default('healthy'),
  source: varchar('source', { length: 20 }).notNull().default('mock'),
  rawPayload: jsonb('raw_payload'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const utilityProfiles = pgTable('utility_profiles', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').references(() => organizations.id).notNull(),
  unitId: integer('unit_id').references(() => units.id).notNull(),
  provider: varchar('provider', { length: 50 }).notNull().default('manual'),
  minBalanceThreshold: numeric('min_balance_threshold', { precision: 10, scale: 2 }).notNull().default('20'),
  dailyAllowanceKwh: numeric('daily_allowance_kwh', { precision: 10, scale: 2 }),
  autoTopupEnabled: boolean('auto_topup_enabled').notNull().default(false),
  topupAmount: integer('topup_amount').notNull().default(500),
  notificationPhone: varchar('notification_phone', { length: 20 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const utilityDeviceBindings = pgTable('utility_device_bindings', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').references(() => organizations.id).notNull(),
  unitId: integer('unit_id').references(() => units.id).notNull(),
  deviceType: varchar('device_type', { length: 30 }).notNull().default('shelly'),
  deviceId: varchar('device_id', { length: 255 }).notNull(),
  ingestToken: varchar('ingest_token', { length: 255 }).notNull(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const utilityEnergyReadings = pgTable('utility_energy_readings', {
  id: serial('id').primaryKey(),
  organizationId: integer('organization_id').references(() => organizations.id).notNull(),
  unitId: integer('unit_id').references(() => units.id).notNull(),
  deviceBindingId: integer('device_binding_id').references(() => utilityDeviceBindings.id).notNull(),
  capturedAt: timestamp('captured_at').notNull(),
  powerWatts: numeric('power_watts', { precision: 12, scale: 3 }),
  totalKwh: numeric('total_kwh', { precision: 14, scale: 6 }).notNull(),
  rawPayload: jsonb('raw_payload'),
  createdAt: timestamp('created_at').defaultNow(),
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
  unit: one(units, {
    fields: [bookings.unitId],
    references: [units.id],
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
