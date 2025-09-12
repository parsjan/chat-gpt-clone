import mongoose, { Schema, type Document } from "mongoose"

export interface IUser extends Document {
  clerkId: string
  email: string
  firstName?: string
  lastName?: string
  imageUrl?: string
  preferences: {
    theme: "light" | "dark" | "system"
    language: string
    notifications: boolean
  }
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    clerkId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    firstName: String,
    lastName: String,
    imageUrl: String,
    preferences: {
      theme: {
        type: String,
        enum: ["light", "dark", "system"],
        default: "system",
      },
      language: {
        type: String,
        default: "en",
      },
      notifications: {
        type: Boolean,
        default: true,
      },
    },
  },
  {
    timestamps: true,
  },
)

// Indexes for performance
UserSchema.index({ clerkId: 1 })
UserSchema.index({ email: 1 })

export const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema)
