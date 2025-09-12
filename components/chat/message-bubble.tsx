"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Copy, Edit3, RotateCcw, ThumbsUp, ThumbsDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { FileAttachmentComponent } from "./file-attachment"
import type { Message } from "@/types/chat"

interface MessageBubbleProps {
  message: Message
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const [isHovered, setIsHovered] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content)
  }

  const handleEdit = () => {
    // This will be implemented later
    console.log("Edit message:", message.id)
  }

  const handleRegenerate = () => {
    // This will be implemented later
    console.log("Regenerate message:", message.id)
  }

  return (
    <div
      className={cn(
        "group flex gap-4 px-4 py-6 hover:bg-muted/50 transition-colors",
        message.role === "assistant" && "bg-muted/30",
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        <div
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
            message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted border border-border",
          )}
        >
          {message.role === "user" ? "U" : "AI"}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* File attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="mb-3 space-y-2">
            {message.attachments.map((file, index) => (
              <FileAttachmentComponent key={index} file={file} size="md" />
            ))}
          </div>
        )}

        {/* Text content */}
        {message.content && (
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <p className="text-foreground leading-relaxed whitespace-pre-wrap">{message.content}</p>
          </div>
        )}

        {/* Actions */}
        {(isHovered || message.role === "assistant") && (
          <div className="flex items-center gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="sm" onClick={handleCopy} className="h-8 px-2">
              <Copy className="h-3 w-3" />
            </Button>

            {message.role === "user" && (
              <Button variant="ghost" size="sm" onClick={handleEdit} className="h-8 px-2">
                <Edit3 className="h-3 w-3" />
              </Button>
            )}

            {message.role === "assistant" && (
              <>
                <Button variant="ghost" size="sm" onClick={handleRegenerate} className="h-8 px-2">
                  <RotateCcw className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 px-2">
                  <ThumbsUp className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 px-2">
                  <ThumbsDown className="h-3 w-3" />
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
