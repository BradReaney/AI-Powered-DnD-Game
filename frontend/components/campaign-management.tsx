"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import {
  BookOpen,
  Calendar,
  Clock,
  Users,
  MapPin,
  Target,
  BarChart3,
  Plus,
  Edit,
  Trash2,
  ChevronDown,
  ChevronUp,
  Star,
  Trophy,
  Flag,
  Settings,
  Loader2,
} from "lucide-react";
import type { Campaign, Session, Character, Location } from "@/lib/types";

interface CampaignManagementProps {
  campaign: Campaign;
  sessions: Session[];
  characters: Character[];
  locations: Location[];
  onUpdateCampaign?: (campaign: Campaign) => void;
  onAddSession?: (session: Session) => void;
  onUpdateSession?: (session: Session) => void;
}

interface CampaignTemplate {
  id: string;
  name: string;
  genre: string;
  description: string;
  difficulty: string;
  estimatedSessions: number;
  tags: string[];
}

interface SessionNote {
  id: string;
  sessionId: string;
  type: "player" | "dm" | "system";
  content: string;
  timestamp: Date;
  author: string;
}

export function CampaignManagement({
  campaign,
  sessions,
  characters,
  locations,
  onUpdateCampaign,
  onAddSession,
  onUpdateSession,
}: CampaignManagementProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "overview" | "sessions" | "templates" | "analytics" | "settings"
  >("overview");
  const [showAddSession, setShowAddSession] = useState(false);
  const [showAddNote, setShowAddNote] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [newNote, setNewNote] = useState("");
  const [noteType, setNoteType] = useState<"player" | "dm" | "system">(
    "player",
  );

  // Loading states
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isAddingSession, setIsAddingSession] = useState(false);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const campaignTemplates: CampaignTemplate[] = [
    {
      id: "1",
      name: "The Lost Mine of Phandelver",
      genre: "Fantasy",
      description: "A classic D&D adventure for beginners",
      difficulty: "Easy",
      estimatedSessions: 8,
      tags: ["beginner", "classic", "dungeon-crawl"],
    },
    {
      id: "2",
      name: "Curse of Strahd",
      genre: "Horror",
      description: "Gothic horror adventure in the land of Barovia",
      difficulty: "Hard",
      estimatedSessions: 15,
      tags: ["horror", "gothic", "vampire"],
    },
    {
      id: "3",
      name: "Storm King's Thunder",
      genre: "Fantasy",
      description: "Epic adventure across the Savage Frontier",
      difficulty: "Medium",
      estimatedSessions: 12,
      tags: ["epic", "giants", "exploration"],
    },
    {
      id: "4",
      name: "Cyberpunk 2077",
      genre: "Sci-Fi",
      description: "Futuristic adventure in Night City",
      difficulty: "Medium",
      estimatedSessions: 10,
      tags: ["cyberpunk", "futuristic", "technology"],
    },
  ];

  const sessionNotes: SessionNote[] = [
    {
      id: "1",
      sessionId: "1",
      type: "dm",
      content: "Players discovered the hidden entrance to the ancient temple",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      author: "Dungeon Master",
    },
    {
      id: "2",
      sessionId: "1",
      type: "player",
      content: "Remember to check for traps before opening doors",
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
      author: "Player 1",
    },
    {
      id: "3",
      sessionId: "1",
      type: "system",
      content: "Session completed - XP distributed, loot collected",
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      author: "System",
    },
  ];

  const calculateCampaignStats = () => {
    const totalSessions = sessions.length;
    const completedSessions = sessions.filter((s) => s.isCompleted).length;
    const totalDuration = sessions.reduce((sum, s) => sum + s.duration, 0);
    const averageDuration =
      totalSessions > 0 ? totalDuration / totalSessions : 0;
    const activeCharacters = characters.filter(
      (c) => c.campaignId === campaign.id,
    ).length;
    const totalLocations = locations.filter(
      (l) => l.campaignId === campaign.id,
    ).length;

    return {
      totalSessions,
      completedSessions,
      totalDuration,
      averageDuration,
      activeCharacters,
      totalLocations,
      completionRate:
        totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0,
    };
  };

  const addSessionNote = async () => {
    if (!newNote.trim() || !selectedSession) return;

    try {
      setIsAddingNote(true);
      
      const note: SessionNote = {
        id: crypto.randomUUID(),
        sessionId: selectedSession.id,
        type: noteType,
        content: newNote,
        timestamp: new Date(),
        author: noteType === "dm" ? "Dungeon Master" : "Player",
      };

      // In a real app, this would be saved to the backend
      // await saveNoteToBackend(note);

      setNewNote("");
      setShowAddNote(false);
      
      // Show success message
      setSettingsMessage({ type: 'success', text: 'Note added successfully!' });
      setTimeout(() => setSettingsMessage(null), 3000);
      
    } catch (error) {
      setSettingsMessage({ type: 'error', text: 'Failed to add note' });
      setTimeout(() => setSettingsMessage(null), 5000);
    } finally {
      setIsAddingNote(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setIsSavingSettings(true);
      setSettingsMessage(null);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSettingsMessage({ type: 'success', text: 'Settings saved successfully!' });
      setTimeout(() => setSettingsMessage(null), 3000);
      
    } catch (error) {
      setSettingsMessage({ type: 'error', text: 'Failed to save settings' });
      setTimeout(() => setSettingsMessage(null), 5000);
    } finally {
      setIsSavingSettings(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "bg-green-100 text-green-800 border-green-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "hard":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getGenreIcon = (genre: string) => {
    switch (genre.toLowerCase()) {
      case "fantasy":
        return <Star className="h-4 w-4" />;
      case "horror":
        return <Flag className="h-4 w-4" />;
      case "sci-fi":
        return <Target className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  const stats = calculateCampaignStats();

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Campaign Management
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8 w-8 p-0"
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0">
          {/* Tab Navigation */}
          <div className="flex space-x-1 mb-4 p-1 bg-muted rounded-lg">
            {[
              { id: "overview", label: "Overview", icon: BookOpen },
              { id: "sessions", label: "Sessions", icon: Calendar },
              { id: "templates", label: "Templates", icon: Star },
              { id: "analytics", label: "Analytics", icon: BarChart3 },
              { id: "settings", label: "Settings", icon: Settings },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab(tab.id as any)}
                  className="flex-1 h-8 text-xs"
                >
                  <Icon className="h-3 w-3 mr-1" />
                  {tab.label}
                </Button>
              );
            })}
          </div>

          {/* Tab Content */}
          {activeTab === "overview" && (
            <div className="space-y-4">
              {/* Campaign Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm font-medium">Sessions</span>
                  </div>
                  <div className="text-2xl font-bold">
                    {stats.totalSessions}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {stats.completedSessions} completed
                  </div>
                </div>

                <div className="p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="h-4 w-4" />
                    <span className="text-sm font-medium">Characters</span>
                  </div>
                  <div className="text-2xl font-bold">
                    {stats.activeCharacters}
                  </div>
                  <div className="text-xs text-muted-foreground">active</div>
                </div>

                <div className="p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm font-medium">Locations</span>
                  </div>
                  <div className="text-2xl font-bold">
                    {stats.totalLocations}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    discovered
                  </div>
                </div>

                <div className="p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm font-medium">Total Time</span>
                  </div>
                  <div className="text-2xl font-bold">
                    {Math.round(stats.totalDuration / 60)}h
                  </div>
                  <div className="text-xs text-muted-foreground">
                    avg {Math.round(stats.averageDuration / 60)}h/session
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Campaign Progress</span>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(stats.completionRate)}%
                  </span>
                </div>
                <Progress value={stats.completionRate} className="h-2" />
              </div>
            </div>
          )}

          {activeTab === "sessions" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Session Notes</h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddSession(!showAddSession)}
                  className="h-6 px-2 text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Session
                </Button>
              </div>

              {showAddSession && (
                <div className="p-3 bg-muted rounded-lg">
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <Input placeholder="Session title" className="text-xs" />
                    <Input placeholder="Session number" className="text-xs" />
                  </div>
                  <Textarea
                    placeholder="Description"
                    className="text-xs mb-2"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" className="text-xs">
                      Save Session
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs">
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Session List */}
              <ScrollArea className="h-48">
                <div className="space-y-2">
                  {sessions.map((session) => (
                    <div
                      key={session.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${selectedSession?.id === session.id
                        ? "border-primary bg-primary/10"
                        : "border-border hover:bg-muted"
                        }`}
                      onClick={() => setSelectedSession(session)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">
                          {session.title}
                        </span>
                        <Badge
                          variant={
                            session.isCompleted ? "default" : "secondary"
                          }
                        >
                          {session.isCompleted ? "Completed" : "Active"}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {session.description}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>#{session.sessionNumber}</span>
                        <span>{Math.round(session.duration / 60)}h</span>
                        <span>{session.date.toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Session Notes */}
              {selectedSession && (
                <div className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="text-sm font-medium">
                      Notes for {selectedSession.title}
                    </h5>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAddNote(!showAddNote)}
                      className="h-6 px-2 text-xs"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add Note
                    </Button>
                  </div>

                  {showAddNote && (
                    <div className="mb-3 p-2 bg-muted rounded">
                      <div className="flex gap-2 mb-2">
                        <select
                          value={noteType}
                          onChange={(e) => setNoteType(e.target.value as any)}
                          className="text-xs border rounded px-2 py-1"
                        >
                          <option value="player">Player Note</option>
                          <option value="dm">DM Note</option>
                          <option value="system">System Note</option>
                        </select>
                      </div>
                      <Textarea
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        placeholder="Add a note..."
                        className="text-xs mb-2"
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={addSessionNote}
                          className="text-xs"
                          disabled={isAddingNote}
                        >
                          {isAddingNote ? (
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          ) : (
                            'Save'
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowAddNote(false)}
                          className="text-xs"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}

                  <ScrollArea className="h-32">
                    <div className="space-y-2">
                      {sessionNotes
                        .filter((note) => note.sessionId === selectedSession.id)
                        .map((note) => (
                          <div
                            key={note.id}
                            className="p-2 bg-muted rounded text-xs"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium">{note.author}</span>
                              <Badge variant="outline" className="text-xs">
                                {note.type}
                              </Badge>
                            </div>
                            <p className="text-muted-foreground">
                              {note.content}
                            </p>
                            <span className="text-xs text-muted-foreground">
                              {note.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                        ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </div>
          )}

          {activeTab === "templates" && (
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Campaign Templates</h4>
              <div className="grid grid-cols-1 gap-3">
                {campaignTemplates.map((template) => (
                  <div key={template.id} className="p-3 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getGenreIcon(template.genre)}
                        <div>
                          <h5 className="text-sm font-medium">
                            {template.name}
                          </h5>
                          <p className="text-xs text-muted-foreground">
                            {template.description}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-xs ${getDifficultyColor(template.difficulty)}`}
                      >
                        {template.difficulty}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                      <span>{template.estimatedSessions} sessions</span>
                      <span>{template.genre}</span>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-2">
                      {template.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-xs"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <Button size="sm" className="w-full text-xs">
                      Use Template
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "analytics" && (
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Campaign Analytics</h4>

              {/* Session Duration Chart */}
              <div className="p-3 bg-muted rounded-lg">
                <h5 className="text-sm font-medium mb-2">
                  Session Duration Trends
                </h5>
                <div className="space-y-2">
                  {sessions.slice(-5).map((session, index) => (
                    <div key={session.id} className="flex items-center gap-2">
                      <span className="text-xs w-16">
                        Session {session.sessionNumber}
                      </span>
                      <Progress
                        value={(session.duration / 180) * 100} // Assuming 3 hours max
                        className="flex-1 h-2"
                      />
                      <span className="text-xs w-12 text-right">
                        {Math.round(session.duration / 60)}h
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Player Engagement */}
              <div className="p-3 bg-muted rounded-lg">
                <h5 className="text-sm font-medium mb-2">Player Engagement</h5>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {Math.round(stats.completionRate)}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Session Completion
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      {stats.activeCharacters}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Active Players
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Campaign Settings</h4>

              {/* Basic Settings */}
              <div className="space-y-3">
                <h5 className="text-sm font-medium text-muted-foreground">Basic Settings</h5>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium">Difficulty</label>
                    <select className="w-full p-2 text-xs border rounded-md bg-background">
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                      <option value="deadly">Deadly</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-medium">Max Level</label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      defaultValue="20"
                      className="w-full p-2 text-xs border rounded-md bg-background"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium">Experience Rate</label>
                    <select className="w-full p-2 text-xs border rounded-md bg-background">
                      <option value="slow">Slow</option>
                      <option value="normal">Normal</option>
                      <option value="fast">Fast</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-medium">Magic Level</label>
                    <select className="w-full p-2 text-xs border rounded-md bg-background">
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* AI Behavior Settings */}
              <div className="space-y-3">
                <h5 className="text-sm font-medium text-muted-foreground">AI Behavior</h5>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium">Creativity</label>
                    <select className="w-full p-2 text-xs border rounded-md bg-background">
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-medium">Detail Level</label>
                    <select className="w-full p-2 text-xs border rounded-md bg-background">
                      <option value="minimal">Minimal</option>
                      <option value="moderate">Moderate</option>
                      <option value="detailed">Detailed</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium">Pacing</label>
                    <select className="w-full p-2 text-xs border rounded-md bg-background">
                      <option value="slow">Slow</option>
                      <option value="normal">Normal</option>
                      <option value="fast">Fast</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-medium">Combat Style</label>
                    <select className="w-full p-2 text-xs border rounded-md bg-background">
                      <option value="tactical">Tactical</option>
                      <option value="balanced">Balanced</option>
                      <option value="narrative">Narrative</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Player Settings */}
              <div className="space-y-3">
                <h5 className="text-sm font-medium text-muted-foreground">Player Management</h5>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium">Max Players</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      defaultValue="6"
                      className="w-full p-2 text-xs border rounded-md bg-background"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="allowNewPlayers" defaultChecked />
                    <label htmlFor="allowNewPlayers" className="text-xs">Allow New Players</label>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="canCreateCharacters" defaultChecked />
                    <label htmlFor="canCreateCharacters" className="text-xs">Players can create characters</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="canModifyWorld" />
                    <label htmlFor="canModifyWorld" className="text-xs">Players can modify world</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="canManageSessions" />
                    <label htmlFor="canManageSessions" className="text-xs">Players can manage sessions</label>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-4">
                <Button 
                  className="w-full text-xs"
                  onClick={handleSaveSettings}
                  disabled={isSavingSettings}
                >
                  {isSavingSettings ? (
                    <>
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Settings'
                  )}
                </Button>
              </div>

              {/* Settings Messages */}
              {settingsMessage && (
                <div className={`p-2 rounded text-xs ${
                  settingsMessage.type === 'success' 
                    ? 'bg-green-100 text-green-800 border border-green-200' 
                    : 'bg-red-100 text-red-800 border border-red-200'
                }`}>
                  {settingsMessage.text}
                </div>
              )}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
