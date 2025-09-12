import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function uploadToCloudinary(fileUrl: string, fileName: string) {
  try {
    const result = await cloudinary.uploader.upload(fileUrl, {
      resource_type: "auto",
      public_id: `chatgpt-clone/${Date.now()}-${fileName}`,
      folder: "chatgpt-clone",
    })

    return {
      url: result.secure_url,
      publicId: result.public_id,
      resourceType: result.resource_type,
      format: result.format,
      bytes: result.bytes,
    }
  } catch (error) {
    console.error("Cloudinary upload error:", error)
    throw new Error("Failed to upload file to Cloudinary")
  }
}

export async function deleteFromCloudinary(publicId: string) {
  try {
    const result = await cloudinary.uploader.destroy(publicId)
    return result
  } catch (error) {
    console.error("Cloudinary delete error:", error)
    throw new Error("Failed to delete file from Cloudinary")
  }
}
