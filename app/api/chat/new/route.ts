import type { NextRequest } from "next/server"
import { auth } from "@clerk/nextjs/server"
import connectToDatabase from "@/lib/mongoose"
import { Chat } from "@/models"
import { generateTitle } from "@/lib/ai"

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return new Response("Unauthorized", { status: 401 })
    }

    const { firstMessage } = await req.json()

    // await connectToDatabase()

    // Generate a title for the chat
    const title = firstMessage ? await generateTitle(firstMessage) : "New Chat"

    const chatId = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const newChat = new Chat({
      id: chatId,
      title,
      userId,
      messages: [],
      metadata: {
        model: "gpt-4o-mini",
        totalTokens: 0,
        messageCount: 0,
      },
    })

    // await newChat.save()

    return Response.json({ chatId, title })
  } catch (error) {
    console.log("New chat API error:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
}
