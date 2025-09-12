export const uploadcareConfig = {
  publicKey: process.env.NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY || "",
  secretKey: process.env.UPLOADCARE_SECRET_KEY || "",
}

export function initUploadcare() {
  if (typeof window !== "undefined") {
    // Initialize Uploadcare widget configuration
    window.UPLOADCARE_PUBLIC_KEY = uploadcareConfig.publicKey
    window.UPLOADCARE_TABS = "file camera url facebook gdrive gphotos dropbox instagram"
    window.UPLOADCARE_EFFECTS = "crop,rotate,enhance,grayscale"
  }
}

export async function getUploadcareFileInfo(uuid: string) {
  try {
    const response = await fetch(`https://api.uploadcare.com/files/${uuid}/`, {
      headers: {
        Authorization: `Uploadcare.Simple ${uploadcareConfig.publicKey}:${uploadcareConfig.secretKey}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Uploadcare API error: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Failed to get Uploadcare file info:", error)
    throw error
  }
}
