import type { NextRequest } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { memoryClient } from "@/lib/memory"
import connectToDatabase from "@/lib/mongoose"

export async function DELETE(req: NextRequest, { params }: { params: { memoryId: string } }) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return new Response("Unauthorized", { status: 401 })
    }

    await connectToDatabase()

    const { memoryId } = params
    const result = await memoryClient.delete(memoryId, userId)

    return Response.json({ success: true, result })
  } catch (error) {
    console.error("Memory deletion error:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { memoryId: string } }) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return new Response("Unauthorized", { status: 401 })
    }

    await connectToDatabase()

    const { memoryId } = params
    const { memory } = await req.json()

    if (!memory) {
      return new Response("Memory content is required", { status: 400 })
    }

    const result = await memoryClient.update(memoryId, userId, memory)

    return Response.json({ success: true, result })
  } catch (error) {
    console.error("Memory update error:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
}
