-- DropIndex
DROP INDEX IF EXISTS idx_routes_last_ridden;

-- AlterTable
PRAGMA foreign_keys=off;
CREATE TABLE "new_routes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "distance_km" REAL NOT NULL,
    "elevation_m" INTEGER,
    "difficulty" TEXT,
    "gpx_data" TEXT,
    "start_location" TEXT,
    "region" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_routes" ("id", "name", "description", "distance_km", "elevation_m", "difficulty", "gpx_data", "start_location", "region", "created_at") SELECT "id", "name", "description", "distance_km", "elevation_m", "difficulty", "gpx_data", "start_location", "region", "created_at" FROM "routes";
DROP TABLE "routes";
ALTER TABLE "new_routes" RENAME TO "routes";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=on;
