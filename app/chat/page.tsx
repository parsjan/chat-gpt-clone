
import { requireAuth } from "@/lib/auth"
import { ChatLayout } from "@/components/chat/chat-layout"

export default async function ChatPage() {
  await requireAuth()

  return <ChatLayout />
}
