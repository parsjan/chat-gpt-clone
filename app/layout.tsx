import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { ClerkProvider } from "@clerk/nextjs"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { ErrorBoundary } from "@/components/ui/error-boundary"
import { Suspense } from "react"
import "./globals.css"
import { UserSync } from "@/components/landing/UserSync"

export const metadata: Metadata = {
  title: "ChatGPT Clone - AI Conversations",
  description: "A pixel-perfect ChatGPT clone with advanced AI conversations, file uploads, and memory management",
  generator: "v0.app",
  keywords: ["AI", "ChatGPT", "Conversations", "OpenAI", "Chat", "Assistant"],
  authors: [{ name: "ChatGPT Clone" }],
  openGraph: {
    title: "ChatGPT Clone - AI Conversations",
    description: "Experience AI conversations with a pixel-perfect ChatGPT interface",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ChatGPT Clone - AI Conversations",
    description: "Experience AI conversations with a pixel-perfect ChatGPT interface",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider afterSignOutUrl="/">
      <html lang="en">
        <body
          className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}
        >
          <ErrorBoundary>
            <Suspense fallback={null}>
              <ThemeProvider
                attribute="class"
                defaultTheme="dark"
                enableSystem
                disableTransitionOnChange
              >
                <UserSync />
                {children}
                <Toaster />
              </ThemeProvider>
            </Suspense>
          </ErrorBoundary>
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  );
}
