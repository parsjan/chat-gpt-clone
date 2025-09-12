import type { NextRequest } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { uploadToCloudinary } from "@/lib/cloudinary"
import { getUploadcareFileInfo } from "@/lib/uploadcare"
import connectToDatabase from "@/lib/mongoose"
import { File } from "@/models"

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return new Response("Unauthorized", { status: 401 })
    }

    const { uploadcareUuid, chatId } = await req.json()

    if (!uploadcareUuid) {
      return new Response("Missing uploadcare UUID", { status: 400 })
    }

    await connectToDatabase()

    // Get file info from Uploadcare
    const fileInfo = await getUploadcareFileInfo(uploadcareUuid)

    // Upload to Cloudinary for permanent storage
    const cloudinaryResult = await uploadToCloudinary(fileInfo.original_file_url, fileInfo.original_filename)

    const fileId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const newFile = new File({
      id: fileId,
      userId,
      chatId,
      name: fileInfo.original_filename,
      type: fileInfo.mime_type,
      size: fileInfo.size,
      uploadcareUuid,
      cloudinaryPublicId: cloudinaryResult.publicId,
      cloudinaryUrl: cloudinaryResult.url,
      metadata: {
        originalFilename: fileInfo.original_filename,
        mimeType: fileInfo.mime_type,
        uploadedAt: new Date(),
      },
    })

    await newFile.save()

    return Response.json({
      id: fileId,
      uploadcareUuid,
      cloudinaryUrl: cloudinaryResult.url,
      file: {
        id: fileId,
        name: fileInfo.original_filename,
        type: fileInfo.mime_type,
        size: fileInfo.size,
        url: cloudinaryResult.url,
      },
    })
  } catch (error) {
    console.error("File upload API error:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
}
