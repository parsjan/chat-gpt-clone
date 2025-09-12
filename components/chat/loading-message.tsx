"use client"

export function LoadingMessage() {
  return (
    <div className="flex gap-4 px-4 py-6 bg-muted/30">
      {/* Avatar */}
      <div className="flex-shrink-0">
        <div className="w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center text-sm font-medium">
          AI
        </div>
      </div>

      {/* Loading animation */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-1">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
