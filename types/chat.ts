export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  attachments?: FileAttachment[]
}

export interface FileAttachment {
  id: string
  name: string
  type: string
  size: number
  url: string
  uploadcareUuid?: string
  cloudinaryPublicId?: string
}

export interface Chat {
  id: string
  title: string
  userId: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
}

export interface ChatSession {
  id: string
  userId: string
  messages: Message[]
  title?: string
  createdAt: Date
  updatedAt: Date
}
