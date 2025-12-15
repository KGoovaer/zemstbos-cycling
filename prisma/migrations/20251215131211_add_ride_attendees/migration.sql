-- CreateTable
CREATE TABLE "ride_attendees" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ride_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'attending',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ride_attendees_ride_id_fkey" FOREIGN KEY ("ride_id") REFERENCES "scheduled_rides" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ride_attendees_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "ride_attendees_ride_id_idx" ON "ride_attendees"("ride_id");

-- CreateIndex
CREATE INDEX "ride_attendees_user_id_idx" ON "ride_attendees"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "ride_attendees_ride_id_user_id_key" ON "ride_attendees"("ride_id", "user_id");
