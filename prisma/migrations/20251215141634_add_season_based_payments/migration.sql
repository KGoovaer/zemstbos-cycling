-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password_hash" TEXT,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "phone" TEXT,
    "role" TEXT NOT NULL DEFAULT 'member',
    "payment_status" TEXT NOT NULL DEFAULT 'unpaid',
    "payment_year" INTEGER,
    "paid_season_id" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "google_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "users_paid_season_id_fkey" FOREIGN KEY ("paid_season_id") REFERENCES "seasons" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_users" ("created_at", "email", "first_name", "google_id", "id", "is_active", "last_name", "password_hash", "payment_status", "payment_year", "phone", "role", "updated_at") SELECT "created_at", "email", "first_name", "google_id", "id", "is_active", "last_name", "password_hash", "payment_status", "payment_year", "phone", "role", "updated_at" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "users_google_id_key" ON "users"("google_id");
CREATE INDEX "idx_users_active" ON "users"("is_active");
CREATE INDEX "idx_users_paid_season" ON "users"("paid_season_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
