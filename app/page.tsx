"use client"

import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { HeroSection } from "@/components/landing/hero-section"
import { FeaturesSection } from "@/components/landing/features-section"
import { DemoSection } from "@/components/landing/demo-section"
import { CTASection } from "@/components/landing/cta-section"

export default function HomePage() {
  const { isSignedIn, isLoaded } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push("/chat")
    }
  }, [isSignedIn, isLoaded, router])

  // Show loading while checking auth status
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Don't render landing page if user is signed in (will redirect)
  if (isSignedIn) {
    return null
  }

  return (
    <main className="min-h-screen">
      <HeroSection />
      <FeaturesSection />
      <DemoSection />
      <CTASection />
    </main>
  )
}
