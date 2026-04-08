CREATE TABLE "kplc_meter_readings" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"unit_id" integer NOT NULL,
	"meter_number" varchar(100) NOT NULL,
	"token_balance" numeric(10,2) NOT NULL,
	"balance_unit" varchar(20) DEFAULT 'token' NOT NULL,
	"status" varchar(20) DEFAULT 'healthy' NOT NULL,
	"source" varchar(20) DEFAULT 'mock' NOT NULL,
	"raw_payload" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "kplc_meter_readings" ADD CONSTRAINT "kplc_meter_readings_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "kplc_meter_readings" ADD CONSTRAINT "kplc_meter_readings_unit_id_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."units"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "kplc_meter_readings_org_idx" ON "kplc_meter_readings" USING btree ("organization_id");
--> statement-breakpoint
CREATE INDEX "kplc_meter_readings_unit_idx" ON "kplc_meter_readings" USING btree ("unit_id");
--> statement-breakpoint
CREATE INDEX "kplc_meter_readings_created_idx" ON "kplc_meter_readings" USING btree ("created_at");
