import type { NextRequest } from "next/server"
import { auth } from "@clerk/nextjs/server"
import connectToDatabase from "@/lib/mongoose"
import { Chat } from "@/models"

export async function GET(req: NextRequest, { params }: { params: { chatId: string } }) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return new Response("Unauthorized", { status: 401 })
    }

    const { chatId } = params
    await connectToDatabase()

    const chat = await Chat.findOne({ id: chatId, userId }).lean()

    if (!chat) {
      return new Response("Chat not found", { status: 404 })
    }

    return Response.json({ chat })
  } catch (error) {
    console.error("Get chat API error:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { chatId: string } }) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return new Response("Unauthorized", { status: 401 })
    }

    const { chatId } = params
    await connectToDatabase()

    const result = await Chat.deleteOne({ id: chatId, userId })

    if (result.deletedCount === 0) {
      return new Response("Chat not found", { status: 404 })
    }

    return Response.json({ success: true })
  } catch (error) {
    console.error("Delete chat API error:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { chatId: string } }) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return new Response("Unauthorized", { status: 401 })
    }

    const { chatId } = params
    const { title } = await req.json()

    await connectToDatabase()

    const result = await Chat.updateOne(
      { id: chatId, userId },
      {
        title,
        updatedAt: new Date(),
      },
    )

    if (result.matchedCount === 0) {
      return new Response("Chat not found", { status: 404 })
    }

    return Response.json({ success: true })
  } catch (error) {
    console.error("Update chat API error:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
}
