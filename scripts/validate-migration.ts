import connectToDatabase from "../lib/mongoose"
import { Chat, File, Memory } from "../models"
import { useChatStore, useFileStore, useMemoryStore } from "../store"

interface ValidationResult {
  component: string
  status: "pass" | "fail" | "warning"
  message: string
  details?: any
}

class MigrationValidator {
  private results: ValidationResult[] = []

  private addResult(component: string, status: "pass" | "fail" | "warning", message: string, details?: any) {
    this.results.push({ component, status, message, details })
    console.log(`[${status.toUpperCase()}] ${component}: ${message}`)
    if (details) {
      console.log("Details:", details)
    }
  }

  async validateDatabaseConnection() {
    try {
      await connectToDatabase()
      this.addResult("Database", "pass", "Successfully connected to MongoDB via Mongoose")
    } catch (error) {
      this.addResult("Database", "fail", "Failed to connect to MongoDB", error)
    }
  }

  async validateModels() {
    try {
      // Test Chat model
      const testChat = new Chat({
        id: "test_chat_" + Date.now(),
        title: "Test Chat",
        userId: "test_user",
        messages: [],
        metadata: {
          model: "gpt-4o-mini",
          totalTokens: 0,
          messageCount: 0,
        },
      })

      const chatValidation = testChat.validateSync()
      if (chatValidation) {
        this.addResult("Chat Model", "fail", "Chat model validation failed", chatValidation.errors)
      } else {
        this.addResult("Chat Model", "pass", "Chat model schema validation passed")
      }

      // Test File model
      const testFile = new File({
        id: "test_file_" + Date.now(),
        userId: "test_user",
        chatId: "test_chat",
        name: "test.txt",
        type: "text/plain",
        size: 1024,
        uploadcareUuid: "test_uuid",
        cloudinaryPublicId: "test_public_id",
        cloudinaryUrl: "https://test.cloudinary.com/test.txt",
        metadata: {
          originalFilename: "test.txt",
          mimeType: "text/plain",
          uploadedAt: new Date(),
        },
      })

      const fileValidation = testFile.validateSync()
      if (fileValidation) {
        this.addResult("File Model", "fail", "File model validation failed", fileValidation.errors)
      } else {
        this.addResult("File Model", "pass", "File model schema validation passed")
      }

      // Test Memory model
      const testMemory = new Memory({
        id: "test_memory_" + Date.now(),
        userId: "test_user",
        content: "Test memory content",
        type: "conversation",
        metadata: {
          chatId: "test_chat",
          importance: 0.8,
          tags: ["test"],
        },
      })

      const memoryValidation = testMemory.validateSync()
      if (memoryValidation) {
        this.addResult("Memory Model", "fail", "Memory model validation failed", memoryValidation.errors)
      } else {
        this.addResult("Memory Model", "pass", "Memory model schema validation passed")
      }
    } catch (error) {
      this.addResult("Models", "fail", "Model validation failed", error)
    }
  }

  validateZustandStores() {
    try {
      // Test if stores can be imported and have expected methods
      const chatStore = useChatStore.getState()
      const fileStore = useFileStore.getState()
      const memoryStore = useMemoryStore.getState()

      // Check Chat Store
      const chatMethods = [
        "setCurrentChatId",
        "setInput",
        "setMessages",
        "addMessage",
        "sendMessage",
        "loadChat",
        "loadChatHistory",
        "deleteChat",
        "updateChatTitle",
        "resetCurrentChat",
      ]
      const missingChatMethods = chatMethods.filter((method) => typeof chatStore[method] !== "function")

      if (missingChatMethods.length > 0) {
        this.addResult("Chat Store", "fail", "Missing methods in Chat Store", missingChatMethods)
      } else {
        this.addResult("Chat Store", "pass", "All required methods present in Chat Store")
      }

      // Check File Store
      const fileMethods = ["addAttachment", "removeAttachment", "clearAttachments", "uploadFile", "deleteFile"]
      const missingFileMethods = fileMethods.filter((method) => typeof fileStore[method] !== "function")

      if (missingFileMethods.length > 0) {
        this.addResult("File Store", "fail", "Missing methods in File Store", missingFileMethods)
      } else {
        this.addResult("File Store", "pass", "All required methods present in File Store")
      }

      // Check Memory Store
      const memoryMethods = ["searchMemories", "addMemory", "updateMemory", "deleteMemory", "loadMemories"]
      const missingMemoryMethods = memoryMethods.filter((method) => typeof memoryStore[method] !== "function")

      if (missingMemoryMethods.length > 0) {
        this.addResult("Memory Store", "fail", "Missing methods in Memory Store", missingMemoryMethods)
      } else {
        this.addResult("Memory Store", "pass", "All required methods present in Memory Store")
      }
    } catch (error) {
      this.addResult("Zustand Stores", "fail", "Failed to validate Zustand stores", error)
    }
  }

  async validateAPIEndpoints() {
    const endpoints = ["/api/chat", "/api/chat/new", "/api/files/upload", "/api/memory"]

    for (const endpoint of endpoints) {
      try {
        // Note: In a real test environment, you would make actual HTTP requests
        // For now, we'll just check if the route files exist
        this.addResult("API Endpoints", "warning", `Endpoint ${endpoint} should be tested with actual HTTP requests`)
      } catch (error) {
        this.addResult("API Endpoints", "fail", `Failed to validate ${endpoint}`, error)
      }
    }
  }

  validateEnvironmentVariables() {
    const requiredEnvVars = [
      "MONGODB_URI",
      "NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY",
      "UPLOADCARE_SECRET_KEY",
      "CLOUDINARY_CLOUD_NAME",
      "CLOUDINARY_API_KEY",
      "CLOUDINARY_API_SECRET",
      "MEM0_API_KEY",
    ]

    const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar])

    if (missingEnvVars.length > 0) {
      this.addResult("Environment Variables", "fail", "Missing required environment variables", missingEnvVars)
    } else {
      this.addResult("Environment Variables", "pass", "All required environment variables are present")
    }
  }

  async runAllValidations() {
    console.log("🚀 Starting ChatGPT Clone Migration Validation...\n")

    await this.validateDatabaseConnection()
    await this.validateModels()
    this.validateZustandStores()
    await this.validateAPIEndpoints()
    this.validateEnvironmentVariables()

    console.log("\n📊 Validation Summary:")
    console.log("=".repeat(50))

    const passed = this.results.filter((r) => r.status === "pass").length
    const failed = this.results.filter((r) => r.status === "fail").length
    const warnings = this.results.filter((r) => r.status === "warning").length

    console.log(`✅ Passed: ${passed}`)
    console.log(`❌ Failed: ${failed}`)
    console.log(`⚠️  Warnings: ${warnings}`)
    console.log(`📝 Total: ${this.results.length}`)

    if (failed > 0) {
      console.log("\n❌ Migration validation failed. Please fix the issues above.")
      process.exit(1)
    } else if (warnings > 0) {
      console.log("\n⚠️  Migration validation completed with warnings. Review the warnings above.")
    } else {
      console.log("\n🎉 Migration validation passed! All systems are working correctly.")
    }

    return this.results
  }
}

// Run validation if this script is executed directly
if (require.main === module) {
  const validator = new MigrationValidator()
  validator.runAllValidations().catch(console.error)
}

export default MigrationValidator
