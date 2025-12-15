-- CreateTable
CREATE TABLE "season_payments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "season_id" TEXT NOT NULL,
    "paid_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "amount" REAL,
    "notes" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "season_payments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "season_payments_season_id_fkey" FOREIGN KEY ("season_id") REFERENCES "seasons" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "season_payments_user_id_idx" ON "season_payments"("user_id");

-- CreateIndex
CREATE INDEX "season_payments_season_id_idx" ON "season_payments"("season_id");

-- CreateIndex
CREATE UNIQUE INDEX "season_payments_user_id_season_id_key" ON "season_payments"("user_id", "season_id");
