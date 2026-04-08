CREATE TABLE "compliance_expenses" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"property_id" integer,
	"unit_id" integer,
	"expense_date" date NOT NULL,
	"category" varchar(100) NOT NULL,
	"amount" integer NOT NULL,
	"currency" varchar(10) DEFAULT 'KES' NOT NULL,
	"vendor_name" varchar(255),
	"etims_receipt_number" varchar(100),
	"etims_receipt_url" text,
	"notes" text,
	"created_by_user_id" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "compliance_month_closures" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"month_key" varchar(7) NOT NULL,
	"status" varchar(20) DEFAULT 'open' NOT NULL,
	"tourism_levy_total" integer DEFAULT 0 NOT NULL,
	"booking_revenue_total" integer DEFAULT 0 NOT NULL,
	"expense_total" integer DEFAULT 0 NOT NULL,
	"closed_by_user_id" integer,
	"closed_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"actor_user_id" integer,
	"action" varchar(100) NOT NULL,
	"entity_type" varchar(100) NOT NULL,
	"entity_id" varchar(100),
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "compliance_expenses" ADD CONSTRAINT "compliance_expenses_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "compliance_expenses" ADD CONSTRAINT "compliance_expenses_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "compliance_expenses" ADD CONSTRAINT "compliance_expenses_unit_id_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."units"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "compliance_expenses" ADD CONSTRAINT "compliance_expenses_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "compliance_month_closures" ADD CONSTRAINT "compliance_month_closures_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "compliance_month_closures" ADD CONSTRAINT "compliance_month_closures_closed_by_user_id_users_id_fk" FOREIGN KEY ("closed_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_user_id_users_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
CREATE UNIQUE INDEX "compliance_month_closure_org_month_unique" ON "compliance_month_closures" USING btree ("organization_id","month_key");
--> statement-breakpoint
CREATE INDEX "compliance_expenses_org_idx" ON "compliance_expenses" USING btree ("organization_id");
--> statement-breakpoint
CREATE INDEX "compliance_expenses_expense_date_idx" ON "compliance_expenses" USING btree ("expense_date");
--> statement-breakpoint
CREATE INDEX "audit_logs_org_idx" ON "audit_logs" USING btree ("organization_id");
