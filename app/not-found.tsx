import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home, MessageSquare } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-6 max-w-md">
        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-muted-foreground">404</h1>
          <h2 className="text-2xl font-semibold">Page Not Found</h2>
          <p className="text-muted-foreground">The page you're looking for doesn't exist or has been moved.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/">
            <Button variant="default" className="gap-2">
              <Home className="h-4 w-4" />
              Go Home
            </Button>
          </Link>
          <Link href="/chat">
            <Button variant="outline" className="gap-2 bg-transparent">
              <MessageSquare className="h-4 w-4" />
              Start Chatting
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
