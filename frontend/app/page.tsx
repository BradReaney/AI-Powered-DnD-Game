"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import apiService from "@/lib/api";
import type { Campaign, Session, Character, Location } from "@/lib/types";
import { CampaignForm } from "@/components/campaign-form";
import { CampaignDetail } from "@/components/campaign-detail";
import { CharacterForm } from "@/components/character-form";
import { CharacterSheet } from "@/components/character-sheet";
import { LocationForm } from "@/components/location-form";
import { LocationDetail } from "@/components/location-detail";
import { GameSession } from "@/components/game-session";
import { SessionContinuity } from "@/components/session-continuity";
import { Sword, MessageSquare, Plus, Play } from "lucide-react";
import { GameChat } from "@/components/game-chat";

type ViewMode =
  | "overview"
  | "create-campaign"
  | "edit-campaign"
  | "campaign-detail"
  | "create-character"
  | "edit-character"
  | "character-sheet"
  | "create-location"
  | "edit-location"
  | "location-detail"
  | "game-session"
  | "gameplay"
  | "session-continuity";

// Force dynamic rendering to prevent build-time prerendering issues
export const dynamic = 'force-dynamic';

export default function HomePage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(
    null,
  );
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(
    null,
  );
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null,
  );
  const [viewMode, setViewMode] = useState<ViewMode>("overview");
  const [activeTab, setActiveTab] = useState("campaigns");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeGameSession, setActiveGameSession] = useState<{
    campaign: Campaign;
    character: Character;
    sessionId?: string; // Add sessionId for resuming existing sessions
  } | null>(null);
  const [sessionContinuityData, setSessionContinuityData] = useState<{
    campaign: Campaign;
    character: Character;
  } | null>(null);

  // Loading states for operations
  const [isSavingCampaign, setIsSavingCampaign] = useState(false);
  const [isSavingCharacter, setIsSavingCharacter] = useState(false);
  const [isSavingLocation, setIsSavingLocation] = useState(false);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [campaignsData] = await Promise.all([apiService.getCampaigns()]);

        // Ensure campaigns is always an array
        const campaignsArray = Array.isArray(campaignsData) ? campaignsData : [];
        setCampaigns(campaignsArray);

        // Fetch characters for all active campaigns
        const allCharacters: Character[] = [];
        for (const campaign of campaignsArray) {
          if (campaign.status === 'active') {
            try {
              const campaignCharacters = await apiService.getCharactersByCampaign(campaign.id);
              allCharacters.push(...campaignCharacters);
            } catch (err) {
              console.error(`Failed to fetch characters for campaign ${campaign.id}:`, err);
            }
          }
        }
        setCharacters(allCharacters);
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch data");
        // Ensure campaigns is always an array even on error
        setCampaigns([]);
        setCharacters([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCreateCampaign = () => {
    setSelectedCampaign(null);
    setViewMode("create-campaign");
  };

  const handleEditCampaign = (campaign?: Campaign) => {
    setSelectedCampaign(campaign || null);
    setViewMode("edit-campaign");
  };

  const handleSaveCampaign = async (campaignData: Partial<Campaign>) => {
    try {
      setIsSavingCampaign(true);
      setError(null);

      if (selectedCampaign) {
        const updatedCampaign = await apiService.updateCampaign(
          selectedCampaign.id,
          campaignData,
        );
        setCampaigns(
          campaigns.map((c) =>
            c.id === selectedCampaign.id ? updatedCampaign : c,
          ),
        );
      } else {
        const newCampaign = await apiService.createCampaign(campaignData);
        setCampaigns([...campaigns, newCampaign]);
      }
      setViewMode("overview");
      setSelectedCampaign(null);
    } catch (err) {
      console.error("Failed to save campaign:", err);
      setError(err instanceof Error ? err.message : "Failed to save campaign");
      throw err; // Re-throw to let the form handle the error
    } finally {
      setIsSavingCampaign(false);
    }
  };

  const handleViewCampaign = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setViewMode("campaign-detail");
  };

  const handleBackToOverview = () => {
    setViewMode("overview");
    setSelectedCampaign(null);
    setSelectedCharacter(null);
    setSelectedLocation(null);
  };

  const handleSaveCharacter = async (characterData: Partial<Character>) => {
    try {
      setIsSavingCharacter(true);
      setError(null);

      if (selectedCharacter) {
        const updatedCharacter = await apiService.updateCharacter(
          selectedCharacter.id,
          characterData,
        );
        setCharacters(
          characters.map((c) =>
            c.id === selectedCharacter.id ? updatedCharacter : c,
          ),
        );
      } else {
        const newCharacter = await apiService.createCharacter(characterData);
        setCharacters([...characters, newCharacter]);
      }
    } catch (err) {
      console.error("Failed to save character:", err);
      setError(err instanceof Error ? err.message : "Failed to save character");
      throw err; // Re-throw to let the form handle the error
    } finally {
      setIsSavingCharacter(false);
    }
  };

  const handleSaveLocation = async (locationData: Partial<Location>) => {
    try {
      setIsSavingLocation(true);
      setError(null);

      if (selectedLocation) {
        const updatedLocation = await apiService.updateLocation(
          selectedLocation.id,
          locationData,
        );
        setLocations(
          locations.map((l) =>
            l.id === selectedLocation.id ? updatedLocation : l,
          ),
        );
      } else {
        const newLocation = await apiService.createLocation(locationData);
        setLocations([...locations, newLocation]);
      }
    } catch (err) {
      console.error("Failed to save location:", err);
      setError(err instanceof Error ? err.message : "Failed to save location");
      throw err; // Re-throw to let the form handle the error
    } finally {
      setIsSavingLocation(false);
    }
  };

  const handleStartGameSession = () => {
    setViewMode("game-session");
  };

  const handleSessionContinuity = (campaign: Campaign, character: Character) => {
    setSessionContinuityData({ campaign, character });
    setViewMode("session-continuity");
  };

  const handleResumeSession = (sessionId: string) => {
    if (sessionContinuityData) {
      setActiveGameSession({
        ...sessionContinuityData,
        sessionId: sessionId
      });
      setViewMode("gameplay");
    }
  };

  const handleStartGameplay = (campaign: Campaign, character: Character) => {
    setActiveGameSession({ campaign, character });
    setViewMode("gameplay");
  };

  // Remove the problematic useEffect and handle character fetching differently

  const handlePlaySession = (session: Session) => {
    // Handle starting a game session

  };

  // Render different views based on viewMode
  if (viewMode === "create-campaign" || viewMode === "edit-campaign") {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary rounded-lg">
                <Sword className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  AI Dungeons & Dragons
                </h1>
                <p className="text-muted-foreground">
                  {selectedCampaign ? "Edit Campaign" : "Create Campaign"}
                </p>
              </div>
            </div>
          </div>
        </header>
        <div className="container mx-auto px-4 py-8">
          <CampaignForm
            campaign={selectedCampaign}
            onSave={handleSaveCampaign}
            onCancel={handleBackToOverview}
            isSaving={isSavingCampaign}
          />
        </div>
      </div>
    );
  }

  if (viewMode === "create-character" || viewMode === "edit-character") {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary rounded-lg">
                <Sword className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  AI Dungeons & Dragons
                </h1>
                <p className="text-muted-foreground">
                  {selectedCharacter ? "Edit Character" : "Create Character"}
                </p>
              </div>
            </div>
          </div>
        </header>
        <div className="container mx-auto px-4 py-8">
          <CharacterForm
            character={selectedCharacter}
            onSave={handleSaveCharacter}
            onCancel={handleBackToOverview}
            isSaving={isSavingCharacter}
          />
        </div>
      </div>
    );
  }

  if (viewMode === "character-sheet") {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary rounded-lg">
                <Sword className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  AI Dungeons & Dragons
                </h1>
                <p className="text-muted-foreground">Character Sheet</p>
              </div>
            </div>
          </div>
        </header>
        <div className="container mx-auto px-4 py-8">
          <CharacterSheet
            character={selectedCharacter!}
            onBack={handleBackToOverview}
            onEdit={() => handleEditCampaign(selectedCharacter)}
          />
        </div>
      </div>
    );
  }

  if (viewMode === "create-location" || viewMode === "edit-location") {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary rounded-lg">
                <Sword className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  AI Dungeons & Dragons
                </h1>
                <p className="text-muted-foreground">
                  {selectedLocation ? "Edit Location" : "Create Location"}
                </p>
              </div>
            </div>
          </div>
        </header>
        <div className="container mx-auto px-4 py-8">
          <LocationForm
            location={selectedLocation}
            onSave={handleSaveLocation}
            onCancel={handleBackToOverview}
            isSaving={isSavingLocation}
          />
        </div>
      </div>
    );
  }

  if (viewMode === "location-detail") {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary rounded-lg">
                <Sword className="h-4 w-4" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  AI Dungeons & Dragons
                </h1>
                <p className="text-muted-foreground">Location Details</p>
              </div>
            </div>
          </div>
        </header>
        <div className="container mx-auto px-4 py-8">
          <LocationDetail
            location={selectedLocation!}
            onBack={handleBackToOverview}
            onEdit={() => handleEditCampaign(selectedLocation)}
          />
        </div>
      </div>
    );
  }

  if (viewMode === "campaign-detail") {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary rounded-lg">
                <Sword className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  AI Dungeons & Dragons
                </h1>
                <p className="text-muted-foreground">Campaign Management</p>
              </div>
            </div>
          </div>
        </header>
        <div className="container mx-auto px-4 py-8">
          <CampaignDetail
            campaign={selectedCampaign}
            characters={characters}
            locations={locations}
            onBack={handleBackToOverview}
            onEdit={() => handleEditCampaign(selectedCampaign)}
            onPlaySession={handlePlaySession}
            onSaveCharacter={handleSaveCharacter}
            onSaveLocation={handleSaveLocation}
          />
        </div>
      </div>
    );
  }

  if (viewMode === "game-session") {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary rounded-lg">
                <Sword className="h-4 w-4" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  AI Dungeons & Dragons
                </h1>
                <p className="text-muted-foreground">Game Session</p>
              </div>
            </div>
          </div>
        </header>
        <div className="container mx-auto px-4 py-8">
          <GameSession
            campaigns={campaigns}
            characters={characters}
            locations={locations}
            onBack={handleBackToOverview}
            onStartGameplay={handleStartGameplay}
          />
        </div>
      </div>
    );
  }

  if (viewMode === "session-continuity") {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary rounded-lg">
                <Sword className="h-4 w-4" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  AI Dungeons & Dragons
                </h1>
                <p className="text-muted-foreground">Session Continuity</p>
              </div>
            </div>
          </div>
        </header>
        <div className="container mx-auto px-4 py-8">
          {sessionContinuityData ? (
            <SessionContinuity
              campaign={sessionContinuityData.campaign}
              character={sessionContinuityData.character}
              onResumeSession={handleResumeSession}
              onStartNewSession={handleStartGameSession}
            />
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No session continuity data found.</p>
              <Button onClick={() => setViewMode("overview")} className="mt-4">
                Back to Overview
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (viewMode === "gameplay") {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary rounded-lg">
                <Sword className="h-4 w-4" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  AI Dungeons & Dragons
                </h1>
                <p className="text-muted-foreground">Adventure in Progress</p>
              </div>
            </div>
          </div>
        </header>
        <div className="container mx-auto px-4 py-8">
          {activeGameSession ? (
            <GameChat
              campaign={activeGameSession.campaign}
              character={activeGameSession.character}
              onBack={() => setViewMode("game-session")}
              existingSessionId={activeGameSession.sessionId}
            />
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No active game session found.</p>
              <Button onClick={() => setViewMode("game-session")} className="mt-4">
                Back to Game Session
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Default overview mode - Simplified for testing
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary rounded-lg">
                <Sword className="h-4 w-4" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  AI Dungeons & Dragons
                </h1>
                <p className="text-muted-foreground">
                  Your AI-powered tabletop adventure
                </p>
              </div>
            </div>
            <Button
              className="bg-primary hover:bg-primary/90"
              onClick={handleCreateCampaign}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Campaign
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-destructive text-sm">{error}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => setError(null)}
            >
              Dismiss
            </Button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="mb-6 p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        )}

        {/* Safety check for campaigns state */}
        {!Array.isArray(campaigns) && (
          <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <p className="text-yellow-700 text-sm">Campaigns data is not properly initialized</p>
          </div>
        )}

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="campaigns" className="flex items-center gap-2">
              <Sword className="h-4 w-4" />
              Campaigns
            </TabsTrigger>
            <TabsTrigger value="play" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Play
            </TabsTrigger>
          </TabsList>

          {/* Campaigns Tab */}
          <TabsContent value="campaigns" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold text-foreground">
                Your Campaigns
              </h2>
              <Button variant="outline" onClick={handleCreateCampaign}>
                <Plus className="h-4 w-4 mr-2" />
                Create Campaign
              </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.isArray(campaigns) && campaigns.length > 0 ? (
                campaigns.map((campaign) => (
                  campaign && (
                    <Card
                      key={campaign.id || `campaign-${Math.random()}`}
                      className="bg-card border-2 border-orange-500 hover:shadow-lg hover:shadow-primary/10 transition-all cursor-pointer"
                    >
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-xl">
                            {campaign.name || "Unnamed Campaign"}
                          </CardTitle>
                          <Badge
                            variant={campaign.status === "active" ? "default" : "secondary"}
                          >
                            {campaign.status === "active" ? "Active" : campaign.status}
                          </Badge>
                        </div>
                        <CardDescription>{campaign.description || "No description"}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            {campaign?.theme || "Custom Setting"}
                          </span>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditCampaign(campaign)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleViewCampaign(campaign)}
                            >
                              <Play className="h-4 w-4 mr-2" />
                              Manage
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-muted-foreground">
                    No campaigns yet. Create your first campaign to get started!
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Play Tab */}
          <TabsContent value="play" className="space-y-6">
            {campaigns.length > 0 && characters.length > 0 ? (
              <div>
                <div className="text-center mb-6">
                  <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    Ready to Play?
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    Choose your campaign and character to start your adventure.
                  </p>
                  <div className="flex gap-4 justify-center">
                    <Button
                      onClick={() => handleSessionContinuity(campaigns[0], characters[0])}
                      className="bg-primary hover:bg-primary/90"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Continue Adventure
                    </Button>
                    <Button
                      onClick={() => handleStartGameplay(campaigns[0], characters[0])}
                      variant="outline"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Start New Session
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Begin Your Adventure
                </h2>
                <p className="text-muted-foreground mb-6">
                  Choose your campaign and character to start playing with your AI
                  Dungeon Master. The AI will guide your story and play all the
                  NPCs you encounter.
                </p>
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90"
                  onClick={handleStartGameSession}
                >
                  <Play className="h-5 w-5 mr-2" />
                  Start New Adventure
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
