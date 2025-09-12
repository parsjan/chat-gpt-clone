import connectToDatabase from "../lib/mongoose"
import { Chat, File, Memory } from "../models"
import { generateTitle } from "../lib/ai"

async function testChatFeatures() {
  console.log("🧪 Testing Chat Features...")

  try {
    await connectToDatabase()

    // Test creating a new chat
    const testChatId = `test_chat_${Date.now()}`
    const newChat = new Chat({
      id: testChatId,
      title: "Test Chat",
      userId: "test_user_123",
      messages: [],
      metadata: {
        model: "gpt-4o-mini",
        totalTokens: 0,
        messageCount: 0,
      },
    })

    await newChat.save()
    console.log("✅ Chat creation successful")

    // Test adding messages
    const userMessage = {
      id: "msg_1",
      role: "user" as const,
      content: "Hello, this is a test message",
      timestamp: new Date(),
    }

    const assistantMessage = {
      id: "msg_2",
      role: "assistant" as const,
      content: "Hello! I received your test message.",
      timestamp: new Date(),
    }

    await Chat.findOneAndUpdate(
      { id: testChatId },
      {
        $push: {
          messages: { $each: [userMessage, assistantMessage] },
        },
        $inc: {
          "metadata.messageCount": 2,
        },
      },
    )
    console.log("✅ Message addition successful")

    // Test retrieving chat
    const retrievedChat = await Chat.findOne({ id: testChatId })
    if (retrievedChat && retrievedChat.messages.length === 2) {
      console.log("✅ Chat retrieval successful")
    } else {
      console.log("❌ Chat retrieval failed")
    }

    // Test title generation
    const generatedTitle = await generateTitle("Hello, this is a test message for title generation")
    console.log("✅ Title generation successful:", generatedTitle)

    // Cleanup
    await Chat.deleteOne({ id: testChatId })
    console.log("✅ Chat cleanup successful")
  } catch (error) {
    console.error("❌ Chat features test failed:", error)
  }
}

async function testFileFeatures() {
  console.log("\n🧪 Testing File Features...")

  try {
    await connectToDatabase()

    // Test creating a file record
    const testFileId = `test_file_${Date.now()}`
    const newFile = new File({
      id: testFileId,
      userId: "test_user_123",
      chatId: "test_chat_123",
      name: "test-document.pdf",
      type: "application/pdf",
      size: 2048576,
      uploadcareUuid: "test-uuid-123",
      cloudinaryPublicId: "chatgpt-clone/test-file",
      cloudinaryUrl: "https://res.cloudinary.com/test/test-file.pdf",
      metadata: {
        originalFilename: "test-document.pdf",
        mimeType: "application/pdf",
        uploadedAt: new Date(),
      },
    })

    await newFile.save()
    console.log("✅ File creation successful")

    // Test retrieving file
    const retrievedFile = await File.findOne({ id: testFileId })
    if (retrievedFile && retrievedFile.name === "test-document.pdf") {
      console.log("✅ File retrieval successful")
    } else {
      console.log("❌ File retrieval failed")
    }

    // Cleanup
    await File.deleteOne({ id: testFileId })
    console.log("✅ File cleanup successful")
  } catch (error) {
    console.error("❌ File features test failed:", error)
  }
}

async function testMemoryFeatures() {
  console.log("\n🧪 Testing Memory Features...")

  try {
    await connectToDatabase()

    // Test creating a memory record
    const testMemoryId = `test_memory_${Date.now()}`
    const newMemory = new Memory({
      id: testMemoryId,
      userId: "test_user_123",
      content: "User prefers concise explanations and technical details",
      type: "preference",
      metadata: {
        chatId: "test_chat_123",
        importance: 0.9,
        tags: ["preference", "communication-style"],
        extractedAt: new Date(),
      },
    })

    await newMemory.save()
    console.log("✅ Memory creation successful")

    // Test retrieving memory
    const retrievedMemory = await Memory.findOne({ id: testMemoryId })
    if (retrievedMemory && retrievedMemory.type === "preference") {
      console.log("✅ Memory retrieval successful")
    } else {
      console.log("❌ Memory retrieval failed")
    }

    // Test memory search by content
    const searchResults = await Memory.find({
      userId: "test_user_123",
      content: { $regex: "technical", $options: "i" },
    })

    if (searchResults.length > 0) {
      console.log("✅ Memory search successful")
    } else {
      console.log("❌ Memory search failed")
    }

    // Cleanup
    await Memory.deleteOne({ id: testMemoryId })
    console.log("✅ Memory cleanup successful")
  } catch (error) {
    console.error("❌ Memory features test failed:", error)
  }
}

async function runAllTests() {
  console.log("🚀 Starting Feature Tests for ChatGPT Clone...\n")

  await testChatFeatures()
  await testFileFeatures()
  await testMemoryFeatures()

  console.log("\n🎉 All feature tests completed!")
  console.log("Check the output above for any failures that need attention.")
}

// Run tests if this script is executed directly
if (require.main === module) {
  runAllTests().catch(console.error)
}

export { testChatFeatures, testFileFeatures, testMemoryFeatures, runAllTests }
