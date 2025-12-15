-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password_hash" TEXT,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "phone" TEXT,
    "role" TEXT NOT NULL DEFAULT 'member',
    "payment_status" TEXT NOT NULL DEFAULT 'unpaid',
    "payment_year" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "google_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "routes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "distance_km" REAL NOT NULL,
    "elevation_m" INTEGER,
    "difficulty" TEXT,
    "gpx_data" TEXT NOT NULL,
    "start_location" TEXT,
    "region" TEXT,
    "times_ridden" INTEGER NOT NULL DEFAULT 0,
    "last_ridden" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "seasons" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "year" INTEGER NOT NULL,
    "start_date" DATETIME NOT NULL,
    "end_date" DATETIME NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "scheduled_rides" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "season_id" TEXT NOT NULL,
    "route_id" TEXT NOT NULL,
    "ride_date" DATETIME NOT NULL,
    "start_time" TEXT NOT NULL DEFAULT '09:00:00',
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "notes" TEXT,
    "weather_backup" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "scheduled_rides_season_id_fkey" FOREIGN KEY ("season_id") REFERENCES "seasons" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "scheduled_rides_route_id_fkey" FOREIGN KEY ("route_id") REFERENCES "routes" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "scheduled_rides_weather_backup_fkey" FOREIGN KEY ("weather_backup") REFERENCES "routes" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "event_date" DATETIME NOT NULL,
    "event_time" TEXT,
    "location" TEXT,
    "event_type" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ride_history" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "route_id" TEXT NOT NULL,
    "ride_date" DATETIME NOT NULL,
    "season_year" INTEGER NOT NULL,
    "week_number" INTEGER NOT NULL,
    "participant_count" INTEGER,
    "notes" TEXT,
    CONSTRAINT "ride_history_route_id_fkey" FOREIGN KEY ("route_id") REFERENCES "routes" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_google_id_key" ON "users"("google_id");

-- CreateIndex
CREATE INDEX "idx_users_active" ON "users"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "seasons_year_key" ON "seasons"("year");

-- CreateIndex
CREATE INDEX "idx_scheduled_rides_date" ON "scheduled_rides"("ride_date");

-- CreateIndex
CREATE UNIQUE INDEX "scheduled_rides_ride_date_key" ON "scheduled_rides"("ride_date");

-- CreateIndex
CREATE INDEX "idx_ride_history_week" ON "ride_history"("week_number", "season_year");
