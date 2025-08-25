"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import type { Session, Campaign } from "@/lib/types"
import { mockSessions } from "@/lib/mock-data"
import { Plus, Play, Edit, Calendar, Clock } from "lucide-react"

interface SessionManagerProps {
  campaign: Campaign
  onSessionSelect?: (session: Session) => void
}

export function SessionManager({ campaign, onSessionSelect }: SessionManagerProps) {
  const [sessions, setSessions] = useState<Session[]>(mockSessions.filter((s) => s.campaignId === campaign.id))
  const [isCreating, setIsCreating] = useState(false)
  const [newSession, setNewSession] = useState({
    name: "",
    description: "",
  })

  const handleCreateSession = () => {
    if (!newSession.name.trim()) return

    const session: Session = {
      id: crypto.randomUUID(),
      campaignId: campaign.id,
      name: newSession.name,
      description: newSession.description,
      date: new Date(),
      sessionNumber: sessions.length + 1,
      isCompleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: false,
    }

    setSessions([...sessions, session])
    setNewSession({ name: "", description: "" })
    setIsCreating(false)
  }

  const handleStartSession = (session: Session) => {
    // Mark all other sessions as inactive
    const updatedSessions = sessions.map((s) => ({
      ...s,
      isActive: s.id === session.id,
    }))
    setSessions(updatedSessions)

    if (onSessionSelect) {
      onSessionSelect({ ...session, isActive: true })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold">Sessions</h3>
          <p className="text-muted-foreground">Manage your campaign sessions</p>
        </div>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Session
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Session</DialogTitle>
              <DialogDescription>Add a new session to {campaign.name}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="session-name">Session Name</Label>
                <Input
                  id="session-name"
                  value={newSession.name}
                  onChange={(e) => setNewSession({ ...newSession, name: e.target.value })}
                  placeholder="Enter session name..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="session-description">Description</Label>
                <Textarea
                  id="session-description"
                  value={newSession.description}
                  onChange={(e) => setNewSession({ ...newSession, description: e.target.value })}
                  placeholder="Describe what happens in this session..."
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCreateSession} className="flex-1">
                  Create Session
                </Button>
                <Button variant="outline" onClick={() => setIsCreating(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <ScrollArea className="h-96">
        <div className="space-y-4">
          {sessions.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h4 className="text-lg font-semibold mb-2">No Sessions Yet</h4>
                  <p className="text-muted-foreground mb-4">Create your first session to start playing!</p>
                  <Button onClick={() => setIsCreating(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Session
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            sessions.map((session) => (
              <Card key={session.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">Session {session.sessionNumber}</Badge>
                      {session.isActive && (
                        <Badge className="bg-green-500 hover:bg-green-600">
                          <Play className="h-3 w-3 mr-1" />
                          Active
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {session.createdAt.toLocaleDateString()}
                    </div>
                  </div>
                  <CardTitle className="text-lg">{session.name}</CardTitle>
                  <CardDescription>{session.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleStartSession(session)} disabled={session.isActive}>
                      <Play className="h-4 w-4 mr-2" />
                      {session.isActive ? "Currently Playing" : "Start Session"}
                    </Button>
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </div>
                  {session.summary && (
                    <div className="mt-4 p-3 bg-muted rounded-md">
                      <h5 className="font-semibold text-sm mb-1">Session Summary:</h5>
                      <p className="text-sm text-muted-foreground">{session.summary}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
