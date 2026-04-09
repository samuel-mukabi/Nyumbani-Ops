CREATE TABLE "utility_profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"unit_id" integer NOT NULL,
	"provider" varchar(50) DEFAULT 'manual' NOT NULL,
	"min_balance_threshold" numeric(10,2) DEFAULT '20' NOT NULL,
	"daily_allowance_kwh" numeric(10,2),
	"auto_topup_enabled" boolean DEFAULT false NOT NULL,
	"topup_amount" integer DEFAULT 500 NOT NULL,
	"notification_phone" varchar(20),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "utility_profiles" ADD CONSTRAINT "utility_profiles_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "utility_profiles" ADD CONSTRAINT "utility_profiles_unit_id_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."units"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
CREATE UNIQUE INDEX "utility_profiles_org_unit_unique" ON "utility_profiles" USING btree ("organization_id","unit_id");
--> statement-breakpoint
CREATE INDEX "utility_profiles_org_idx" ON "utility_profiles" USING btree ("organization_id");
