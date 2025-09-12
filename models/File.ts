import mongoose, { Schema, type Document } from "mongoose"

export interface IFile extends Document {
  id: string
  userId: string
  chatId?: string
  name: string
  type: string
  size: number
  uploadcareUuid: string
  cloudinaryPublicId: string
  cloudinaryUrl: string
  metadata: {
    originalFilename: string
    mimeType: string
    uploadedAt: Date
  }
  createdAt: Date
  updatedAt: Date
}

const FileSchema = new Schema<IFile>(
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
    chatId: {
      type: String,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    uploadcareUuid: {
      type: String,
      required: true,
    },
    cloudinaryPublicId: {
      type: String,
      required: true,
    },
    cloudinaryUrl: {
      type: String,
      required: true,
    },
    metadata: {
      originalFilename: {
        type: String,
        required: true,
      },
      mimeType: {
        type: String,
        required: true,
      },
      uploadedAt: {
        type: Date,
        required: true,
      },
    },
  },
  {
    timestamps: true,
  },
)

// Indexes for performance
FileSchema.index({ userId: 1, createdAt: -1 })
FileSchema.index({ chatId: 1 })
FileSchema.index({ uploadcareUuid: 1 })

export const File = mongoose.models.File || mongoose.model<IFile>("File", FileSchema)
