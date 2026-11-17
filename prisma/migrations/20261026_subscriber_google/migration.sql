ALTER TABLE "subscribers" ADD COLUMN "google_id" TEXT UNIQUE;
ALTER TABLE "subscribers" ADD COLUMN "signup_source" TEXT NOT NULL DEFAULT 'email';
ALTER TABLE "subscribers" ALTER COLUMN "password" DROP NOT NULL;
