// Database initialization script for ChatGPT Clone
// This script creates the necessary collections and indexes

import { MongoClient } from "mongodb"

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable")
}

async function initializeDatabase() {
  const client = new MongoClient(MONGODB_URI)

  try {
    await client.connect()
    console.log("Connected to MongoDB")

    const db = client.db("chatgpt-clone")

    // Create collections if they don't exist
    const collections = ["users", "chats", "files", "sessions"]

    for (const collectionName of collections) {
      const exists = await db.listCollections({ name: collectionName }).hasNext()
      if (!exists) {
        await db.createCollection(collectionName)
        console.log(`Created collection: ${collectionName}`)
      }
    }

    // Create indexes for better performance

    // Chats collection indexes
    await db.collection("chats").createIndex({ userId: 1, updatedAt: -1 })
    await db.collection("chats").createIndex({ id: 1, userId: 1 }, { unique: true })
    await db.collection("chats").createIndex({ createdAt: -1 })
    console.log("Created indexes for chats collection")

    // Files collection indexes
    await db.collection("files").createIndex({ userId: 1, chatId: 1 })
    await db.collection("files").createIndex({ id: 1, userId: 1 }, { unique: true })
    await db.collection("files").createIndex({ uploadcareUuid: 1 })
    await db.collection("files").createIndex({ cloudinaryPublicId: 1 })
    console.log("Created indexes for files collection")

    // Users collection indexes (for future user preferences/settings)
    await db.collection("users").createIndex({ clerkId: 1 }, { unique: true })
    await db.collection("users").createIndex({ email: 1 })
    console.log("Created indexes for users collection")

    // Sessions collection indexes (for chat sessions and memory)
    await db.collection("sessions").createIndex({ userId: 1, createdAt: -1 })
    await db.collection("sessions").createIndex({ sessionId: 1 }, { unique: true })
    console.log("Created indexes for sessions collection")

    console.log("Database initialization completed successfully!")
  } catch (error) {
    console.error("Database initialization failed:", error)
    throw error
  } finally {
    await client.close()
  }
}

// Run the initialization
initializeDatabase().catch(console.error)
