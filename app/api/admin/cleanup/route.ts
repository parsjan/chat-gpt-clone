import type { NextRequest } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { DatabaseOperations } from "@/lib/db-operations"

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return new Response("Unauthorized", { status: 401 })
    }

    const { action, daysOld = 90 } = await req.json()

    let result = 0

    switch (action) {
      case "cleanup_old_chats":
        result = await DatabaseOperations.cleanupOldChats(userId, daysOld)
        break
      case "cleanup_expired_sessions":
        result = await DatabaseOperations.deleteExpiredSessions()
        break
      default:
        return new Response("Invalid action", { status: 400 })
    }

    return Response.json({
      success: true,
      deletedCount: result,
      action,
    })
  } catch (error) {
    console.error("Cleanup API error:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
}
