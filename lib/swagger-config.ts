export const swaggerConfig = {
  openapi: "3.0.0",
  info: {
    title: "ChatGPT Clone API",
    version: "1.0.0",
    description: "A comprehensive API for a ChatGPT clone with memory, file uploads, and admin features",
    contact: {
      name: "API Support",
      email: "support@chatgpt-clone.com",
    },
  },
  servers: [
    {
      url: process.env.NODE_ENV === "production" ? "https://galxy.vercel.app" : "http://localhost:3000",
      description: process.env.NODE_ENV === "production" ? "Production server" : "Development server",
    },
  ],
  components: {
    securitySchemes: {
      ClerkAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Clerk authentication token",
      },
    },
    schemas: {
      Error: {
        type: "object",
        properties: {
          message: { type: "string" },
          status: { type: "number" },
        },
      },
      Message: {
        type: "object",
        properties: {
          id: { type: "string" },
          role: { type: "string", enum: ["user", "assistant", "system"] },
          content: { type: "string" },
          timestamp: { type: "string", format: "date-time" },
          attachments: {
            type: "array",
            items: { $ref: "#/components/schemas/Attachment" },
          },
          metadata: { type: "object" },
        },
      },
      Chat: {
        type: "object",
        properties: {
          id: { type: "string" },
          title: { type: "string" },
          userId: { type: "string" },
          messages: {
            type: "array",
            items: { $ref: "#/components/schemas/Message" },
          },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
          metadata: {
            type: "object",
            properties: {
              model: { type: "string" },
              totalTokens: { type: "number" },
              messageCount: { type: "number" },
            },
          },
        },
      },
      File: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          type: { type: "string" },
          size: { type: "number" },
          url: { type: "string" },
          uploadcareUuid: { type: "string" },
          cloudinaryUrl: { type: "string" },
        },
      },
      Attachment: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          type: { type: "string" },
          size: { type: "number" },
          url: { type: "string" },
        },
      },
      Memory: {
        type: "object",
        properties: {
          id: { type: "string" },
          content: { type: "string" },
          type: { type: "string", enum: ["conversation", "preference", "fact", "context"] },
          userId: { type: "string" },
          chatId: { type: "string" },
          importance: { type: "number", minimum: 0, maximum: 1 },
          createdAt: { type: "string", format: "date-time" },
          metadata: { type: "object" },
        },
      },
    },
  },
  security: [{ ClerkAuth: [] }],
  paths: {
    "/api/chat": {
      post: {
        tags: ["Chat"],
        summary: "Send message and get AI response",
        description: "Send a message to the AI and receive a streaming response",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  messages: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Message" },
                  },
                  chatId: { type: "string" },
                  attachments: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Attachment" },
                  },
                },
                required: ["messages"],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Streaming AI response",
            content: {
              "text/plain": {
                schema: { type: "string" },
              },
            },
          },
          "400": { description: "Invalid messages format" },
          "401": { description: "Unauthorized" },
          "500": { description: "Internal Server Error" },
        },
      },
    },
    "/api/chat/new": {
      post: {
        tags: ["Chat"],
        summary: "Create new chat",
        description: "Create a new chat session",
        requestBody: {
          required: false,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  firstMessage: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Chat created successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    chatId: { type: "string" },
                    title: { type: "string" },
                  },
                },
              },
            },
          },
          "401": { description: "Unauthorized" },
          "500": { description: "Internal Server Error" },
        },
      },
    },
    "/api/chat/history": {
      get: {
        tags: ["Chat"],
        summary: "Get chat history",
        description: "Retrieve the last 50 chats for the authenticated user",
        responses: {
          "200": {
            description: "Chat history retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    chats: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Chat" },
                    },
                  },
                },
              },
            },
          },
          "401": { description: "Unauthorized" },
          "500": { description: "Internal Server Error" },
        },
      },
    },
    "/api/chat/{chatId}": {
      get: {
        tags: ["Chat"],
        summary: "Get specific chat",
        description: "Retrieve a specific chat by ID",
        parameters: [
          {
            name: "chatId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": {
            description: "Chat retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    chat: { $ref: "#/components/schemas/Chat" },
                  },
                },
              },
            },
          },
          "401": { description: "Unauthorized" },
          "404": { description: "Chat not found" },
          "500": { description: "Internal Server Error" },
        },
      },
      delete: {
        tags: ["Chat"],
        summary: "Delete chat",
        description: "Delete a specific chat by ID",
        parameters: [
          {
            name: "chatId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": {
            description: "Chat deleted successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                  },
                },
              },
            },
          },
          "401": { description: "Unauthorized" },
          "404": { description: "Chat not found" },
          "500": { description: "Internal Server Error" },
        },
      },
      patch: {
        tags: ["Chat"],
        summary: "Update chat",
        description: "Update chat title",
        parameters: [
          {
            name: "chatId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  title: { type: "string" },
                },
                required: ["title"],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Chat updated successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                  },
                },
              },
            },
          },
          "401": { description: "Unauthorized" },
          "404": { description: "Chat not found" },
          "500": { description: "Internal Server Error" },
        },
      },
    },
    "/api/files/upload": {
      post: {
        tags: ["Files"],
        summary: "Upload file",
        description: "Upload a file via Uploadcare and store in Cloudinary",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  uploadcareUuid: { type: "string" },
                  chatId: { type: "string" },
                },
                required: ["uploadcareUuid"],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "File uploaded successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    uploadcareUuid: { type: "string" },
                    cloudinaryUrl: { type: "string" },
                    file: { $ref: "#/components/schemas/File" },
                  },
                },
              },
            },
          },
          "400": { description: "Missing uploadcare UUID" },
          "401": { description: "Unauthorized" },
          "500": { description: "Internal Server Error" },
        },
      },
    },
    "/api/files/{fileId}": {
      delete: {
        tags: ["Files"],
        summary: "Delete file",
        description: "Delete a file by ID",
        parameters: [
          {
            name: "fileId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": {
            description: "File deleted successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                  },
                },
              },
            },
          },
          "401": { description: "Unauthorized" },
          "404": { description: "File not found" },
          "500": { description: "Internal Server Error" },
        },
      },
    },
    "/api/memory": {
      get: {
        tags: ["Memory"],
        summary: "Get memories",
        description: "Get all memories or search memories with query parameter",
        parameters: [
          {
            name: "query",
            in: "query",
            required: false,
            schema: { type: "string" },
            description: "Search query for memories",
          },
          {
            name: "limit",
            in: "query",
            required: false,
            schema: { type: "integer", default: 10 },
            description: "Maximum number of memories to return",
          },
        ],
        responses: {
          "200": {
            description: "Memories retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Memory" },
                },
              },
            },
          },
          "401": { description: "Unauthorized" },
          "500": { description: "Internal Server Error" },
        },
      },
      post: {
        tags: ["Memory"],
        summary: "Create memory or search",
        description: "Create a new memory or search existing memories",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  messages: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Message" },
                  },
                  chatId: { type: "string" },
                  metadata: { type: "object" },
                  action: { type: "string", enum: ["search", "create"] },
                  memory: { type: "string" },
                  query: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Memory operation successful",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    result: { type: "object" },
                    memories: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Memory" },
                    },
                  },
                },
              },
            },
          },
          "400": { description: "Invalid request format" },
          "401": { description: "Unauthorized" },
          "500": { description: "Internal Server Error" },
        },
      },
    },
    "/api/memory/{memoryId}": {
      put: {
        tags: ["Memory"],
        summary: "Update memory",
        description: "Update a specific memory by ID",
        parameters: [
          {
            name: "memoryId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  memory: { type: "string" },
                },
                required: ["memory"],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Memory updated successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    result: { type: "object" },
                  },
                },
              },
            },
          },
          "400": { description: "Memory content is required" },
          "401": { description: "Unauthorized" },
          "500": { description: "Internal Server Error" },
        },
      },
      delete: {
        tags: ["Memory"],
        summary: "Delete memory",
        description: "Delete a specific memory by ID",
        parameters: [
          {
            name: "memoryId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": {
            description: "Memory deleted successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    result: { type: "object" },
                  },
                },
              },
            },
          },
          "401": { description: "Unauthorized" },
          "500": { description: "Internal Server Error" },
        },
      },
    },
    "/api/admin/cleanup": {
      post: {
        tags: ["Admin"],
        summary: "Admin cleanup operations",
        description: "Perform cleanup operations like removing old chats or expired sessions",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  action: {
                    type: "string",
                    enum: ["cleanup_old_chats", "cleanup_expired_sessions"],
                  },
                  daysOld: { type: "integer", default: 90 },
                },
                required: ["action"],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Cleanup operation completed",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    deletedCount: { type: "number" },
                    action: { type: "string" },
                  },
                },
              },
            },
          },
          "400": { description: "Invalid action" },
          "401": { description: "Unauthorized" },
          "500": { description: "Internal Server Error" },
        },
      },
    },
    "/api/admin/db-stats": {
      get: {
        tags: ["Admin"],
        summary: "Get database statistics",
        description: "Retrieve database statistics for the authenticated user",
        responses: {
          "200": {
            description: "Database statistics retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    stats: { type: "object" },
                    timestamp: { type: "string", format: "date-time" },
                  },
                },
              },
            },
          },
          "401": { description: "Unauthorized" },
          "500": { description: "Internal Server Error" },
        },
      },
    },
  },
}
