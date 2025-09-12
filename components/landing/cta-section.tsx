"use client";
import { Button } from "@/components/ui/button";
import { SignInButton } from "@clerk/nextjs";
import { ArrowRight, MessageSquare } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-24 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-balance mb-6">
          Ready to Transform Your
          <span className="text-primary"> AI Experience</span>?
        </h2>

        <p className="text-xl text-muted-foreground text-balance mb-8 max-w-2xl mx-auto">
          Join thousands of users who are already experiencing the future of AI
          conversations. Start your journey today - no credit card required.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <SignInButton  forceRedirectUrl="/chat">
            <Button size="lg" className="px-8 py-6 text-lg font-semibold group">
              <MessageSquare className="w-5 h-5 mr-2" />
              Get Started Free
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </SignInButton>
        </div>

        <div className="mt-8 flex items-center justify-center gap-8 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">✓ Free forever plan</div>
          <div className="flex items-center gap-2">✓ No setup fees</div>
          <div className="flex items-center gap-2">✓ Cancel anytime</div>
        </div>
      </div>
    </section>
  );
}
