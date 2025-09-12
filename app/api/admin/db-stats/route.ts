import type { NextRequest } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { DatabaseOperations } from "@/lib/db-operations"

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return new Response("Unauthorized", { status: 401 })
    }

    // Get user statistics
    const stats = await DatabaseOperations.getChatStats(userId)

    return Response.json({
      stats,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("DB stats API error:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
}
