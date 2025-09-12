"use client"

import { Button } from "@/components/ui/button"
import { X, FileText, ImageIcon, File } from "lucide-react"
import { cn } from "@/lib/utils"
import type { FileAttachment } from "@/types/chat"

interface FileAttachmentProps {
  file: FileAttachment
  onRemove?: () => void
  showRemove?: boolean
  size?: "sm" | "md" | "lg"
}

export function FileAttachmentComponent({ file, onRemove, showRemove = false, size = "md" }: FileAttachmentProps) {
  const isImage = file.type.startsWith("image/")
  const isPdf = file.type === "application/pdf"
  const isDocument = file.type.includes("document") || file.type.includes("text")

  const getIcon = () => {
    if (isImage) return <ImageIcon className="h-4 w-4" />
    if (isPdf || isDocument) return <FileText className="h-4 w-4" />
    return <File className="h-4 w-4" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2 bg-muted rounded-lg border border-border",
        size === "sm" && "px-2 py-1 text-xs",
        size === "md" && "px-3 py-2 text-sm",
        size === "lg" && "px-4 py-3 text-base",
      )}
    >
      {isImage && file.url ? (
        <img
          src={file.url || "/placeholder.svg"}
          alt={file.name}
          className={cn(
            "rounded object-cover",
            size === "sm" && "w-6 h-6",
            size === "md" && "w-8 h-8",
            size === "lg" && "w-10 h-10",
          )}
        />
      ) : (
        <div
          className={cn(
            "flex items-center justify-center bg-muted-foreground/20 rounded",
            size === "sm" && "w-6 h-6",
            size === "md" && "w-8 h-8",
            size === "lg" && "w-10 h-10",
          )}
        >
          {getIcon()}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{file.name}</p>
        <p className="text-muted-foreground text-xs">{formatFileSize(file.size)}</p>
      </div>

      {showRemove && onRemove && (
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-destructive/20" onClick={onRemove}>
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  )
}
