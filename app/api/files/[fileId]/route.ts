import type { NextRequest } from "next/server"
import { auth } from "@clerk/nextjs/server"
import connectToDatabase from "@/lib/mongoose"
import { File } from "@/models"
import { deleteFromCloudinary } from "@/lib/cloudinary"

export async function DELETE(req: NextRequest, { params }: { params: { fileId: string } }) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return new Response("Unauthorized", { status: 401 })
    }

    const { fileId } = params
    await connectToDatabase()

    const file = await File.findOne({ id: fileId, userId }).lean()

    if (!file) {
      return new Response("File not found", { status: 404 })
    }

    // Delete from Cloudinary
    if (file.cloudinaryPublicId) {
      await deleteFromCloudinary(file.cloudinaryPublicId)
    }

    await File.deleteOne({ id: fileId, userId })

    return Response.json({ success: true })
  } catch (error) {
    console.error("Delete file API error:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
}
