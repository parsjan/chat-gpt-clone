"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Edit3, RotateCcw, ThumbsUp, ThumbsDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { FileAttachmentComponent } from "./file-attachment";
import type { Message } from "@/types/chat";

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
  };

  const handleEdit = () => {
    console.log("Edit message:", message.id);
  };

  const handleRegenerate = () => {
    console.log("Regenerate message:", message.id);
  };

  return (
    <div
      className={cn("group flex px-4 py-6 transition-colors")}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={cn(
          "flex-1 min-w-0 flex flex-col",
          message.role === "user" ? "items-end" : "items-start"
        )}
      >
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
          <div
            className={cn(
              "prose prose-sm max-w-[75%] dark:prose-invert",
              message.role === "user"
                ? "text-right bg-muted/50 p-4 rounded-2xl"
                : "text-left"
            )}
          >
            <p className="text-foreground leading-relaxed whitespace-pre-wrap">
              {message.content}
            </p>
          </div>
        )}

        {/* Actions */}
        {message.role === "user" && isHovered && (
          <div className="flex gap-2 mt-2 justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-8 px-2"
            >
              <Copy className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEdit}
              className="h-8 px-2"
            >
              <Edit3 className="h-3 w-3" />
            </Button>
          </div>
        )}

        {message.role === "assistant" && (
          <div className="flex gap-2 mt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-8 px-2"
            >
              <Copy className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRegenerate}
              className="h-8 px-2"
            >
              <RotateCcw className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 px-2">
              <ThumbsUp className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 px-2">
              <ThumbsDown className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
