"use client"

import { useEffect, useRef } from "react"
import SwaggerUI from "swagger-ui-react"
import "swagger-ui-react/swagger-ui.css"

export default function ApiDocsPage() {
  const swaggerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Custom CSS for better styling with dark mode support
    const style = document.createElement("style")
    style.textContent = `
      .swagger-ui .topbar { display: none; }
      .swagger-ui .info { margin: 20px 0; }
      .swagger-ui .scheme-container { 
        background: hsl(var(--muted)); 
        padding: 10px; 
        border-radius: 4px; 
      }
      .swagger-ui .btn.authorize { 
        background-color: hsl(var(--primary)); 
        border-color: hsl(var(--primary)); 
        color: hsl(var(--primary-foreground));
      }
      .swagger-ui .btn.authorize:hover { 
        background-color: hsl(var(--primary)); 
        border-color: hsl(var(--primary)); 
        opacity: 0.9;
      }
      .swagger-ui .wrapper { 
        padding: 0; 
      }
      .swagger-ui .info .title { 
        color: hsl(var(--foreground)); 
      }
      .swagger-ui .info .description { 
        color: hsl(var(--muted-foreground)); 
      }
      .swagger-ui .opblock-tag { 
        color: hsl(var(--foreground)); 
        border-bottom: 1px solid hsl(var(--border));
      }
      .swagger-ui .opblock { 
        border: 1px solid hsl(var(--border)); 
        background: hsl(var(--card));
      }
      .swagger-ui .opblock .opblock-summary { 
        border-bottom: 1px solid hsl(var(--border)); 
      }
      .swagger-ui .parameter__name { 
        color: hsl(var(--foreground)); 
      }
      .swagger-ui .response-col_status { 
        color: hsl(var(--foreground)); 
      }
    `
    document.head.appendChild(style)

    return () => {
      document.head.removeChild(style)
    }
  }, [])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <p className="text-muted-foreground text-lg">
          Comprehensive API documentation for the ChatGPT Clone application. All endpoints require authentication via
          Clerk.
        </p>
      </div>

      <div className="bg-card rounded-lg shadow-sm border" ref={swaggerRef}>
        <SwaggerUI
          url="/api/docs"
          docExpansion="list"
          defaultModelsExpandDepth={2}
          defaultModelExpandDepth={2}
          displayRequestDuration={true}
          filter={true}
          showExtensions={true}
          showCommonExtensions={true}
          tryItOutEnabled={true}
          requestInterceptor={(request) => {
            // Add auth header if available
            const token = localStorage.getItem("clerk-db-jwt")
            if (token) {
              request.headers.Authorization = `Bearer ${token}`
            }
            return request
          }}
        />
      </div>

      <div className="mt-8 bg-card rounded-lg p-6 border">
        <h2 className="text-2xl font-semibold mb-4">Authentication</h2>
        <p className="text-muted-foreground mb-4">
          All API endpoints require authentication using Clerk. Include your JWT token in the Authorization header:
        </p>
        <code className="bg-muted p-2 rounded block">Authorization: Bearer YOUR_JWT_TOKEN</code>

        <h3 className="text-xl font-semibold mt-6 mb-3">Rate Limiting</h3>
        <p className="text-muted-foreground">
          API requests are rate-limited to prevent abuse. Standard limits apply per user per minute.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-3">Response Format</h3>
        <p className="text-muted-foreground">
          All responses are in JSON format. Error responses include a message and status code.
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-3">Available Endpoints</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-semibold text-sm mb-2">Chat Operations</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Send messages and get AI responses</li>
              <li>• Create and manage chat sessions</li>
              <li>• View chat history</li>
            </ul>
          </div>
          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-semibold text-sm mb-2">File Management</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Upload files via Uploadcare</li>
              <li>• Store files in Cloudinary</li>
              <li>• Delete uploaded files</li>
            </ul>
          </div>
          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-semibold text-sm mb-2">Memory System</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Store conversation memories</li>
              <li>• Search and retrieve memories</li>
              <li>• Update and delete memories</li>
            </ul>
          </div>
          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-semibold text-sm mb-2">Admin Operations</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Cleanup old chats</li>
              <li>• View database statistics</li>
              <li>• Manage expired sessions</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
