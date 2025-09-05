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
import SessionContinuity from "@/components/session-continuity";
import { CampaignCharacterSelector } from "@/components/campaign-character-selector";
import { Sword, MessageSquare, Plus, Play, User, Trash2 } from "lucide-react";
import { GameChat } from "@/components/game-chat";
import ActiveSessionsDisplay from "@/components/active-sessions-display";

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
  | "gameplay"
  | "session-continuity"
  | "campaign-character-selector";

// Force dynamic rendering to prevent build-time prerendering issues
export const dynamic = "force-dynamic";

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

  // Session refresh mechanism
  const [sessionRefreshTrigger, setSessionRefreshTrigger] = useState(0);

  const refreshSessions = () => {
    setSessionRefreshTrigger((prev) => prev + 1);
  };

  const refreshCharactersData = async () => {
    try {
      // Fetch characters for all active campaigns
      const allCharacters: Character[] = [];
      const activeCampaigns = campaigns.filter(
        (campaign) => campaign.status === "active",
      );

      if (activeCampaigns.length > 0) {
        // Fetch characters for all campaigns in parallel
        const characterPromises = activeCampaigns.map(async (campaign) => {
          try {
            const campaignCharacters = await apiService.getCharactersByCampaign(
              campaign.id,
            );
            return Array.isArray(campaignCharacters) ? campaignCharacters : [];
          } catch (err) {
            console.error(
              `Failed to fetch characters for campaign ${campaign.id}:`,
              err,
            );
            return [];
          }
        });

        const characterResults = await Promise.all(characterPromises);
        characterResults.forEach((characters) => {
          if (Array.isArray(characters)) {
            allCharacters.push(...characters);
          }
        });
      }

      setCharacters(allCharacters);
    } catch (err) {
      console.error("Failed to refresh characters:", err);
    }
  };

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        // Fetch campaigns first
        const campaignsData = await apiService.getCampaigns();

        // Ensure campaigns is always an array
        const campaignsArray = Array.isArray(campaignsData)
          ? campaignsData
          : [];
        setCampaigns(campaignsArray);

        // Fetch characters for all active campaigns
        const allCharacters: Character[] = [];
        const activeCampaigns = campaignsArray.filter(
          (campaign) => campaign.status === "active",
        );

        if (activeCampaigns.length > 0) {
          try {
            // Fetch characters for all campaigns in parallel
            const characterPromises = activeCampaigns.map(async (campaign) => {
              try {
                const campaignCharacters =
                  await apiService.getCharactersByCampaign(campaign.id);
                return Array.isArray(campaignCharacters)
                  ? campaignCharacters
                  : [];
              } catch (err) {
                console.error(
                  `Failed to fetch characters for campaign ${campaign.id}:`,
                  err,
                );
                return [];
              }
            });

            const characterResults = await Promise.all(characterPromises);
            characterResults.forEach((characters) => {
              if (Array.isArray(characters)) {
                allCharacters.push(...characters);
              }
            });
          } catch (err) {
            console.error("Failed to fetch characters:", err);
          }
        }

        setCharacters(allCharacters);
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch data");
        setCampaigns([]);
        setCharacters([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Refresh characters when navigating to campaign-character-selector
  useEffect(() => {
    if (viewMode === "campaign-character-selector") {
      refreshCharactersData();
    }
  }, [viewMode, refreshCharactersData]);

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

        // Fetch characters for the new campaign to ensure they're available in the selector
        try {
          const campaignCharacters = await apiService.getCharactersByCampaign(
            newCampaign.id,
          );
          if (Array.isArray(campaignCharacters)) {
            setCharacters((prevCharacters) => [
              ...prevCharacters,
              ...campaignCharacters,
            ]);
          }
        } catch (err) {
          console.error(
            `Failed to fetch characters for new campaign ${newCampaign.id}:`,
            err,
          );
        }
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

    // Fetch locations for this campaign
    apiService
      .getLocationsByCampaign(campaign.id)
      .then((campaignLocations) => {
        setLocations(campaignLocations);
      })
      .catch((err) => {
        console.error("Failed to fetch campaign locations:", err);
        setLocations([]);
      });
  };

  const handleDeleteCampaign = async (campaign: Campaign) => {
    if (
      confirm(
        `Are you sure you want to delete "${campaign.name}"? This action cannot be undone.`,
      )
    ) {
      try {
        await apiService.deleteCampaign(campaign.id);
        setCampaigns(campaigns.filter((c) => c.id !== campaign.id));
        setError(null);
      } catch (err) {
        console.error("Failed to delete campaign:", err);
        setError(
          err instanceof Error ? err.message : "Failed to delete campaign",
        );
      }
    }
  };

  const handleLocationDeleted = (locationId: string) => {
    // Remove the deleted location from the locations state
    setLocations(locations.filter((l) => l.id !== locationId));
  };

  const handleCharacterDeleted = (characterId: string) => {
    // Remove the deleted character from the characters state
    setCharacters(characters.filter((c) => c.id !== characterId));
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

        // Refresh characters data to ensure consistency
        await refreshCharactersData();

        // Redirect back to overview after successful character creation
        setViewMode("overview");
        setSelectedCharacter(null);
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

      if (locationData.id) {
        const updatedLocation = await apiService.updateLocation(
          locationData.id,
          locationData,
        );
        setLocations(
          locations.map((l) =>
            l.id === locationData.id ? updatedLocation : l,
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

  const handleSessionContinuity = (
    campaign: Campaign,
    character: Character,
  ) => {
    setSessionContinuityData({ campaign, character });
    setViewMode("session-continuity");
  };

  const handleEditCharacter = (character: Character) => {
    setSelectedCharacter(character);
    setViewMode("edit-character");
  };

  const handleViewCharacter = (character: Character) => {
    setSelectedCharacter(character);
    setViewMode("character-sheet");
  };

  const handleEditLocation = (location: Location) => {
    setSelectedLocation(location);
    setViewMode("edit-location");
  };

  const handleResumeSession = (
    sessionId: string,
    campaign?: Campaign,
    character?: Character,
  ) => {
    // If campaign and character are provided directly, use them
    if (campaign && character) {
      setActiveGameSession({
        campaign,
        character,
        sessionId: sessionId,
      });
      setViewMode("gameplay");
      return;
    }

    // Otherwise, try to use sessionContinuityData if available
    if (sessionContinuityData) {
      setActiveGameSession({
        ...sessionContinuityData,
        sessionId: sessionId,
      });
      setViewMode("gameplay");
    } else {
      // If no data is available, we need to get campaign and character info
      // This could happen when resuming from the Play tab
      console.warn(
        "Cannot resume session: missing campaign or character information",
      );
      // Could redirect to campaign-character-selector or show an error
    }
  };

  // Remove the problematic useEffect and handle character fetching differently

  const handlePlaySession = (session: Session) => {
    // Handle starting a game session
    if (session.campaignId) {
      const campaign = campaigns.find((c) => c.id === session.campaignId);
      if (campaign) {
        // Check if we have characters for this campaign
        const campaignCharacters = characters.filter(
          (c) => c.campaignId === campaign.id,
        );
        if (campaignCharacters.length > 0) {
          // If we have characters, go to character selection
          setViewMode("campaign-character-selector");
        } else {
          // If no characters, go to session continuity (which will prompt for character creation)
          handleSessionContinuity(campaign, characters[0]);
        }
      }
    }
  };

  const handleStartGameWithSelection = async (
    campaign: Campaign,
    character: Character,
  ) => {
    try {
      // Create the session using the consolidated endpoint
      const session = await apiService.createSession({
        campaignId: campaign.id,
        characterId: character.id,
      });

      // Set the active game session with the real session data
      setActiveGameSession({
        campaign,
        character,
        sessionId: session.session._id || session.session.id,
      });

      // Refresh the session data so the new session appears in the active sessions list
      refreshSessions();

      setViewMode("gameplay");
    } catch (error) {
      console.error("Failed to create session:", error);
      // You could add error handling here, like showing a toast notification
      alert("Failed to create session. Please try again.");
    }
  };

  const handleDeleteCharacter = async (character: Character) => {
    if (
      confirm(
        `Are you sure you want to delete "${character.name}"? This action cannot be undone.`,
      )
    ) {
      try {
        await apiService.deleteCharacter(character.id);
        setCharacters(characters.filter((c) => c.id !== character.id));
        setError(null);
      } catch (err) {
        console.error("Failed to delete character:", err);
        setError(
          err instanceof Error ? err.message : "Failed to delete character",
        );
      }
    }
  };

  const handleDeleteLocation = async (location: Location) => {
    if (
      confirm(
        `Are you sure you want to delete "${location.name}"? This action cannot be undone.`,
      )
    ) {
      try {
        await apiService.deleteLocation(location.id);
        setLocations(locations.filter((l) => l.id !== location.id));
        setError(null);
      } catch (err) {
        console.error("Failed to delete location:", err);
        setError(
          err instanceof Error ? err.message : "Failed to delete location",
        );
      }
    }
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
            campaign={selectedCampaign || undefined}
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
            character={selectedCharacter || undefined}
            onSave={handleSaveCharacter}
            onCancel={handleBackToOverview}
            isSaving={isSavingCharacter}
            campaigns={campaigns} // Pass campaigns for selection
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
            onEdit={() => handleEditCharacter(selectedCharacter!)}
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
            location={selectedLocation || undefined}
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
            onEdit={() => handleEditLocation(selectedLocation!)}
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
            campaign={selectedCampaign!}
            characters={characters}
            locations={locations}
            onBack={handleBackToOverview}
            onEdit={() => handleEditCampaign(selectedCampaign!)}
            onPlaySession={handlePlaySession}
            onSaveCharacter={handleSaveCharacter}
            onSaveLocation={handleSaveLocation}
            onDeleteCampaign={handleDeleteCampaign}
            onLocationDeleted={handleLocationDeleted}
            onCharacterDeleted={handleCharacterDeleted}
          />
        </div>
      </div>
    );
  }

  if (viewMode === "campaign-character-selector") {
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
                <p className="text-muted-foreground">Choose Your Adventure</p>
              </div>
            </div>
          </div>
        </header>
        <div className="container mx-auto px-4 py-8">
          {/* Only render CampaignCharacterSelector when data is loaded */}
          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                Loading campaigns and characters... Please wait.
              </p>
            </div>
          ) : campaigns.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                No campaigns available. Create a campaign first to get started.
              </p>
              <Button
                onClick={() => setViewMode("create-campaign")}
                className="mt-4"
              >
                Create Campaign
              </Button>
            </div>
          ) : characters.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                No characters available. Create a character first to get
                started.
              </p>
              <Button
                onClick={() => setViewMode("create-character")}
                className="mt-4"
              >
                Create Character
              </Button>
            </div>
          ) : (
            <>
              <CampaignCharacterSelector
                campaigns={campaigns}
                characters={characters}
                onStartGame={handleStartGameWithSelection}
                onBack={() => setViewMode("overview")}
              />
            </>
          )}
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
              campaignId={sessionContinuityData.campaign.id}
              characterId={sessionContinuityData.character.id}
              campaigns={campaigns}
              characters={characters}
              onResumeSession={handleResumeSession}
              onStartNewSession={() => {
                // If there are campaigns and characters, go to campaign-character-selector
                // Otherwise, go to campaign creation
                if (campaigns.length > 0 && characters.length > 0) {
                  setViewMode("campaign-character-selector");
                } else {
                  handleCreateCampaign();
                }
              }}
              onStartNewAdventure={() => {
                setViewMode("campaign-character-selector");
              }}
            />
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No session continuity data found.
              </p>
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
              onBack={() => setViewMode("session-continuity")}
              existingSessionId={activeGameSession.sessionId}
            />
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No active game session found.
              </p>
              <Button
                onClick={() => setViewMode("session-continuity")}
                className="mt-4"
              >
                Back to Session Continuity
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
          <div className="mb-6 p-8 text-center" data-testid="loading-spinner">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        )}

        {/* Safety check for campaigns state */}
        {!Array.isArray(campaigns) && (
          <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <p className="text-yellow-700 text-sm">
              Campaigns data is not properly initialized
            </p>
          </div>
        )}

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="campaigns" className="flex items-center gap-2">
              <Sword className="h-4 w-4" />
              Campaigns
            </TabsTrigger>
            <TabsTrigger value="characters" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Characters
            </TabsTrigger>
            <TabsTrigger value="play" className="flex items-center gap-2">
              <Play className="h-4 w-4" />
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
                campaigns.map(
                  (campaign) =>
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
                              variant={
                                campaign.status === "active"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {campaign.status === "active"
                                ? "Active"
                                : campaign.status}
                            </Badge>
                          </div>
                          <CardDescription>
                            {campaign.description || "No description"}
                          </CardDescription>
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
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteCampaign(campaign)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ),
                )
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-muted-foreground">
                    No campaigns yet. Create your first campaign to get started!
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Characters Tab */}
          <TabsContent value="characters" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold text-foreground">
                Your Characters
              </h2>
              <Button
                variant="outline"
                onClick={() => setViewMode("create-character")}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Character
              </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.isArray(characters) && characters.length > 0 ? (
                characters.map(
                  (character) =>
                    character && (
                      <Card
                        key={character.id || `character-${Math.random()}`}
                        className="bg-card border-2 border-blue-500 hover:shadow-lg hover:shadow-primary/10 transition-all cursor-pointer"
                      >
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-xl">
                              {character.name || "Unnamed Character"}
                            </CardTitle>
                            <Badge
                              variant={
                                character.status === "active"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {character.status === "active"
                                ? "Active"
                                : character.status}
                            </Badge>
                          </div>
                          <CardDescription>
                            {character.description || "No description"}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">
                              {campaigns.find(
                                (c) => c.id === character.campaignId,
                              )?.name || "No Campaign"}
                            </span>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditCharacter(character)}
                              >
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleViewCharacter(character)}
                              >
                                <Play className="h-4 w-4 mr-2" />
                                View
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteCharacter(character)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ),
                )
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-muted-foreground">
                    No characters yet. Create your first character to get
                    started!
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Play Tab */}
          <TabsContent value="play" className="space-y-6">
            {campaigns.length > 0 ? (
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
                      onClick={() => setViewMode("campaign-character-selector")}
                      className="bg-primary hover:bg-primary/90"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Start Adventure
                    </Button>
                    {characters.length > 0 && (
                      <Button
                        onClick={() =>
                          handleSessionContinuity(campaigns[0], characters[0])
                        }
                        variant="outline"
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Continue Adventure
                      </Button>
                    )}
                  </div>
                </div>

                {/* Show active sessions for campaigns */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Active Sessions</h3>
                  {campaigns.map((campaign) => (
                    <ActiveSessionsDisplay
                      key={`${campaign.id}-${sessionRefreshTrigger}`}
                      campaign={campaign}
                      characters={characters}
                      onResumeSession={handleResumeSession}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Begin Your Adventure
                </h2>
                <p className="text-muted-foreground mb-6">
                  Create a campaign and character to start playing with your AI
                  Dungeon Master. The AI will guide your story and play all the
                  NPCs you encounter.
                </p>
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90"
                  onClick={handleCreateCampaign}
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Create Campaign
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
