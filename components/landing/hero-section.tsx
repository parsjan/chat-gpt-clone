"use client"

import { Button } from "@/components/ui/button"
import { SignInButton } from "@clerk/nextjs"
import { MessageSquare, Sparkles, Zap } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      <div className="absolute top-20 left-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="flex items-center gap-1 px-3 py-1 bg-accent/10 rounded-full text-accent text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            AI Powered
          </div>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold text-balance mb-6">
          Revolutionize Your
          <span className="text-primary"> Conversations </span>
          with AI
        </h1>

        <p className="text-xl md:text-2xl text-muted-foreground text-balance mb-8 max-w-3xl mx-auto">
          Experience the future of AI conversations with our Chat Bot. Upload files, maintain
          context, and engage in intelligent discussions.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <SignInButton forceRedirectUrl="/chat" >
            <Button size="lg" className="px-8 py-6 text-lg font-semibold">
              <MessageSquare className="w-5 h-5 mr-2" />
              Try it Now
            </Button>
          </SignInButton>

          <Button variant="outline" size="lg" className="px-8 py-6 text-lg bg-transparent">
            <Zap className="w-5 h-5 mr-2" />
            View Demo
          </Button>
        </div>

        <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-accent rounded-full" />
            No credit card required
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-accent rounded-full" />
            Free to start
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-accent rounded-full" />
            Instant setup
          </div>
        </div>
      </div>
    </section>
  )
}
