import type { NextRequest } from "next/server"
import { auth } from "@clerk/nextjs/server"
import connectToDatabase from "@/lib/mongoose"
import { Chat } from "@/models"

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return new Response("Unauthorized", { status: 401 })
    }

    await connectToDatabase()

    const chats = await Chat.find({ userId })
      .sort({ updatedAt: -1 })
      .limit(50)
      .select("id title createdAt updatedAt metadata.messageCount")
      .lean()

    return Response.json({ chats })
  } catch (error) {
    console.error("Chat history API error:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
}
