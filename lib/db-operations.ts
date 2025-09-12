// Database operation helpers for common queries

import { getDatabase } from "./db"
import type { ChatDocument, FileDocument, UserDocument, SessionDocument, MessageDocument } from "./db-schemas"

export class DatabaseOperations {
  private static async getDb() {
    return await getDatabase()
  }

  // Chat operations
  static async createChat(chat: Omit<ChatDocument, "_id">): Promise<string> {
    const db = await this.getDb()
    const result = await db.collection("chats").insertOne(chat)
    return result.insertedId.toString()
  }

  static async getChatById(chatId: string, userId: string): Promise<ChatDocument | null> {
    const db = await this.getDb()
    return (await db.collection("chats").findOne({ id: chatId, userId })) as ChatDocument | null
  }

  static async getUserChats(userId: string, limit = 50): Promise<ChatDocument[]> {
    const db = await this.getDb()
    return (await db
      .collection("chats")
      .find({ userId })
      .sort({ updatedAt: -1 })
      .limit(limit)
      .toArray()) as ChatDocument[]
  }

  static async updateChat(chatId: string, userId: string, update: Partial<ChatDocument>): Promise<boolean> {
    const db = await this.getDb()
    const result = await db
      .collection("chats")
      .updateOne({ id: chatId, userId }, { $set: { ...update, updatedAt: new Date() } })
    return result.modifiedCount > 0
  }

  static async deleteChat(chatId: string, userId: string): Promise<boolean> {
    const db = await this.getDb()
    const result = await db.collection("chats").deleteOne({ id: chatId, userId })
    return result.deletedCount > 0
  }

  static async addMessageToChat(chatId: string, userId: string, message: MessageDocument): Promise<boolean> {
    const db = await this.getDb()
    const result = await db.collection("chats").updateOne(
      { id: chatId, userId },
      {
        $push: { messages: message },
        $set: { updatedAt: new Date() },
        $inc: { "metadata.messageCount": 1 },
      },
    )
    return result.modifiedCount > 0
  }

  // File operations
  static async createFile(file: Omit<FileDocument, "_id">): Promise<string> {
    const db = await this.getDb()
    const result = await db.collection("files").insertOne(file)
    return result.insertedId.toString()
  }

  static async getFileById(fileId: string, userId: string): Promise<FileDocument | null> {
    const db = await this.getDb()
    return (await db.collection("files").findOne({ id: fileId, userId })) as FileDocument | null
  }

  static async getChatFiles(chatId: string, userId: string): Promise<FileDocument[]> {
    const db = await this.getDb()
    return (await db.collection("files").find({ chatId, userId }).sort({ createdAt: -1 }).toArray()) as FileDocument[]
  }

  static async deleteFile(fileId: string, userId: string): Promise<boolean> {
    const db = await this.getDb()
    const result = await db.collection("files").deleteOne({ id: fileId, userId })
    return result.deletedCount > 0
  }

  // User operations
  static async createOrUpdateUser(user: Omit<UserDocument, "_id">): Promise<string> {
    const db = await this.getDb()
    const result = await db
      .collection("users")
      .replaceOne({ clerkId: user.clerkId }, { ...user, updatedAt: new Date() }, { upsert: true })
    return result.upsertedId?.toString() || user.clerkId
  }

  static async getUserByClerkId(clerkId: string): Promise<UserDocument | null> {
    const db = await this.getDb()
    return (await db.collection("users").findOne({ clerkId })) as UserDocument | null
  }

  // Session operations
  static async createSession(session: Omit<SessionDocument, "_id">): Promise<string> {
    const db = await this.getDb()
    const result = await db.collection("sessions").insertOne(session)
    return result.insertedId.toString()
  }

  static async getSession(sessionId: string, userId: string): Promise<SessionDocument | null> {
    const db = await this.getDb()
    return (await db.collection("sessions").findOne({
      sessionId,
      userId,
      $or: [{ expiresAt: { $exists: false } }, { expiresAt: { $gt: new Date() } }],
    })) as SessionDocument | null
  }

  static async updateSession(sessionId: string, userId: string, data: Record<string, any>): Promise<boolean> {
    const db = await this.getDb()
    const result = await db.collection("sessions").updateOne(
      { sessionId, userId },
      {
        $set: {
          data,
          updatedAt: new Date(),
        },
      },
    )
    return result.modifiedCount > 0
  }

  static async deleteExpiredSessions(): Promise<number> {
    const db = await this.getDb()
    const result = await db.collection("sessions").deleteMany({
      expiresAt: { $lt: new Date() },
    })
    return result.deletedCount
  }

  // Analytics and cleanup operations
  static async getChatStats(userId: string): Promise<{
    totalChats: number
    totalMessages: number
    totalFiles: number
  }> {
    const db = await this.getDb()

    const [chatCount, messageCount, fileCount] = await Promise.all([
      db.collection("chats").countDocuments({ userId }),
      db
        .collection("chats")
        .aggregate([
          { $match: { userId } },
          { $project: { messageCount: { $size: "$messages" } } },
          { $group: { _id: null, total: { $sum: "$messageCount" } } },
        ])
        .toArray(),
      db.collection("files").countDocuments({ userId }),
    ])

    return {
      totalChats: chatCount,
      totalMessages: messageCount[0]?.total || 0,
      totalFiles: fileCount,
    }
  }

  static async cleanupOldChats(userId: string, daysOld = 90): Promise<number> {
    const db = await this.getDb()
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysOld)

    const result = await db.collection("chats").deleteMany({
      userId,
      updatedAt: { $lt: cutoffDate },
    })

    return result.deletedCount
  }
}
