"use client"

import { MessageBubble } from "./message-bubble"
import { LoadingMessage } from "./loading-message"
import type { Message } from "@/types/chat"

interface MessageListProps {
  messages: Message[]
  isLoading: boolean
}

export function MessageList({ messages, isLoading }: MessageListProps) {
  console.log(messages,"messages in frontend ");
  return (
    <div className="space-y-6 py-4">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
      {isLoading && <LoadingMessage />}
    </div>
  )
}
