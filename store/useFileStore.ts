import { create } from "zustand"
import { devtools } from "zustand/middleware"

interface FileUpload {
  id: string
  file: File
  progress: number
  status: "uploading" | "completed" | "error"
  error?: string
  uploadcareUuid?: string
  cloudinaryUrl?: string
}

interface FileState {
  uploads: FileUpload[]
  isUploading: boolean

  // Actions
  addUpload: (file: File) => string
  updateUploadProgress: (id: string, progress: number) => void
  completeUpload: (id: string, uploadcareUuid: string, cloudinaryUrl: string) => void
  failUpload: (id: string, error: string) => void
  removeUpload: (id: string) => void
  clearCompleted: () => void

  // API actions
  uploadFile: (
    file: File,
    chatId?: string,
  ) => Promise<{
    id: string
    uploadcareUuid: string
    cloudinaryUrl: string
  }>
  deleteFile: (fileId: string) => Promise<void>
}

export const useFileStore = create<FileState>()(
  devtools(
    (set, get) => ({
      uploads: [],
      isUploading: false,

      addUpload: (file) => {
        const id = `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const upload: FileUpload = {
          id,
          file,
          progress: 0,
          status: "uploading",
        }

        set((state) => ({
          uploads: [...state.uploads, upload],
          isUploading: true,
        }))

        return id
      },

      updateUploadProgress: (id, progress) => {
        set((state) => ({
          uploads: state.uploads.map((upload) => (upload.id === id ? { ...upload, progress } : upload)),
        }))
      },

      completeUpload: (id, uploadcareUuid, cloudinaryUrl) => {
        set((state) => ({
          uploads: state.uploads.map((upload) =>
            upload.id === id ? { ...upload, status: "completed" as const, uploadcareUuid, cloudinaryUrl } : upload,
          ),
          isUploading: state.uploads.some((u) => u.id !== id && u.status === "uploading"),
        }))
      },

      failUpload: (id, error) => {
        set((state) => ({
          uploads: state.uploads.map((upload) =>
            upload.id === id ? { ...upload, status: "error" as const, error } : upload,
          ),
          isUploading: state.uploads.some((u) => u.id !== id && u.status === "uploading"),
        }))
      },

      removeUpload: (id) => {
        set((state) => ({
          uploads: state.uploads.filter((upload) => upload.id !== id),
          isUploading: state.uploads.some((u) => u.id !== id && u.status === "uploading"),
        }))
      },

      clearCompleted: () => {
        set((state) => ({
          uploads: state.uploads.filter((upload) => upload.status !== "completed"),
        }))
      },

      uploadFile: async (file, chatId) => {
        const uploadId = get().addUpload(file)

        try {
          const formData = new FormData()
          formData.append("file", file)
          if (chatId) formData.append("chatId", chatId)

          const response = await fetch("/api/files/upload", {
            method: "POST",
            body: formData,
          })

          if (!response.ok) {
            throw new Error("Upload failed")
          }

          const result = await response.json()

          get().completeUpload(uploadId, result.uploadcareUuid, result.cloudinaryUrl)

          return {
            id: result.id,
            uploadcareUuid: result.uploadcareUuid,
            cloudinaryUrl: result.cloudinaryUrl,
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Upload failed"
          get().failUpload(uploadId, errorMessage)
          throw error
        }
      },

      deleteFile: async (fileId) => {
        try {
          const response = await fetch(`/api/files/${fileId}`, {
            method: "DELETE",
          })

          if (!response.ok) {
            throw new Error("Failed to delete file")
          }
        } catch (error) {
          console.error("Error deleting file:", error)
          throw error
        }
      },
    }),
    { name: "file-store" },
  ),
)

// Selectors
export const useFileUploads = () => useFileStore((state) => state.uploads)
export const useIsUploading = () => useFileStore((state) => state.isUploading)
