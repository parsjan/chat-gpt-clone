"use client"

import type React from "react"
import { useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send } from "lucide-react"
import { cn } from "@/lib/utils"
import { FileUploadWidget } from "./file-upload-widget"
import { FileAttachmentComponent } from "./file-attachment"
import { useChatAttachments, useChatStore } from "@/store"
import type { FileAttachment } from "@/types/chat"

interface MessageInputProps {
  value: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  disabled?: boolean
  placeholder?: string
}

export function MessageInput({
  value,
  onChange,
  onSubmit,
  disabled,
  placeholder = "Type a message...",
}: MessageInputProps) {
  const attachments = useChatAttachments()
  const { addAttachment, removeAttachment } = useChatStore()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = "auto"
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`
    }
  }

  useEffect(() => {
    adjustTextareaHeight()
  }, [value])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      if ((value.trim() || attachments.length > 0) && !disabled) {
        handleSubmit(e as any)
      }
    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if ((value.trim() || attachments.length > 0) && !disabled) {
      onSubmit(e)
    }
  }

  const handleFileUploaded = (file: any) => {
    const newAttachment: FileAttachment = {
      id: file.id,
      name: file.name,
      type: file.type,
      size: file.size,
      url: file.url,
    }
    addAttachment(newAttachment)
  }

  const handleRemoveAttachment = (index: number) => {
    removeAttachment(index)
  }

  return (
    <div className="space-y-3 ">
      {/* Attachments */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {attachments.map((file, index) => (
            <FileAttachmentComponent
              key={index}
              file={file}
              onRemove={() => handleRemoveAttachment(index)}
              showRemove={true}
              size="sm"
            />
          ))}
        </div>
      )}

      {/* Input form */}
      <form onSubmit={handleSubmit} className="relative ">
        <div className="relative flex items-end gap-2 p-3 border border-border rounded-full focus-within:border-ring">
          <FileUploadWidget
            onFileUploaded={handleFileUploaded}
            disabled={disabled}
          />

          <Textarea
            ref={textareaRef}
            value={value}
            onChange={onChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="flex-1 min-h-[24px] max-h-[200px] resize-none border-0 bg-transparent p-0 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground"
            disabled={disabled}
          />

          <Button
            type="submit"
            size="sm"
            className={cn(
              "flex-shrink-0 rounded-full",
              (value.trim() || attachments.length > 0) && !disabled
                ? "bg-primary hover:bg-primary/90"
                : "bg-muted-foreground/80"
            )}
            disabled={!(value.trim() || attachments.length > 0) || disabled}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center mt-4 mb-4">
          ChatGPT can make mistakes. Check important info.
        </p>
      </form>
    </div>
  );
}
