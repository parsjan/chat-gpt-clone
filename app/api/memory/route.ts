import type { NextRequest } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { memoryClient, MemoryManager } from "@/lib/memory"
import connectToDatabase from "@/lib/mongoose"

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return new Response("Unauthorized", { status: 401 })
    }

    await connectToDatabase()

    const { searchParams } = new URL(req.url)
    const query = searchParams.get("query")
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    if (query) {
      // Search memories
      const memories = await memoryClient.search(query, userId, limit)
      return Response.json(memories)
    } else {
      // Get all memories
      const memories = await memoryClient.getAll(userId, limit)
      return Response.json(memories)
    }
  } catch (error) {
    console.error("Memory API error:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return new Response("Unauthorized", { status: 401 })
    }

    await connectToDatabase()

    const { messages, chatId, metadata, action, memory, query } = await req.json()

    if (action === "search" && query) {
      const memories = await memoryClient.search(query, userId, 10)
      return Response.json({ memories: memories.results })
    }

    if (action === "create" && memory) {
      const result = await memoryClient.add([{ role: "user", content: memory }], userId, metadata)
      return Response.json({ success: true, memory: result })
    }

    // Default behavior for conversation memory
    if (!messages || !Array.isArray(messages)) {
      return new Response("Invalid messages format", { status: 400 })
    }

    const result = await MemoryManager.addConversationMemory(messages, userId, chatId, metadata)

    return Response.json({ success: true, result })
  } catch (error) {
    console.error("Memory creation error:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
}
