// Database schema definitions and validation helpers

export interface UserDocument {
  _id?: string
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

export interface ChatDocument {
  _id?: string
  id: string
  title: string
  userId: string
  messages: MessageDocument[]
  metadata: {
    model: string
    totalTokens: number
    messageCount: number
  }
  createdAt: Date
  updatedAt: Date
}

export interface MessageDocument {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  timestamp: Date
  attachments?: FileAttachmentDocument[]
  metadata?: {
    tokens?: number
    model?: string
    finishReason?: string
  }
}

export interface FileAttachmentDocument {
  id: string
  name: string
  type: string
  size: number
  url: string
  uploadcareUuid?: string
  cloudinaryPublicId?: string
}

export interface FileDocument {
  _id?: string
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
}

export interface SessionDocument {
  _id?: string
  sessionId: string
  userId: string
  type: "chat" | "memory" | "preference"
  data: Record<string, any>
  expiresAt?: Date
  createdAt: Date
  updatedAt: Date
}

// Validation helpers
export function validateChatDocument(chat: Partial<ChatDocument>): chat is ChatDocument {
  return !!(chat.id && chat.title && chat.userId && Array.isArray(chat.messages) && chat.createdAt && chat.updatedAt)
}

export function validateMessageDocument(message: Partial<MessageDocument>): message is MessageDocument {
  return !!(message.id && message.role && message.content !== undefined && message.timestamp)
}

export function validateFileDocument(file: Partial<FileDocument>): file is FileDocument {
  return !!(
    file.id &&
    file.userId &&
    file.name &&
    file.type &&
    file.size !== undefined &&
    file.uploadcareUuid &&
    file.cloudinaryPublicId &&
    file.cloudinaryUrl &&
    file.createdAt
  )
}
