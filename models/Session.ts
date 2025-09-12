import mongoose, { Schema, type Document } from "mongoose"

export interface ISession extends Document {
  sessionId: string
  userId: string
  type: "chat" | "memory" | "preference"
  data: Record<string, any>
  expiresAt?: Date
  createdAt: Date
  updatedAt: Date
}

const SessionSchema = new Schema<ISession>(
  {
    sessionId: {
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
    type: {
      type: String,
      enum: ["chat", "memory", "preference"],
      required: true,
    },
    data: {
      type: Schema.Types.Mixed,
      required: true,
    },
    expiresAt: {
      type: Date,
      index: { expireAfterSeconds: 0 },
    },
  },
  {
    timestamps: true,
  },
)

// Indexes for performance
SessionSchema.index({ userId: 1, type: 1 })
SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export const Session = mongoose.models.Session || mongoose.model<ISession>("Session", SessionSchema)
