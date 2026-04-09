CREATE TABLE "owners" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"full_name" varchar(255) NOT NULL,
	"phone" varchar(20),
	"email" varchar(255),
	"payout_method" varchar(50) DEFAULT 'mpesa' NOT NULL,
	"payout_details" jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "buildings" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255),
	"address" text,
	"area" varchar(100),
	"shared_wifi_router_id" varchar(255),
	"security_contact" varchar(100),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "buildings_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "units" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"building_id" integer NOT NULL,
	"owner_id" integer,
	"unit_code" varchar(100) NOT NULL,
	"name" varchar(255) NOT NULL,
	"listing_url" text,
	"channel_listing_id" varchar(255),
	"kplc_meter_no" varchar(100),
	"ttlock_device_id" varchar(255),
	"status" varchar(50) DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "unit_contracts" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"unit_id" integer NOT NULL,
	"model" varchar(20) NOT NULL,
	"commission_percent" numeric(5,2),
	"monthly_rent" integer,
	"lease_start" date,
	"lease_end" date,
	"active_from" date NOT NULL,
	"active_to" date,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "cleaning_jobs" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"unit_id" integer NOT NULL,
	"booking_id" integer,
	"assigned_to" integer,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"fee" integer DEFAULT 0 NOT NULL,
	"notes" text,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "maintenance_tickets" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"unit_id" integer NOT NULL,
	"category" varchar(100) NOT NULL,
	"description" text,
	"status" varchar(50) DEFAULT 'open' NOT NULL,
	"vendor_name" varchar(255),
	"cost" integer DEFAULT 0 NOT NULL,
	"owner_chargeable" boolean DEFAULT true NOT NULL,
	"opened_at" timestamp DEFAULT now(),
	"resolved_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "utility_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"unit_id" integer NOT NULL,
	"type" varchar(50) NOT NULL,
	"amount" integer NOT NULL,
	"receipt_ref" varchar(255),
	"notes" text,
	"occurred_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "owner_statements" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"owner_id" integer NOT NULL,
	"statement_month" date NOT NULL,
	"currency" varchar(10) DEFAULT 'KES' NOT NULL,
	"gross_revenue" integer DEFAULT 0 NOT NULL,
	"platform_fees" integer DEFAULT 0 NOT NULL,
	"cleaning_fees" integer DEFAULT 0 NOT NULL,
	"maintenance_costs" integer DEFAULT 0 NOT NULL,
	"utility_costs" integer DEFAULT 0 NOT NULL,
	"transaction_fees" integer DEFAULT 0 NOT NULL,
	"agency_commission" integer DEFAULT 0 NOT NULL,
	"net_owner_payout" integer DEFAULT 0 NOT NULL,
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"generated_at" timestamp DEFAULT now(),
	"finalized_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "owner_statement_lines" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"statement_id" integer NOT NULL,
	"owner_id" integer NOT NULL,
	"unit_id" integer,
	"booking_id" integer,
	"line_type" varchar(50) NOT NULL,
	"description" text,
	"amount" integer NOT NULL,
	"occurred_at" timestamp,
	"reference_type" varchar(50),
	"reference_id" integer,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "owner_payouts" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"owner_id" integer NOT NULL,
	"statement_id" integer,
	"amount" integer NOT NULL,
	"method" varchar(50) DEFAULT 'mpesa' NOT NULL,
	"mpesa_receipt" varchar(100),
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"paid_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "organization_id" integer;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "unit_id" integer;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "gross_amount" integer;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "platform_fee_amount" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "channel" varchar(50);--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "currency" varchar(10) DEFAULT 'KES';--> statement-breakpoint
ALTER TABLE "owners" ADD CONSTRAINT "owners_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "buildings" ADD CONSTRAINT "buildings_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "units" ADD CONSTRAINT "units_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "units" ADD CONSTRAINT "units_building_id_buildings_id_fk" FOREIGN KEY ("building_id") REFERENCES "public"."buildings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "units" ADD CONSTRAINT "units_owner_id_owners_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."owners"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "unit_contracts" ADD CONSTRAINT "unit_contracts_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "unit_contracts" ADD CONSTRAINT "unit_contracts_unit_id_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."units"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cleaning_jobs" ADD CONSTRAINT "cleaning_jobs_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cleaning_jobs" ADD CONSTRAINT "cleaning_jobs_unit_id_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."units"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cleaning_jobs" ADD CONSTRAINT "cleaning_jobs_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cleaning_jobs" ADD CONSTRAINT "cleaning_jobs_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "maintenance_tickets" ADD CONSTRAINT "maintenance_tickets_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "maintenance_tickets" ADD CONSTRAINT "maintenance_tickets_unit_id_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."units"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "utility_events" ADD CONSTRAINT "utility_events_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "utility_events" ADD CONSTRAINT "utility_events_unit_id_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."units"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "owner_statements" ADD CONSTRAINT "owner_statements_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "owner_statements" ADD CONSTRAINT "owner_statements_owner_id_owners_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."owners"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "owner_statement_lines" ADD CONSTRAINT "owner_statement_lines_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "owner_statement_lines" ADD CONSTRAINT "owner_statement_lines_statement_id_owner_statements_id_fk" FOREIGN KEY ("statement_id") REFERENCES "public"."owner_statements"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "owner_statement_lines" ADD CONSTRAINT "owner_statement_lines_owner_id_owners_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."owners"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "owner_statement_lines" ADD CONSTRAINT "owner_statement_lines_unit_id_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."units"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "owner_statement_lines" ADD CONSTRAINT "owner_statement_lines_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "owner_payouts" ADD CONSTRAINT "owner_payouts_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "owner_payouts" ADD CONSTRAINT "owner_payouts_owner_id_owners_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."owners"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "owner_payouts" ADD CONSTRAINT "owner_payouts_statement_id_owner_statements_id_fk" FOREIGN KEY ("statement_id") REFERENCES "public"."owner_statements"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_unit_id_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."units"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "unit_contracts" ADD CONSTRAINT "unit_contracts_model_check" CHECK ("model" IN ('commission', 'arbitrage'));--> statement-breakpoint
ALTER TABLE "units" ADD CONSTRAINT "units_status_check" CHECK ("status" IN ('active', 'inactive', 'maintenance'));--> statement-breakpoint
ALTER TABLE "maintenance_tickets" ADD CONSTRAINT "maintenance_tickets_status_check" CHECK ("status" IN ('open', 'in_progress', 'resolved', 'closed'));--> statement-breakpoint
ALTER TABLE "cleaning_jobs" ADD CONSTRAINT "cleaning_jobs_status_check" CHECK ("status" IN ('pending', 'assigned', 'done', 'cancelled'));--> statement-breakpoint
ALTER TABLE "utility_events" ADD CONSTRAINT "utility_events_type_check" CHECK ("type" IN ('kplc', 'water', 'wifi', 'internet', 'gas', 'other'));--> statement-breakpoint
ALTER TABLE "owner_statements" ADD CONSTRAINT "owner_statements_status_check" CHECK ("status" IN ('draft', 'finalized', 'paid'));--> statement-breakpoint
ALTER TABLE "owner_statement_lines" ADD CONSTRAINT "owner_statement_lines_line_type_check" CHECK ("line_type" IN ('booking_revenue', 'platform_fee', 'cleaning_fee', 'maintenance_cost', 'utility_cost', 'transaction_fee', 'agency_commission', 'adjustment'));--> statement-breakpoint
ALTER TABLE "owner_payouts" ADD CONSTRAINT "owner_payouts_status_check" CHECK ("status" IN ('pending', 'processing', 'paid', 'failed', 'cancelled'));--> statement-breakpoint
CREATE INDEX "owners_org_idx" ON "owners" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "buildings_org_idx" ON "buildings" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "units_org_idx" ON "units" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "units_building_idx" ON "units" USING btree ("building_id");--> statement-breakpoint
CREATE INDEX "units_owner_idx" ON "units" USING btree ("owner_id");--> statement-breakpoint
CREATE UNIQUE INDEX "units_building_code_unique" ON "units" USING btree ("building_id","unit_code");--> statement-breakpoint
CREATE INDEX "unit_contracts_org_idx" ON "unit_contracts" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "unit_contracts_unit_idx" ON "unit_contracts" USING btree ("unit_id");--> statement-breakpoint
CREATE INDEX "cleaning_jobs_org_idx" ON "cleaning_jobs" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "cleaning_jobs_unit_idx" ON "cleaning_jobs" USING btree ("unit_id");--> statement-breakpoint
CREATE INDEX "cleaning_jobs_status_idx" ON "cleaning_jobs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "maintenance_tickets_org_idx" ON "maintenance_tickets" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "maintenance_tickets_unit_idx" ON "maintenance_tickets" USING btree ("unit_id");--> statement-breakpoint
CREATE INDEX "maintenance_tickets_status_idx" ON "maintenance_tickets" USING btree ("status");--> statement-breakpoint
CREATE INDEX "utility_events_org_idx" ON "utility_events" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "utility_events_unit_idx" ON "utility_events" USING btree ("unit_id");--> statement-breakpoint
CREATE INDEX "utility_events_occurred_at_idx" ON "utility_events" USING btree ("occurred_at");--> statement-breakpoint
CREATE INDEX "owner_statements_org_idx" ON "owner_statements" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "owner_statements_owner_idx" ON "owner_statements" USING btree ("owner_id");--> statement-breakpoint
CREATE UNIQUE INDEX "owner_statements_owner_month_unique" ON "owner_statements" USING btree ("owner_id","statement_month");--> statement-breakpoint
CREATE INDEX "owner_statement_lines_org_idx" ON "owner_statement_lines" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "owner_statement_lines_statement_idx" ON "owner_statement_lines" USING btree ("statement_id");--> statement-breakpoint
CREATE INDEX "owner_statement_lines_unit_idx" ON "owner_statement_lines" USING btree ("unit_id");--> statement-breakpoint
CREATE INDEX "owner_payouts_org_idx" ON "owner_payouts" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "owner_payouts_owner_idx" ON "owner_payouts" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "owner_payouts_status_idx" ON "owner_payouts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "bookings_org_idx" ON "bookings" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "bookings_unit_idx" ON "bookings" USING btree ("unit_id");--> statement-breakpoint
CREATE OR REPLACE FUNCTION "public"."is_organization_member"("target_organization_id" integer)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
	SELECT EXISTS (
		SELECT 1
		FROM "public"."users" u
		WHERE u."organization_id" = target_organization_id
		  AND u."auth_id" = auth.uid()::text
	);
$$;--> statement-breakpoint
REVOKE ALL ON FUNCTION "public"."is_organization_member"(integer) FROM PUBLIC;--> statement-breakpoint
GRANT EXECUTE ON FUNCTION "public"."is_organization_member"(integer) TO authenticated;--> statement-breakpoint
ALTER TABLE "owners" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "buildings" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "units" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "unit_contracts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "cleaning_jobs" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "maintenance_tickets" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "utility_events" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "owner_statements" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "owner_statement_lines" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "owner_payouts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "owners_org_isolation" ON "owners"
USING ("public"."is_organization_member"("organization_id"))
WITH CHECK ("public"."is_organization_member"("organization_id"));--> statement-breakpoint
CREATE POLICY "buildings_org_isolation" ON "buildings"
USING ("public"."is_organization_member"("organization_id"))
WITH CHECK ("public"."is_organization_member"("organization_id"));--> statement-breakpoint
CREATE POLICY "units_org_isolation" ON "units"
USING ("public"."is_organization_member"("organization_id"))
WITH CHECK ("public"."is_organization_member"("organization_id"));--> statement-breakpoint
CREATE POLICY "unit_contracts_org_isolation" ON "unit_contracts"
USING ("public"."is_organization_member"("organization_id"))
WITH CHECK ("public"."is_organization_member"("organization_id"));--> statement-breakpoint
CREATE POLICY "cleaning_jobs_org_isolation" ON "cleaning_jobs"
USING ("public"."is_organization_member"("organization_id"))
WITH CHECK ("public"."is_organization_member"("organization_id"));--> statement-breakpoint
CREATE POLICY "maintenance_tickets_org_isolation" ON "maintenance_tickets"
USING ("public"."is_organization_member"("organization_id"))
WITH CHECK ("public"."is_organization_member"("organization_id"));--> statement-breakpoint
CREATE POLICY "utility_events_org_isolation" ON "utility_events"
USING ("public"."is_organization_member"("organization_id"))
WITH CHECK ("public"."is_organization_member"("organization_id"));--> statement-breakpoint
CREATE POLICY "owner_statements_org_isolation" ON "owner_statements"
USING ("public"."is_organization_member"("organization_id"))
WITH CHECK ("public"."is_organization_member"("organization_id"));--> statement-breakpoint
CREATE POLICY "owner_statement_lines_org_isolation" ON "owner_statement_lines"
USING ("public"."is_organization_member"("organization_id"))
WITH CHECK ("public"."is_organization_member"("organization_id"));--> statement-breakpoint
CREATE POLICY "owner_payouts_org_isolation" ON "owner_payouts"
USING ("public"."is_organization_member"("organization_id"))
WITH CHECK ("public"."is_organization_member"("organization_id"));
