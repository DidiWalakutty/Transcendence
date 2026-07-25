CREATE TABLE "events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"description" jsonb NOT NULL,
	"image_link" text NOT NULL,
	"organizer_id" uuid NOT NULL,
	"location" text NOT NULL,
	"date_time" timestamp NOT NULL,
	"max_capacity" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_organizer_id_users_id_fk" FOREIGN KEY ("organizer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;