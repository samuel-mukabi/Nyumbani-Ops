CREATE TABLE "utility_device_bindings" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"unit_id" integer NOT NULL,
	"device_type" varchar(30) DEFAULT 'shelly' NOT NULL,
	"device_id" varchar(255) NOT NULL,
	"ingest_token" varchar(255) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "utility_energy_readings" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"unit_id" integer NOT NULL,
	"device_binding_id" integer NOT NULL,
	"captured_at" timestamp NOT NULL,
	"power_watts" numeric(12,3),
	"total_kwh" numeric(14,6) NOT NULL,
	"raw_payload" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "utility_device_bindings" ADD CONSTRAINT "utility_device_bindings_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "utility_device_bindings" ADD CONSTRAINT "utility_device_bindings_unit_id_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."units"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "utility_energy_readings" ADD CONSTRAINT "utility_energy_readings_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "utility_energy_readings" ADD CONSTRAINT "utility_energy_readings_unit_id_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."units"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "utility_energy_readings" ADD CONSTRAINT "utility_energy_readings_device_binding_id_utility_device_bindings_id_fk" FOREIGN KEY ("device_binding_id") REFERENCES "public"."utility_device_bindings"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
CREATE UNIQUE INDEX "utility_device_bindings_org_unit_unique" ON "utility_device_bindings" USING btree ("organization_id","unit_id");
--> statement-breakpoint
CREATE INDEX "utility_energy_readings_org_idx" ON "utility_energy_readings" USING btree ("organization_id");
--> statement-breakpoint
CREATE INDEX "utility_energy_readings_unit_idx" ON "utility_energy_readings" USING btree ("unit_id");
--> statement-breakpoint
CREATE INDEX "utility_energy_readings_captured_at_idx" ON "utility_energy_readings" USING btree ("captured_at");
