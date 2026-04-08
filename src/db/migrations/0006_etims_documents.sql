CREATE TABLE "etims_documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization_id" integer NOT NULL,
	"expense_id" integer,
	"booking_id" integer,
	"document_type" varchar(50) DEFAULT 'expense_invoice' NOT NULL,
	"status" varchar(30) DEFAULT 'pending' NOT NULL,
	"external_document_id" varchar(255),
	"receipt_number" varchar(100),
	"receipt_url" text,
	"payload" jsonb,
	"response_payload" jsonb,
	"error_message" text,
	"created_by_user_id" integer,
	"issued_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "etims_documents" ADD CONSTRAINT "etims_documents_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "etims_documents" ADD CONSTRAINT "etims_documents_expense_id_compliance_expenses_id_fk" FOREIGN KEY ("expense_id") REFERENCES "public"."compliance_expenses"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "etims_documents" ADD CONSTRAINT "etims_documents_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "etims_documents" ADD CONSTRAINT "etims_documents_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "etims_documents_org_idx" ON "etims_documents" USING btree ("organization_id");
--> statement-breakpoint
CREATE INDEX "etims_documents_status_idx" ON "etims_documents" USING btree ("status");
--> statement-breakpoint
CREATE INDEX "etims_documents_expense_idx" ON "etims_documents" USING btree ("expense_id");
