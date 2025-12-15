-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_scheduled_rides" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "season_id" TEXT NOT NULL,
    "route_id" TEXT NOT NULL,
    "ride_date" DATETIME NOT NULL,
    "team" TEXT NOT NULL DEFAULT 'A',
    "start_time" TEXT NOT NULL DEFAULT '09:00:00',
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "notes" TEXT,
    "weather_backup" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "scheduled_rides_season_id_fkey" FOREIGN KEY ("season_id") REFERENCES "seasons" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "scheduled_rides_route_id_fkey" FOREIGN KEY ("route_id") REFERENCES "routes" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "scheduled_rides_weather_backup_fkey" FOREIGN KEY ("weather_backup") REFERENCES "routes" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_scheduled_rides" ("created_at", "id", "notes", "ride_date", "route_id", "season_id", "start_time", "status", "weather_backup") SELECT "created_at", "id", "notes", "ride_date", "route_id", "season_id", "start_time", "status", "weather_backup" FROM "scheduled_rides";
DROP TABLE "scheduled_rides";
ALTER TABLE "new_scheduled_rides" RENAME TO "scheduled_rides";
CREATE INDEX "idx_scheduled_rides_date" ON "scheduled_rides"("ride_date");
CREATE UNIQUE INDEX "scheduled_rides_ride_date_team_key" ON "scheduled_rides"("ride_date", "team");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
