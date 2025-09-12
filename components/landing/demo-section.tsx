"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MessageSquare, Send, User, Bot } from "lucide-react"
import { useState } from "react"

const demoMessages = [
  {
    role: "user",
    content: "Can you help me write a professional email?",
  },
  {
    role: "assistant",
    content:
      "I'd be happy to help you write a professional email! To get started, could you tell me:\n\n• Who you're writing to\n• The purpose of the email\n• Any key points you want to include\n\nThis will help me craft the perfect message for your needs.",
  },
  {
    role: "user",
    content: "I need to follow up with a client about a project proposal I sent last week.",
  },
  {
    role: "assistant",
    content:
      "Perfect! Here's a professional follow-up email:\n\n**Subject: Following up on [Project Name] Proposal**\n\nHi [Client Name],\n\nI hope this email finds you well. I wanted to follow up on the project proposal I sent over last week for [Project Name].\n\nI'm excited about the opportunity to work together and would love to discuss any questions you might have about the proposal. If you need any additional information or would like to schedule a call to go over the details, please let me know.\n\nI'm flexible with timing and happy to accommodate your schedule.\n\nLooking forward to hearing from you!\n\nBest regards,\n[Your Name]",
  },
]

export function DemoSection() {
  const [currentMessage, setCurrentMessage] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  const playDemo = () => {
    setIsPlaying(true)
    setCurrentMessage(0)

    const interval = setInterval(() => {
      setCurrentMessage((prev) => {
        if (prev >= demoMessages.length - 1) {
          clearInterval(interval)
          setIsPlaying(false)
          return prev
        }
        return prev + 1
      })
    }, 2000)
  }

  return (
    <section className="py-24 bg-background">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-balance mb-6">
            See It in
            <span className="text-primary"> Action</span>
          </h2>
          <p className="text-xl text-muted-foreground text-balance max-w-3xl mx-auto mb-8">
            Watch how our AI assistant helps with real-world tasks. Experience the natural flow of conversation and
            intelligent responses.
          </p>

          <Button onClick={playDemo} disabled={isPlaying} size="lg" className="mb-12">
            <MessageSquare className="w-5 h-5 mr-2" />
            {isPlaying ? "Playing Demo..." : "Play Interactive Demo"}
          </Button>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="bg-card border-2">
            <CardContent className="p-0">
              {/* Chat Header */}
              <div className="flex items-center justify-between p-6 border-b bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <Bot className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold">AI Assistant</h3>
                    <p className="text-sm text-muted-foreground">Online</p>
                  </div>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="p-6 space-y-6 min-h-[400px]">
                {demoMessages.slice(0, currentMessage + 1).map((message, index) => (
                  <div
                    key={index}
                    className={`flex gap-4 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {message.role === "assistant" && (
                      <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-accent-foreground" />
                      </div>
                    )}

                    <div className={`max-w-[80%] ${message.role === "user" ? "order-1" : ""}`}>
                      <div
                        className={`p-4 rounded-2xl ${
                          message.role === "user" ? "bg-primary text-primary-foreground ml-auto" : "bg-muted"
                        }`}
                      >
                        <p className="text-sm leading-relaxed whitespace-pre-line">{message.content}</p>
                      </div>
                    </div>

                    {message.role === "user" && (
                      <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                ))}

                {isPlaying && currentMessage < demoMessages.length - 1 && (
                  <div className="flex gap-4 justify-start">
                    <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-accent-foreground" />
                    </div>
                    <div className="bg-muted p-4 rounded-2xl">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" />
                        <div
                          className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        />
                        <div
                          className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="p-6 border-t bg-muted/30">
                <div className="flex gap-3 items-center">
                  <div className="flex-1 bg-background border rounded-full px-4 py-3">
                    <p className="text-muted-foreground">Type your message...</p>
                  </div>
                  <Button size="icon" className="rounded-full">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
