import mongoose, { Schema, type Document } from "mongoose"

export interface IMemory extends Document {
  id: string
  userId: string
  content: string
  type: "conversation" | "preference" | "fact" | "context"
  metadata: {
    chatId?: string
    importance: number
    tags: string[]
    extractedAt: Date
    lastAccessed?: Date
    accessCount?: number
  }
  createdAt: Date
  updatedAt: Date
}

const MemorySchema = new Schema<IMemory>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
      index: "text",
    },
    type: {
      type: String,
      enum: ["conversation", "preference", "fact", "context"],
      required: true,
      index: true,
    },
    metadata: {
      chatId: {
        type: String,
        index: true,
      },
      importance: {
        type: Number,
        required: true,
        min: 0,
        max: 1,
        default: 0.5,
      },
      tags: [
        {
          type: String,
          index: true,
        },
      ],
      extractedAt: {
        type: Date,
        required: true,
        default: Date.now,
      },
      lastAccessed: {
        type: Date,
      },
      accessCount: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
    collection: "memories",
  },
)

// Compound indexes for efficient queries
MemorySchema.index({ userId: 1, type: 1 })
MemorySchema.index({ userId: 1, "metadata.importance": -1 })
MemorySchema.index({ userId: 1, "metadata.tags": 1 })
MemorySchema.index({ userId: 1, "metadata.chatId": 1 })

// Text search index
MemorySchema.index(
  {
    content: "text",
    "metadata.tags": "text",
  },
  {
    weights: {
      content: 10,
      "metadata.tags": 5,
    },
  },
)

export const Memory = mongoose.models.Memory || mongoose.model<IMemory>("Memory", MemorySchema)
