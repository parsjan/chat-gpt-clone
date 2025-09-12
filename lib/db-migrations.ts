// Database migration utilities for schema updates

import { getDatabase } from "./db"

interface Migration {
  version: number
  name: string
  up: () => Promise<void>
  down: () => Promise<void>
}

export class DatabaseMigrations {
  private static async getDb() {
    return await getDatabase()
  }

  private static async getCurrentVersion(): Promise<number> {
    const db = await this.getDb()
    const migration = await db.collection("migrations").findOne({}, { sort: { version: -1 } })
    return migration?.version || 0
  }

  private static async setVersion(version: number, name: string): Promise<void> {
    const db = await this.getDb()
    await db.collection("migrations").insertOne({
      version,
      name,
      appliedAt: new Date(),
    })
  }

  static migrations: Migration[] = [
    {
      version: 1,
      name: "add_chat_metadata",
      up: async () => {
        const db = await DatabaseMigrations.getDb()
        await db.collection("chats").updateMany(
          { metadata: { $exists: false } },
          {
            $set: {
              metadata: {
                model: "gpt-4o-mini",
                totalTokens: 0,
                messageCount: 0,
              },
            },
          },
        )
        console.log("Added metadata field to existing chats")
      },
      down: async () => {
        const db = await DatabaseMigrations.getDb()
        await db.collection("chats").updateMany({}, { $unset: { metadata: "" } })
        console.log("Removed metadata field from chats")
      },
    },
    {
      version: 2,
      name: "add_file_metadata",
      up: async () => {
        const db = await DatabaseMigrations.getDb()
        await db.collection("files").updateMany(
          { metadata: { $exists: false } },
          {
            $set: {
              metadata: {
                originalFilename: "",
                mimeType: "",
                uploadedAt: new Date(),
              },
            },
          },
        )
        console.log("Added metadata field to existing files")
      },
      down: async () => {
        const db = await DatabaseMigrations.getDb()
        await db.collection("files").updateMany({}, { $unset: { metadata: "" } })
        console.log("Removed metadata field from files")
      },
    },
    {
      version: 3,
      name: "add_user_preferences",
      up: async () => {
        const db = await DatabaseMigrations.getDb()
        await db.collection("users").updateMany(
          { preferences: { $exists: false } },
          {
            $set: {
              preferences: {
                theme: "dark",
                language: "en",
                notifications: true,
              },
            },
          },
        )
        console.log("Added preferences field to existing users")
      },
      down: async () => {
        const db = await DatabaseMigrations.getDb()
        await db.collection("users").updateMany({}, { $unset: { preferences: "" } })
        console.log("Removed preferences field from users")
      },
    },
  ]

  static async runMigrations(): Promise<void> {
    const currentVersion = await this.getCurrentVersion()
    const pendingMigrations = this.migrations.filter((m) => m.version > currentVersion)

    if (pendingMigrations.length === 0) {
      console.log("No pending migrations")
      return
    }

    console.log(`Running ${pendingMigrations.length} pending migrations...`)

    for (const migration of pendingMigrations) {
      try {
        console.log(`Running migration ${migration.version}: ${migration.name}`)
        await migration.up()
        await this.setVersion(migration.version, migration.name)
        console.log(`Migration ${migration.version} completed successfully`)
      } catch (error) {
        console.error(`Migration ${migration.version} failed:`, error)
        throw error
      }
    }

    console.log("All migrations completed successfully")
  }

  static async rollbackMigration(targetVersion: number): Promise<void> {
    const currentVersion = await this.getCurrentVersion()

    if (targetVersion >= currentVersion) {
      console.log("Target version is not lower than current version")
      return
    }

    const migrationsToRollback = this.migrations
      .filter((m) => m.version > targetVersion && m.version <= currentVersion)
      .sort((a, b) => b.version - a.version) // Rollback in reverse order

    console.log(`Rolling back ${migrationsToRollback.length} migrations...`)

    for (const migration of migrationsToRollback) {
      try {
        console.log(`Rolling back migration ${migration.version}: ${migration.name}`)
        await migration.down()

        // Remove migration record
        const db = await this.getDb()
        await db.collection("migrations").deleteOne({ version: migration.version })

        console.log(`Migration ${migration.version} rolled back successfully`)
      } catch (error) {
        console.error(`Rollback of migration ${migration.version} failed:`, error)
        throw error
      }
    }

    console.log("Rollback completed successfully")
  }
}
