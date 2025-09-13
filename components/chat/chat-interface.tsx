"use client";

import type React from "react";
import { useRef, useEffect } from "react";
import { MessageList } from "./message-list";
import { MessageInput } from "./message-input";
import { useChatMessages, useChatInput, useChatStore } from "@/store";
import { Button } from "@/components/ui/button";
import { Square } from "lucide-react";
import { useIsLoading, useIsStreaming } from "@/store/useChatStore";

interface ChatInterfaceProps {
  chatId?: string;
}

export function ChatInterface({ chatId }: ChatInterfaceProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const messages = useChatMessages();
  const input = useChatInput();
  const isLoading = useIsLoading();
  const isStreaming = useIsStreaming();
  const setInput = useChatStore((s) => s.setInput);
  const setCurrentChatId = useChatStore((s) => s.setCurrentChatId);
  const loadChat = useChatStore((s) => s.loadChat);
  const sendMessage = useChatStore((s) => s.sendMessage);

  useEffect(() => {
    if (chatId) {
      loadChat(chatId);
    } else {
      setCurrentChatId(null);
    }
  }, [chatId, loadChat, setCurrentChatId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (input.trim()) {
      await sendMessage(input.trim());
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Messages take full available height but scroll with page */}
      <div className="flex-1 px-4 max-w-4xl mx-auto w-full">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center space-y-4 max-w-md">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-foreground">
                How can I help you today?
              </h3>
              <p className="text-muted-foreground">
                Start a conversation by typing a message below.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <MessageList
              messages={messages}
              isLoading={isLoading || isStreaming}
            />
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area (Fixed Bottom) */}
      <div className="sticky bottom-0 w-full bg-background">
        <div className="max-w-4xl mx-auto w-full px-4 ">
          {(isLoading || isStreaming) && (
            <div className="mb-3 flex justify-center">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 bg-transparent"
              >
                <Square className="h-3 w-3" />
                Stop generating
              </Button>
            </div>
          )}

          <MessageInput
            value={input}
            onChange={handleInputChange}
            onSubmit={handleSubmit}
            disabled={isLoading || isStreaming}
            placeholder="Message ChatGPT..."
          />
        </div>
      </div>
    </div>
  );
}
