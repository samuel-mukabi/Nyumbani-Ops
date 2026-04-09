ALTER TABLE "users" ALTER COLUMN "auth_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "external_id" varchar(255);--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "external_source" varchar(50);