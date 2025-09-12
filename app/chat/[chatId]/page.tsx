import { requireAuth } from "@/lib/auth"
import { getDatabase } from "@/lib/db"
import { ChatLayout } from "@/components/chat/chat-layout"
import { notFound } from "next/navigation"

interface ChatPageProps {
  params: {
    chatId: string
  }
}

export default async function ChatPage({ params }: ChatPageProps) {
  const userId = await requireAuth()
  const { chatId } = params

  // Verify chat exists and belongs to user
  const db = await getDatabase()
  const chat = await db.collection("chats").findOne({ id: chatId, userId })

  if (!chat) {
    notFound()
  }

  return <ChatLayout chatId={chatId} />
}
