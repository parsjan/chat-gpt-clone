import mongoose, { Schema, type Document } from "mongoose"

export interface IFileAttachment {
  id: string
  name: string
  type: string
  size: number
  url: string
  uploadcareUuid?: string
  cloudinaryPublicId?: string
}

export interface IMessage {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  timestamp: Date
  attachments?: IFileAttachment[]
  metadata?: {
    tokens?: number
    model?: string
    finishReason?: string
  }
}

export interface IChat extends Document {
  id: string
  title: string
  userId: string
  messages: IMessage[]
  metadata: {
    model: string
    totalTokens: number
    messageCount: number
  }
  createdAt: Date
  updatedAt: Date
}

const FileAttachmentSchema = new Schema<IFileAttachment>(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    type: { type: String, required: true },
    size: { type: Number, required: true },
    url: { type: String, required: true },
    uploadcareUuid: String,
    cloudinaryPublicId: String,
  },
  { _id: false },
)

const MessageSchema = new Schema<IMessage>(
  {
    id: { type: String, required: true },
    role: {
      type: String,
      enum: ["user", "assistant", "system"],
      required: true,
    },
    content: { type: String, required: true },
    timestamp: { type: Date, required: true },
    attachments: [FileAttachmentSchema],
    metadata: {
      tokens: Number,
      model: String,
      finishReason: String,
    },
  },
  { _id: false },
)

const ChatSchema = new Schema<IChat>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    messages: [MessageSchema],
    metadata: {
      model: {
        type: String,
        default: "gpt-4o-mini",
      },
      totalTokens: {
        type: Number,
        default: 0,
      },
      messageCount: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  },
)

// Indexes for performance
ChatSchema.index({ userId: 1, updatedAt: -1 })
ChatSchema.index({ id: 1, userId: 1 })

export const Chat = mongoose.models.Chat || mongoose.model<IChat>("Chat", ChatSchema)
