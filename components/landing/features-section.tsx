import { Card, CardContent } from "@/components/ui/card"
import { MessageSquare, Upload, Brain, Shield, Zap, Users } from "lucide-react"

const features = [
  {
    icon: MessageSquare,
    title: "AI Conversations",
    description: "Engage in natural, intelligent conversations with advanced AI that understands context and nuance.",
  },
  {
    icon: Upload,
    title: "File Upload",
    description: "Upload documents, images, and files to enhance your conversations with rich media support.",
  },
  {
    icon: Brain,
    title: "Memory Management",
    description: "AI remembers your preferences and conversation history for personalized interactions.",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "Your conversations are encrypted and secure with enterprise-grade privacy protection.",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Real-time streaming responses with optimized performance for seamless conversations.",
  },
  {
    icon: Users,
    title: "Multi-User Support",
    description: "Collaborate with team members and manage multiple conversation threads effortlessly.",
  },
]

export function FeaturesSection() {
  return (
    <section className="py-24 bg-muted/30">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-balance mb-6">
            Powerful Features for
            <span className="text-primary"> Modern AI </span>
            Conversations
          </h2>
          <p className="text-xl text-muted-foreground text-balance max-w-3xl mx-auto">
            Everything you need to have meaningful, productive conversations with AI. Built with the latest technology
            and designed for the future.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="group hover:shadow-lg transition-all duration-300 border-0 bg-background/80 backdrop-blur-sm"
            >
              <CardContent className="p-8">
                <div className="flex items-center justify-center w-16 h-16 bg-accent/10 rounded-2xl mb-6 group-hover:bg-accent/20 transition-colors">
                  <feature.icon className="w-8 h-8 text-accent" />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-balance">{feature.title}</h3>
                <p className="text-muted-foreground text-balance leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
