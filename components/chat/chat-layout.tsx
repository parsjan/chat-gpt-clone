"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "./sidebar";
import { ChatInterface } from "./chat-interface";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatLayoutProps {
  chatId?: string;
}

export function ChatLayout({ chatId }: ChatLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setSidebarOpen(true);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <div className="h-screen bg-background flex">
      {/* Sidebar (fixed on desktop) */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-200 ease-in-out bg-background border-r border-border",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          "md:translate-x-0" // Always visible on desktop
        )}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} currentChatId={chatId} />
      </div>

      {/* Main content */}
      <div
        className={cn(
          "flex-1 flex flex-col min-w-0 h-screen",
          !isMobile && "md:ml-64" // Offset content when sidebar is fixed
        )}
      >
        {/* Mobile header */}
        {isMobile && (
          <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-background z-40">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold">ChatGPT</h1>
            <div className="w-10" />
          </div>
        )}

        <ChatInterface chatId={chatId} />
      </div>
    </div>
  );
}
