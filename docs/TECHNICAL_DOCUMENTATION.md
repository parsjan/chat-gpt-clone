# ChatGPT Clone - Technical Documentation

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture & Tech Stack](#architecture--tech-stack)
3. [Project Structure](#project-structure)
4. [Database Schema](#database-schema)
5. [API Endpoints](#api-endpoints)
6. [Authentication System](#authentication-system)
7. [File Upload System](#file-upload-system)
8. [AI Integration](#ai-integration)
9. [Memory Management](#memory-management)
10. [Frontend Components](#frontend-components)
11. [Environment Variables](#environment-variables)
12. [Deployment Guide](#deployment-guide)
13. [Development Setup](#development-setup)
14. [Performance Considerations](#performance-considerations)
15. [Security Features](#security-features)

---

## Project Overview

This is a pixel-perfect ChatGPT clone built with modern web technologies, featuring real-time AI conversations, file uploads, memory management, and user authentication. The application provides a seamless chat experience with advanced features like conversation history, file attachments, and intelligent memory context.

### Key Features

- **Pixel-perfect ChatGPT UI**: Exact replica of ChatGPT's interface
- **Real-time AI conversations**: Streaming responses using Vercel AI SDK
- **File upload system**: Support for images, PDFs, and documents
- **Memory management**: Intelligent conversation context using mem0
- **User authentication**: Secure auth with Clerk
- **Chat persistence**: MongoDB-based chat history
- **Responsive design**: Mobile-first responsive interface
- **Dark/Light themes**: Theme switching support

---

## Architecture & Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **State Management**: React hooks + SWR
- **Authentication**: Clerk

### Backend
- **Runtime**: Next.js API Routes
- **Database**: MongoDB
- **AI Integration**: Vercel AI SDK + OpenAI
- **File Storage**: Uploadcare + Cloudinary
- **Memory**: mem0 API

### Infrastructure
- **Deployment**: Vercel
- **CDN**: Cloudinary
- **File Processing**: Uploadcare
- **Analytics**: Vercel Analytics

---

## Project Structure

\`\`\`
chatgpt-clone/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── chat/                 # Chat endpoints
│   │   ├── files/                # File management
│   │   ├── memory/               # Memory management
│   │   └── admin/                # Admin utilities
│   ├── chat/                     # Chat pages
│   ├── settings/                 # Settings page
│   ├── sign-in/                  # Authentication pages
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Landing page
│   └── globals.css               # Global styles
├── components/                   # React components
│   ├── chat/                     # Chat-specific components
│   ├── landing/                  # Landing page components
│   ├── memory/                   # Memory management UI
│   └── ui/                       # shadcn/ui components
├── hooks/                        # Custom React hooks
├── lib/                          # Utility libraries
├── scripts/                      # Database scripts
├── types/                        # TypeScript definitions
└── middleware.ts                 # Route protection
\`\`\`

---

## Database Schema

### MongoDB Collections

#### 1. Users Collection
\`\`\`typescript
interface UserDocument {
  _id?: string
  clerkId: string
  email: string
  firstName?: string
  lastName?: string
  imageUrl?: string
  preferences: {
    theme: "light" | "dark" | "system"
    language: string
    notifications: boolean
  }
  createdAt: Date
  updatedAt: Date
}
\`\`\`

#### 2. Chats Collection
\`\`\`typescript
interface ChatDocument {
  _id?: string
  id: string
  title: string
  userId: string
  messages: MessageDocument[]
  metadata: {
    model: string
    totalTokens: number
    messageCount: number
  }
  createdAt: Date
  updatedAt: Date
}
\`\`\`

#### 3. Messages Schema
\`\`\`typescript
interface MessageDocument {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  timestamp: Date
  attachments?: FileAttachmentDocument[]
  metadata?: {
    tokens?: number
    model?: string
    finishReason?: string
  }
}
\`\`\`

#### 4. Files Collection
\`\`\`typescript
interface FileDocument {
  _id?: string
  id: string
  userId: string
  chatId?: string
  name: string
  type: string
  size: number
  uploadcareUuid: string
  cloudinaryPublicId: string
  cloudinaryUrl: string
  metadata: {
    originalFilename: string
    mimeType: string
    uploadedAt: Date
  }
  createdAt: Date
}
\`\`\`

#### 5. Sessions Collection
\`\`\`typescript
interface SessionDocument {
  _id?: string
  sessionId: string
  userId: string
  type: "chat" | "memory" | "preference"
  data: Record<string, any>
  expiresAt?: Date
  createdAt: Date
  updatedAt: Date
}
\`\`\`

### Database Indexes

\`\`\`javascript
// Performance indexes
db.chats.createIndex({ userId: 1, updatedAt: -1 })
db.chats.createIndex({ id: 1, userId: 1 })
db.files.createIndex({ userId: 1, chatId: 1 })
db.files.createIndex({ uploadcareUuid: 1 })
db.sessions.createIndex({ sessionId: 1 })
db.sessions.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })
\`\`\`

---

## API Endpoints

### Chat Management

#### POST `/api/chat`
**Purpose**: Send message and get AI response
**Authentication**: Required
**Request Body**:
\`\`\`json
{
  "messages": [
    {
      "role": "user",
      "content": "Hello, how are you?"
    }
  ],
  "chatId": "chat_123",
  "attachments": [
    {
      "id": "file_123",
      "name": "document.pdf",
      "type": "application/pdf",
      "size": 1024,
      "url": "https://cloudinary.com/..."
    }
  ]
}
\`\`\`
**Response**: Streaming AI response

#### POST `/api/chat/new`
**Purpose**: Create new chat session
**Authentication**: Required
**Request Body**:
\`\`\`json
{
  "firstMessage": "Hello"
}
\`\`\`
**Response**:
\`\`\`json
{
  "chatId": "chat_1234567890_abc123",
  "title": "Hello Chat"
}
\`\`\`

#### GET `/api/chat/history`
**Purpose**: Get user's chat history
**Authentication**: Required
**Response**:
\`\`\`json
{
  "chats": [
    {
      "id": "chat_123",
      "title": "My Chat",
      "userId": "user_123",
      "messages": [...],
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
\`\`\`

#### GET `/api/chat/[chatId]`
**Purpose**: Get specific chat
**Authentication**: Required
**Response**: Single chat object

#### DELETE `/api/chat/[chatId]`
**Purpose**: Delete chat
**Authentication**: Required
**Response**: Success confirmation

#### PATCH `/api/chat/[chatId]`
**Purpose**: Update chat (e.g., title)
**Authentication**: Required
**Request Body**:
\`\`\`json
{
  "title": "New Chat Title"
}
\`\`\`

### File Management

#### POST `/api/files/upload`
**Purpose**: Process file upload from Uploadcare
**Authentication**: Required
**Request Body**:
\`\`\`json
{
  "uploadcareUuid": "uuid-from-uploadcare",
  "chatId": "chat_123"
}
\`\`\`
**Response**:
\`\`\`json
{
  "file": {
    "id": "file_123",
    "name": "document.pdf",
    "type": "application/pdf",
    "size": 1024,
    "url": "https://cloudinary.com/..."
  }
}
\`\`\`

#### DELETE `/api/files/[fileId]`
**Purpose**: Delete file
**Authentication**: Required
**Response**: Success confirmation

### Memory Management

#### GET `/api/memory`
**Purpose**: Get user memories
**Authentication**: Required
**Query Parameters**:
- `query`: Search term (optional)
- `limit`: Number of results (default: 10)

#### POST `/api/memory`
**Purpose**: Add conversation to memory
**Authentication**: Required
**Request Body**:
\`\`\`json
{
  "messages": [...],
  "chatId": "chat_123",
  "metadata": {
    "model": "gpt-4o-mini",
    "tokens": 150
  }
}
\`\`\`

#### DELETE `/api/memory/[memoryId]`
**Purpose**: Delete memory
**Authentication**: Required

#### PUT `/api/memory/[memoryId]`
**Purpose**: Update memory
**Authentication**: Required

### Admin Utilities

#### GET `/api/admin/db-stats`
**Purpose**: Get database statistics
**Authentication**: Required
**Response**:
\`\`\`json
{
  "stats": {
    "totalChats": 10,
    "totalMessages": 50,
    "totalFiles": 5
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
\`\`\`

#### POST `/api/admin/cleanup`
**Purpose**: Cleanup old data
**Authentication**: Required
**Request Body**:
\`\`\`json
{
  "action": "cleanup_old_chats",
  "daysOld": 90
}
\`\`\`

---

## Authentication System

### Clerk Integration

The application uses Clerk for authentication with the following configuration:

#### Middleware Protection
\`\`\`typescript
// middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"

const isProtectedRoute = createRouteMatcher(["/chat(.*)", "/settings(.*)"])

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect()
  }
})
\`\`\`

#### Protected Routes
- `/chat/*` - All chat pages
- `/settings/*` - Settings pages

#### Authentication Helpers
\`\`\`typescript
// lib/auth.ts
export async function requireAuth() {
  const { userId } = await auth()
  if (!userId) {
    redirect("/sign-in")
  }
  return userId
}

export async function getCurrentUser() {
  const user = await currentUser()
  return user
}
\`\`\`

### User Flow
1. **Unauthenticated**: Redirected to landing page
2. **Sign In**: Clerk handles authentication
3. **Authenticated**: Access to chat and settings
4. **Auto-redirect**: Authenticated users go directly to chat

---

## File Upload System

### Two-Stage Upload Process

#### Stage 1: Uploadcare Widget
- **Purpose**: User-friendly upload interface
- **Features**: Drag & drop, camera, URL import
- **Processing**: Image optimization, format conversion
- **Temporary storage**: Uploadcare CDN

#### Stage 2: Cloudinary Storage
- **Purpose**: Permanent file storage
- **Features**: Advanced transformations, CDN delivery
- **Organization**: Folder structure by date/user
- **Backup**: Redundant storage

### File Upload Flow

\`\`\`typescript
// 1. User uploads via Uploadcare widget
const fileInfo = await getUploadcareFileInfo(uploadcareUuid)

// 2. Transfer to Cloudinary for permanent storage
const cloudinaryResult = await uploadToCloudinary(
  fileInfo.original_file_url, 
  fileInfo.original_filename
)

// 3. Save metadata to database
const fileMetadata = {
  id: generateFileId(),
  userId,
  chatId,
  name: fileInfo.original_filename,
  type: fileInfo.mime_type,
  size: fileInfo.size,
  uploadcareUuid,
  cloudinaryPublicId: cloudinaryResult.publicId,
  cloudinaryUrl: cloudinaryResult.url,
  createdAt: new Date()
}
\`\`\`

### Supported File Types
- **Images**: JPG, PNG, GIF, WebP
- **Documents**: PDF, DOC, DOCX, TXT
- **Size Limit**: 10MB per file
- **Processing**: Automatic optimization and format conversion

---

## AI Integration

### Vercel AI SDK Configuration

\`\`\`typescript
// lib/ai.ts
import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"

export const aiModel = openai("gpt-4o-mini")

export async function generateAIResponse(messages: any[]) {
  return await streamText({
    model: aiModel,
    messages,
    temperature: 0.7,
    maxTokens: 2048,
  })
}
\`\`\`

### Streaming Implementation

The chat uses streaming responses for real-time AI interaction:

\`\`\`typescript
// Real-time streaming in /api/chat
const result = streamText({
  model: openai("gpt-4o-mini"),
  messages: contextualMessages,
  temperature: 0.7,
  maxTokens: 2048,
  async onFinish({ text, usage }) {
    // Save to database and memory
    await saveConversation(text, usage)
  }
})

return result.toDataStreamResponse()
\`\`\`

### Context Enhancement

Messages are enhanced with:
- **File attachments**: Descriptions of uploaded files
- **Memory context**: Relevant previous conversations
- **User preferences**: Personalized responses

---

## Memory Management

### mem0 Integration

The application uses mem0 for intelligent conversation memory:

\`\`\`typescript
// lib/memory.ts
export class MemoryManager {
  static async addConversationMemory(
    messages: Message[],
    userId: string,
    chatId: string,
    metadata?: any
  ) {
    const conversationSummary = await this.generateSummary(messages)
    return await memoryClient.add(conversationSummary, userId, metadata)
  }

  static async getRelevantContext(
    query: string,
    userId: string,
    limit: number = 3
  ): Promise<string> {
    const memories = await memoryClient.search(query, userId, limit)
    return this.formatMemoryContext(memories)
  }
}
\`\`\`

### Memory Features

1. **Automatic Storage**: Conversations automatically saved to memory
2. **Intelligent Retrieval**: Relevant context retrieved for new messages
3. **Search Functionality**: Users can search their conversation history
4. **Memory Management**: Users can view, edit, and delete memories
5. **Context Formatting**: Memories formatted for AI consumption

### Memory Types

- **Conversation Summaries**: Key points from chat sessions
- **User Preferences**: Learned user preferences and patterns
- **Important Information**: Facts and details the user wants remembered
- **Context Relationships**: Connections between different conversations

---

## Frontend Components

### Chat Interface Components

#### ChatLayout
- **Purpose**: Main layout wrapper for chat pages
- **Features**: Responsive sidebar, mobile navigation
- **State**: Sidebar open/close, mobile detection

#### ChatInterface
- **Purpose**: Core chat functionality
- **Features**: Message display, input handling, streaming
- **Hooks**: useChat for state management

#### MessageBubble
- **Purpose**: Individual message display
- **Features**: User/AI styling, attachments, actions
- **Actions**: Copy, edit, regenerate, thumbs up/down

#### MessageInput
- **Purpose**: Message composition
- **Features**: Auto-resize, file upload, keyboard shortcuts
- **Validation**: Message length, attachment limits

#### Sidebar
- **Purpose**: Chat history and navigation
- **Features**: Chat list, new chat, settings access
- **Actions**: Chat selection, deletion, title editing

### Landing Page Components

#### HeroSection
- **Purpose**: Main landing page hero
- **Features**: Compelling headline, CTA buttons
- **Design**: Gradient backgrounds, animations

#### FeaturesSection
- **Purpose**: Feature showcase
- **Features**: Grid layout, icons, descriptions
- **Highlights**: AI conversations, file uploads, memory

#### DemoSection
- **Purpose**: Interactive demonstration
- **Features**: Animated chat preview
- **Engagement**: Shows app capabilities

#### CTASection
- **Purpose**: Call-to-action
- **Features**: Sign-up encouragement
- **Design**: Strong visual hierarchy

### UI Components (shadcn/ui)

The application uses a complete set of shadcn/ui components:
- **Form Controls**: Button, Input, Textarea, Select
- **Layout**: Card, Separator, ScrollArea
- **Feedback**: Toast, Alert, Loading Spinner
- **Navigation**: Dropdown Menu, Tabs
- **Data Display**: Avatar, Badge, Progress

---

## Environment Variables

### Required Variables

\`\`\`bash
# Database
MONGODB_URI=mongodb://localhost:27017/chatgpt-clone

# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# AI Integration
OPENAI_API_KEY=sk-...

# Memory Management
MEM0_API_KEY=mem0_...

# File Upload (Uploadcare)
NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY=...
UPLOADCARE_SECRET_KEY=...

# File Storage (Cloudinary)
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# Optional
VERCEL_URL=https://your-app.vercel.app
\`\`\`

### Environment Setup

1. **Development**: Use `.env.local` file
2. **Production**: Set in Vercel dashboard
3. **Security**: Never commit secrets to version control
4. **Validation**: App validates required variables on startup

---

## Deployment Guide

### Vercel Deployment

#### Prerequisites
- Vercel account
- GitHub repository
- Environment variables configured

#### Deployment Steps

1. **Connect Repository**
   \`\`\`bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Login and deploy
   vercel login
   vercel --prod
   \`\`\`

2. **Configure Environment Variables**
   - Go to Vercel dashboard
   - Navigate to project settings
   - Add all required environment variables

3. **Database Setup**
   - Ensure MongoDB Atlas is configured
   - Update connection string in environment variables
   - Run database migrations

4. **Domain Configuration**
   - Configure custom domain (optional)
   - Set up SSL certificates
   - Configure redirects

#### Build Configuration

\`\`\`javascript
// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['mongodb']
  },
  images: {
    domains: ['ucarecdn.com', 'res.cloudinary.com']
  }
}

export default nextConfig
\`\`\`

### Performance Optimizations

1. **Image Optimization**: Next.js automatic image optimization
2. **Code Splitting**: Automatic route-based splitting
3. **Caching**: Vercel Edge Network caching
4. **Compression**: Gzip/Brotli compression enabled
5. **CDN**: Cloudinary for file delivery

---

## Development Setup

### Prerequisites

- Node.js 18+ 
- npm or yarn
- MongoDB (local or Atlas)
- Git

### Installation Steps

1. **Clone Repository**
   \`\`\`bash
   git clone <repository-url>
   cd chatgpt-clone
   \`\`\`

2. **Install Dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Environment Setup**
   \`\`\`bash
   cp .env.example .env.local
   # Edit .env.local with your values
   \`\`\`

4. **Database Setup**
   \`\`\`bash
   # Run database initialization
   npm run db:init
   
   # Run migrations
   npm run db:migrate
   \`\`\`

5. **Start Development Server**
   \`\`\`bash
   npm run dev
   \`\`\`

### Development Scripts

\`\`\`json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "db:init": "node scripts/init-database.js",
    "db:migrate": "node scripts/run-migrations.js"
  }
}
\`\`\`

### Code Quality

- **TypeScript**: Strict type checking enabled
- **ESLint**: Code linting with Next.js rules
- **Prettier**: Code formatting (optional)
- **Husky**: Git hooks for quality checks (optional)

---

## Performance Considerations

### Frontend Performance

1. **Code Splitting**
   - Automatic route-based splitting
   - Dynamic imports for heavy components
   - Lazy loading for non-critical features

2. **Image Optimization**
   - Next.js Image component
   - Cloudinary transformations
   - WebP format conversion

3. **Caching Strategy**
   - SWR for data fetching
   - Browser caching for static assets
   - CDN caching for files

### Backend Performance

1. **Database Optimization**
   - Proper indexing strategy
   - Connection pooling
   - Query optimization

2. **API Optimization**
   - Response streaming for AI
   - Efficient data serialization
   - Rate limiting (future enhancement)

3. **Memory Management**
   - Efficient memory usage
   - Garbage collection optimization
   - Connection cleanup

### Monitoring

1. **Vercel Analytics**: Built-in performance monitoring
2. **Error Tracking**: Console logging (can be enhanced with Sentry)
3. **Database Monitoring**: MongoDB Atlas monitoring
4. **File Storage**: Cloudinary usage analytics

---

## Security Features

### Authentication Security

1. **Clerk Integration**
   - Industry-standard authentication
   - Session management
   - CSRF protection

2. **Route Protection**
   - Middleware-based protection
   - Server-side auth checks
   - Automatic redirects

### Data Security

1. **Database Security**
   - User data isolation
   - Input validation
   - SQL injection prevention (NoSQL)

2. **File Upload Security**
   - File type validation
   - Size limits
   - Virus scanning (Uploadcare)

3. **API Security**
   - Authentication required
   - User authorization checks
   - Input sanitization

### Privacy Features

1. **Data Ownership**
   - Users own their data
   - Data deletion capabilities
   - Export functionality (future)

2. **Memory Privacy**
   - User-specific memories
   - Secure memory storage
   - Memory deletion options

### Security Best Practices

1. **Environment Variables**: Secure secret management
2. **HTTPS**: SSL/TLS encryption
3. **Content Security Policy**: XSS protection
4. **Rate Limiting**: API abuse prevention (future)

---

## Troubleshooting

### Common Issues

1. **Database Connection**
   - Check MongoDB URI
   - Verify network connectivity
   - Check authentication credentials

2. **File Upload Issues**
   - Verify Uploadcare configuration
   - Check Cloudinary credentials
   - Validate file size limits

3. **AI Integration**
   - Verify OpenAI API key
   - Check rate limits
   - Monitor token usage

4. **Authentication Problems**
   - Check Clerk configuration
   - Verify environment variables
   - Clear browser cache

### Debug Mode

Enable debug logging by setting:
\`\`\`bash
DEBUG=true
NODE_ENV=development
\`\`\`

### Support Resources

1. **Documentation**: This technical guide
2. **Error Logs**: Check Vercel function logs
3. **Database Logs**: MongoDB Atlas logs
4. **Community**: Next.js and Vercel communities

---

## Future Enhancements

### Planned Features

1. **Advanced Memory**
   - Semantic search improvements
   - Memory categorization
   - Memory sharing between users

2. **Enhanced File Support**
   - More file types
   - File preview capabilities
   - Collaborative editing

3. **Performance Improvements**
   - Redis caching layer
   - Database query optimization
   - CDN improvements

4. **Security Enhancements**
   - Rate limiting
   - Advanced monitoring
   - Audit logging

### Scalability Considerations

1. **Database Scaling**
   - MongoDB sharding
   - Read replicas
   - Connection pooling

2. **File Storage Scaling**
   - Multiple CDN regions
   - Storage optimization
   - Backup strategies

3. **API Scaling**
   - Load balancing
   - Caching layers
   - Microservices architecture

---

## Conclusion

This ChatGPT clone represents a modern, full-stack application built with industry best practices. The architecture is designed for scalability, security, and maintainability, while providing an excellent user experience that matches the original ChatGPT interface.

The comprehensive feature set includes real-time AI conversations, intelligent file handling, advanced memory management, and robust user authentication. The technical implementation leverages cutting-edge technologies and follows established patterns for web application development.

For questions or support, refer to the troubleshooting section or consult the individual component documentation within the codebase.

---

*Last Updated: January 2024*
*Version: 1.0.0*
