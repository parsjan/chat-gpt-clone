import { requireAuth } from "@/lib/auth"
import { MemoryManager } from "@/components/memory/memory-manager"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings, Brain, Database, User } from "lucide-react"

export default async function SettingsPage() {
  await requireAuth()

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center gap-3 mb-8">
          <Settings className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Settings</h1>
        </div>

        <Tabs defaultValue="memory" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="memory" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Memory
            </TabsTrigger>
            <TabsTrigger value="data" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Data
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="memory">
            <Card>
              <CardHeader>
                <CardTitle>Memory Management</CardTitle>
              </CardHeader>
              <CardContent>
                <MemoryManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="data">
            <Card>
              <CardHeader>
                <CardTitle>Data Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Data management features coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Profile settings coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
