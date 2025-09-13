import { create } from "zustand"
import { devtools, persist } from "zustand/middleware"
import type { Message, FileAttachment, Chat } from "@/types/chat"
import { auth } from "@clerk/nextjs/server"
import { getAuthUserId } from "@/lib/auth"
import { useUserStore } from "./useUserStore"

interface ChatState {
  // Current chat state
  currentChatId: string | null
  messages: Message[]
  isLoading: boolean
  isStreaming: boolean
  error: string | null

  // Input state
  input: string
  attachments: FileAttachment[]

  // Chat history
  chats: Chat[]
  isLoadingHistory: boolean

  // Actions
  setCurrentChatId: (chatId: string | null) => void
  setMessages: (messages: Message[]) => void
  addMessage: (message: Message) => void
  updateLastMessage: (content: string) => void
  setInput: (input: string) => void
  setIsLoading: (loading: boolean) => void
  setIsStreaming: (streaming: boolean) => void
  setError: (error: string | null) => void

  // Attachment actions
  addAttachment: (attachment: FileAttachment) => void
  removeAttachment: (index: number) => void
  clearAttachments: () => void

  // Chat history actions
  setChats: (chats: Chat[]) => void
  addChat: (chat: Chat) => void
  updateChat: (chatId: string, updates: Partial<Chat>) => void
  removeChat: (chatId: string) => void

  // API actions
  createNewChat: (firstMessage?: string) => Promise<string>
  sendMessage: (content: string) => Promise<void>
  loadChatHistory: () => Promise<void>
  loadChat: (chatId: string) => Promise<void>
  deleteChat: (chatId: string) => Promise<void>
  updateChatTitle: (chatId: string, title: string) => Promise<void>

  // Reset actions
  reset: () => void
  resetCurrentChat: () => void
}

const initialState = {
  currentChatId: null,
  messages: [],
  isLoading: false,
  isStreaming: false,
  error: null,
  input: "",
  attachments: [],
  chats: [],
  isLoadingHistory: false,
}

export const useChatStore = create<ChatState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // Basic setters
        setCurrentChatId: (chatId) => set({ currentChatId: chatId }),
        setMessages: (messages) => set({ messages }),
        addMessage: (message) =>
          set((state) => ({
            messages: [...state.messages, message],
          })),
        updateLastMessage: (content) =>
          set((state) => {
            const messages = [...state.messages];
            if (messages.length > 0) {
              messages[messages.length - 1] = {
                ...messages[messages.length - 1],
                content,
              };
            }
            return { messages };
          }),
        setInput: (input) => set({ input }),
        setIsLoading: (isLoading) => set({ isLoading }),
        setIsStreaming: (isStreaming) => set({ isStreaming }),
        setError: (error) => set({ error }),

        // Attachment actions
        addAttachment: (attachment) =>
          set((state) => ({
            attachments: [...state.attachments, attachment],
          })),
        removeAttachment: (index) =>
          set((state) => ({
            attachments: state.attachments.filter((_, i) => i !== index),
          })),
        clearAttachments: () => set({ attachments: [] }),

        // Chat history actions
        setChats: (chats) => set({ chats }),
        addChat: (chat) =>
          set((state) => ({
            chats: [chat, ...state.chats],
          })),
        updateChat: (chatId, updates) =>
          set((state) => ({
            chats: state.chats.map((chat) =>
              chat.id === chatId ? { ...chat, ...updates } : chat
            ),
          })),
        removeChat: (chatId) =>
          set((state) => ({
            chats: state.chats.filter((chat) => chat.id !== chatId),
          })),

        // API actions
        createNewChat: async (firstMessage) => {
          try {
            set({ isLoading: true, error: null });

            const response = await fetch("/api/chat/new", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ firstMessage }),
            });

            if (!response.ok) {
              throw new Error("Failed to create new chat");
            }

            const { chatId, title } = await response.json();
            const userId = useUserStore.getState().userId;

            // Add new chat to history
            const newChat: Chat = {
              id: chatId,
              title,
              userId: userId === null ? "" : userId,
              messages: [],
              createdAt: new Date(),
              updatedAt: new Date(),
            };

            get().addChat(newChat);
            set({ currentChatId: chatId, messages: [] });

            return chatId;
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : "Unknown error";
            set({ error: errorMessage });
            throw error;
          } finally {
            set({ isLoading: false });
          }
        },

        sendMessage: async (content) => {
          const { currentChatId, attachments, messages } = get();

          try {
            set({ isLoading: true, isStreaming: true, error: null });

            // Create new chat if none exists
            let chatId = currentChatId;
            if (!chatId) {
              chatId = await get().createNewChat(content);
            }

            // Add user message optimistically
            const userMessage: Message = {
              id: Date.now().toString(),
              role: "user",
              content,
              timestamp: new Date(),
              attachments: attachments.length > 0 ? attachments : undefined,
            };

            get().addMessage(userMessage);
            get().clearAttachments();
            set({ input: "" });

            // Send to API
            const response = await fetch("/api/chat", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                messages: [...messages, userMessage],
                chatId,
                attachments,
              }),
            });
            console.log("response ai", response);

            if (!response.ok) {
              throw new Error("Failed to send message");
            }

            // Handle streaming response
            const reader = response.body?.getReader();
            if (!reader) throw new Error("No response body");

            // Add assistant message placeholder
            const assistantMessage: Message = {
              id: (Date.now() + 1).toString(),
              role: "assistant",
              content: "",
              timestamp: new Date(),
            };
            get().addMessage(assistantMessage);

            const decoder = new TextDecoder();

            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              const chunk = decoder.decode(value, { stream: true });
              console.log("chunk received:", chunk);

              // ✅ Update assistant message in Zustand directly
              set((state) => {
                const updatedMessages = [...state.messages];
                const lastMsg = updatedMessages[updatedMessages.length - 1];

                if (lastMsg?.role === "assistant") {
                  lastMsg.content += chunk;
                }

                return { messages: updatedMessages };
              });
            }
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : "Unknown error";
            set({ error: errorMessage });
            throw error;
          } finally {
            set({ isLoading: false, isStreaming: false });
          }
        },
        loadChatHistory: async () => {
          try {
            set({ isLoadingHistory: true, error: null });

            const response = await fetch("/api/chat/history");
            if (!response.ok) {
              throw new Error("Failed to load chat history");
            }

            const { chats } = await response.json();
            set({ chats });
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : "Unknown error";
            set({ error: errorMessage });
          } finally {
            set({ isLoadingHistory: false });
          }
        },

        loadChat: async (chatId) => {
          try {
            set({ isLoading: true, error: null });

            const response = await fetch(`/api/chat/${chatId}`);
            if (!response.ok) {
              throw new Error("Failed to load chat");
            }

            const { chat } = await response.json();
            set({
              currentChatId: chatId,
              messages: chat.messages || [],
            });
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : "Unknown error";
            set({ error: errorMessage });
          } finally {
            set({ isLoading: false });
          }
        },

        deleteChat: async (chatId) => {
          try {
            const response = await fetch(`/api/chat/${chatId}`, {
              method: "DELETE",
            });

            if (!response.ok) {
              throw new Error("Failed to delete chat");
            }

            get().removeChat(chatId);

            // Reset current chat if it was deleted
            if (get().currentChatId === chatId) {
              get().resetCurrentChat();
            }
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : "Unknown error";
            set({ error: errorMessage });
            throw error;
          }
        },

        updateChatTitle: async (chatId, title) => {
          try {
            const response = await fetch(`/api/chat/${chatId}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ title }),
            });

            if (!response.ok) {
              throw new Error("Failed to update chat title");
            }

            get().updateChat(chatId, { title });
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : "Unknown error";
            set({ error: errorMessage });
            throw error;
          }
        },

        // Reset actions
        reset: () => set(initialState),
        resetCurrentChat: () =>
          set({
            currentChatId: null,
            messages: [],
            input: "",
            attachments: [],
          }),
      }),
      {
        name: "chat-store",
        partialize: (state) => ({
          // Only persist essential data
          chats: state.chats,
          currentChatId: state.currentChatId,
        }),
      }
    ),
    { name: "chat-store" }
  )
);

// Selectors for optimized re-renders
export const useChatMessages = () => useChatStore((state) => state.messages)
export const useChatInput = () => useChatStore((state) => state.input)
export const useChatAttachments = () => useChatStore((state) => state.attachments)
export const useChatHistory = () => useChatStore((state) => state.chats)
export const useIsLoading = () => useChatStore((state) => state.isLoading);
export const useIsStreaming = () => useChatStore((state) => state.isStreaming);
export const useChatError = () => useChatStore((state) => state.error)
export const useCurrentChatId = () => useChatStore((state) => state.currentChatId)
