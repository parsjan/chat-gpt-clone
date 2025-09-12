// Script to run database migrations

import { DatabaseMigrations } from "../lib/db-migrations.js"

async function runMigrations() {
  try {
    console.log("Starting database migrations...")
    await DatabaseMigrations.runMigrations()
    console.log("Database migrations completed successfully!")
  } catch (error) {
    console.error("Migration failed:", error)
    process.exit(1)
  }
}

// Run migrations
runMigrations()
