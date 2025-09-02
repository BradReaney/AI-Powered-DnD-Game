"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Campaign, Session, Character, Location, StoryArc, StoryValidationReport } from "@/lib/types";
// SessionManager component removed - functionality integrated elsewhere
import { CharacterForm } from "./character-form";
import { CharacterSheet } from "./character-sheet";
import { LocationForm } from "./location-form";
import { LocationDetail } from "./location-detail";
import { StoryArcForm } from "./story-arc-form";
import { StoryArcDetail } from "./story-arc-detail";
import {
  ArrowLeft,
  Edit,
  Settings,
  Play,
  Users,
  MapPin,
  Plus,
  Trash2,
  BookOpen,
} from "lucide-react";

// Force dynamic rendering to prevent build-time prerendering issues
export const dynamic = "force-dynamic";

interface CampaignDetailProps {
  campaign: Campaign;
  characters: Character[];
  locations: Location[];
  onBack: () => void;
  onEdit: () => void;
  onPlaySession?: (session: Session) => void;
  onSaveCharacter: (character: Partial<Character>) => Promise<void>;
  onSaveLocation: (location: Partial<Location>) => Promise<void>;
  onDeleteCampaign?: (campaign: Campaign) => Promise<void>;
  onLocationDeleted?: (locationId: string) => void;
  onCharacterDeleted?: (characterId: string) => void;
}

export function CampaignDetail({
  campaign,
  characters,
  locations,
  onBack,
  onEdit,
  onPlaySession,
  onSaveCharacter,
  onSaveLocation,
  onDeleteCampaign,
  onLocationDeleted,
  onCharacterDeleted,
}: CampaignDetailProps) {
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(
    null,
  );
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null,
  );
  const [characterViewMode, setCharacterViewMode] = useState<
    "list" | "create" | "edit" | "view"
  >("list");
  const [locationViewMode, setLocationViewMode] = useState<
    "list" | "create" | "edit" | "view"
  >("list");
  const [storyArcViewMode, setStoryArcViewMode] = useState<
    "list" | "create" | "edit" | "view"
  >("list");
  const [selectedStoryArc, setSelectedStoryArc] = useState<StoryArc | null>(null);
  const [storyArc, setStoryArc] = useState<StoryArc | null>(null);

  // Campaign settings state
  const [settings, setSettings] = useState(
    campaign.settings || {
      difficulty: "medium" as const,
      maxLevel: 20,
      startingLevel: 1,
      experienceRate: "normal" as const,
      magicLevel: "medium" as const,
      technologyLevel: "medieval" as const,
      aiBehavior: {
        creativity: "medium" as const,
        detailLevel: "moderate" as const,
        pacing: "normal" as const,
        combatStyle: "balanced" as const,
      },
      playerSettings: {
        maxPlayers: 6,
        allowNewPlayers: true,
        playerPermissions: {
          canCreateCharacters: true,
          canModifyWorld: false,
          canManageSessions: false,
        },
      },
    },
  );
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [settingsSuccess, setSettingsSuccess] = useState<string | null>(null);

  // Loading states for character and location operations
  const [isSavingCharacter, setIsSavingCharacter] = useState(false);
  const [isSavingLocation, setIsSavingLocation] = useState(false);
  const [isSavingStoryArc, setIsSavingStoryArc] = useState(false);

  // Load settings and story arc from API when component mounts
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!apiUrl) {
          console.error("NEXT_PUBLIC_API_URL environment variable is required");
          return;
        }
        const response = await fetch(
          `${apiUrl}/api/campaign-settings/${campaign.id}/settings`,
        );
        if (response.ok) {
          const data = await response.json();
          setSettings(data.settings || {});
        }
      } catch (error) {
        console.error("Error loading campaign settings:", error);
      }
    };

    const loadStoryArc = async () => {
      try {
        const response = await fetch(`/api/story-arcs?campaignId=${campaign.id}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setStoryArc(data.data);
          }
        }
      } catch (error) {
        console.error("Error loading story arc:", error);
      }
    };

    loadSettings();
    loadStoryArc();
  }, [campaign.id]);

  const campaignCharacters = characters.filter(
    (char) => char.campaignId === campaign.id,
  );
  const campaignLocations = locations.filter(
    (loc) => loc.campaignId === campaign.id,
  );

  const handleCreateCharacter = () => {
    setSelectedCharacter(null);
    setCharacterViewMode("create");
  };

  const handleEditCharacter = (character: Character) => {
    setSelectedCharacter(character);
    setCharacterViewMode("edit");
  };

  const handleViewCharacter = (character: Character) => {
    setSelectedCharacter(character);
    setCharacterViewMode("view");
  };

  const handleSaveCharacterData = async (characterData: Partial<Character>) => {
    try {
      setIsSavingCharacter(true);
      await onSaveCharacter({ ...characterData, campaignId: campaign.id });
      setCharacterViewMode("list");
      setSelectedCharacter(null);
    } catch (error) {
      console.error("Error saving character:", error);
      // You could add error handling UI here
    } finally {
      setIsSavingCharacter(false);
    }
  };

  const handleCreateLocation = () => {
    setSelectedLocation(null);
    setLocationViewMode("create");
  };

  const handleEditLocation = (location: Location) => {
    setSelectedLocation(location);
    setLocationViewMode("edit");
  };

  const handleViewLocation = (location: Location) => {
    setSelectedLocation(location);
    setLocationViewMode("view");
  };

  const handleSaveLocationData = async (locationData: Partial<Location>) => {
    try {
      setIsSavingLocation(true);
      await onSaveLocation({ ...locationData, campaignId: campaign.id });
      setLocationViewMode("list");
      setSelectedLocation(null);
    } catch (error) {
      console.error("Error saving location:", error);
      // You could add error handling UI here
    } finally {
      setIsSavingLocation(false);
    }
  };

  const handleDeleteCharacter = async (character: Character) => {
    if (
      confirm(
        `Are you sure you want to delete "${character.name}"? This action cannot be undone.`,
      )
    ) {
      try {
        const response = await fetch(`/api/characters/${character.id}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          throw new Error(`Failed to delete character: ${response.statusText}`);
        }
        setCharacterViewMode("list");
        setSelectedCharacter(null);

        // Call the callback to update parent state instead of page reload
        if (onCharacterDeleted) {
          onCharacterDeleted(character.id);
        }
      } catch (error) {
        console.error("Error deleting character:", error);
        alert("Failed to delete character. Please try again.");
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
        const response = await fetch(`/api/locations/${location.id}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          throw new Error(`Failed to delete location: ${response.statusText}`);
        }
        setLocationViewMode("list");
        setSelectedLocation(null);

        // Call the callback to update parent state instead of page reload
        if (onLocationDeleted) {
          onLocationDeleted(location.id);
        }
      } catch (error) {
        console.error("Error deleting location:", error);
        alert("Failed to delete location. Please try again.");
      }
    }
  };

  // Story Arc handlers
  const handleCreateStoryArc = () => {
    setSelectedStoryArc(null);
    setStoryArcViewMode("create");
  };

  const handleEditStoryArc = (storyArc: StoryArc) => {
    setSelectedStoryArc(storyArc);
    setStoryArcViewMode("edit");
  };

  const handleViewStoryArc = (storyArc: StoryArc) => {
    setSelectedStoryArc(storyArc);
    setStoryArcViewMode("view");
  };

  const handleSaveStoryArcData = async (storyArcData: Partial<StoryArc>) => {
    try {
      setIsSavingStoryArc(true);

      const response = await fetch(
        selectedStoryArc ? `/api/story-arcs/${selectedStoryArc.id}` : '/api/story-arcs',
        {
          method: selectedStoryArc ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(storyArcData),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to ${selectedStoryArc ? 'update' : 'create'} story arc`);
      }

      const data = await response.json();
      if (data.success) {
        setStoryArc(data.storyArc);
        setStoryArcViewMode("list");
        setSelectedStoryArc(null);
      }
    } catch (error) {
      console.error("Error saving story arc:", error);
      alert(`Failed to ${selectedStoryArc ? 'update' : 'create'} story arc. Please try again.`);
    } finally {
      setIsSavingStoryArc(false);
    }
  };

  const handleDeleteStoryArc = async (storyArc: StoryArc) => {
    if (
      confirm(
        `Are you sure you want to delete this story arc? This action cannot be undone.`,
      )
    ) {
      try {
        const response = await fetch(`/api/story-arcs/${storyArc.id}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          throw new Error(`Failed to delete story arc: ${response.statusText}`);
        }
        setStoryArc(null);
        setStoryArcViewMode("list");
        setSelectedStoryArc(null);
      } catch (error) {
        console.error("Error deleting story arc:", error);
        alert("Failed to delete story arc. Please try again.");
      }
    }
  };

  const handleValidateStoryArc = async (): Promise<StoryValidationReport> => {
    if (!storyArc) {
      throw new Error("No story arc to validate");
    }

    const response = await fetch(`/api/story-arcs/${storyArc._id}/validate`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error('Failed to validate story arc');
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || 'Validation failed');
    }

    return data.data;
  };

  const handleSaveSettings = async () => {
    try {
      setIsSavingSettings(true);
      setSettingsError(null);
      setSettingsSuccess(null);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        throw new Error("NEXT_PUBLIC_API_URL environment variable is required");
      }
      const response = await fetch(
        `${apiUrl}/api/campaign-settings/${campaign.id}/settings`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ settings }),
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to save settings: ${response.statusText}`);
      }

      const result = await response.json();
      setSettingsSuccess("Settings saved successfully!");

      // Update local settings with the response from server
      setSettings(result.settings || {});

      // Clear success message after 3 seconds
      setTimeout(() => setSettingsSuccess(null), 3000);
    } catch (error) {
      console.error("Error saving settings:", error);
      setSettingsError(
        error instanceof Error ? error.message : "Failed to save settings",
      );

      // Clear error message after 5 seconds
      setTimeout(() => setSettingsError(null), 5000);
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleSettingChange = (category: string, field: string, value: any) => {
    setSettings((prev) => {
      if (category === "") {
        // Handle top-level settings (basic settings)
        return {
          ...prev,
          [field]: value,
        };
      } else {
        // Handle nested settings (aiBehavior, playerSettings, etc.)
        const categorySettings = prev[category as keyof typeof prev];
        if (categorySettings && typeof categorySettings === "object") {
          return {
            ...prev,
            [category]: {
              ...categorySettings,
              [field]: value,
            },
          };
        }
        // If category doesn't exist, create it
        return {
          ...prev,
          [category]: {
            [field]: value,
          },
        };
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Campaigns
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">{campaign.name}</h1>
            <Badge
              variant={campaign.status === "active" ? "default" : "secondary"}
            >
              {campaign.status === "active" ? "Active" : campaign.status}
            </Badge>
          </div>
          <p className="text-muted-foreground">{campaign.theme}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Campaign
          </Button>
          {onDeleteCampaign && (
            <Button
              variant="destructive"
              onClick={() => onDeleteCampaign(campaign)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Campaign
            </Button>
          )}
        </div>
      </div>

      {/* Campaign Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h4 className="font-semibold mb-2">Description</h4>
              <p className="text-muted-foreground">{campaign.description}</p>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Campaign Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Setting:</span>
                    <span>{campaign.theme}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created:</span>
                    <span>
                      {new Date(campaign.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Updated:</span>
                    <span>
                      {new Date(campaign.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Campaign Management Tabs */}
      <Tabs defaultValue="sessions" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="sessions" className="flex items-center gap-2">
            <Play className="h-4 w-4" />
            Sessions
          </TabsTrigger>
          <TabsTrigger value="characters" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Characters
          </TabsTrigger>
          <TabsTrigger value="locations" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Locations
          </TabsTrigger>
          <TabsTrigger value="story-arc" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Story Arc
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sessions">
          <Card>
            <CardHeader>
              <CardTitle>Session Management</CardTitle>
              <CardDescription>
                Sessions are automatically created and managed during gameplay
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  Sessions are automatically created when you start playing. No
                  manual session management required!
                </p>
                <div className="text-sm text-muted-foreground">
                  <p>• Sessions start automatically when you begin a story</p>
                  <p>• Session data is automatically saved and managed</p>
                  <p>
                    • You can view session history and continue where you left
                    off
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="characters">
          {characterViewMode === "create" || characterViewMode === "edit" ? (
            <CharacterForm
              character={selectedCharacter || undefined}
              onSave={handleSaveCharacterData}
              onCancel={() => setCharacterViewMode("list")}
              campaignId={campaign.id}
              sessionId={campaign.sessions?.[0]?.id || ""}
              isSaving={isSavingCharacter}
            />
          ) : characterViewMode === "view" && selectedCharacter ? (
            <div className="space-y-4">
              <Button
                variant="outline"
                onClick={() => setCharacterViewMode("list")}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Characters
              </Button>
              <CharacterSheet
                character={selectedCharacter}
                onEdit={() => handleEditCharacter(selectedCharacter)}
                onDelete={() => handleDeleteCharacter(selectedCharacter)}
              />
            </div>
          ) : (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Campaign Characters</CardTitle>
                    <CardDescription>
                      Manage player characters and NPCs for this campaign
                    </CardDescription>
                  </div>
                  <Button onClick={handleCreateCharacter}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Character
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {campaignCharacters.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">
                      No characters in this campaign yet.
                    </p>
                    <Button onClick={handleCreateCharacter}>
                      Create First Character
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {campaignCharacters.map((character) => (
                      <Card
                        key={character.id}
                        className="bg-card border-2 border-orange-500"
                      >
                        <CardHeader>
                          <CardTitle className="text-center text-lg">
                            {character.name}
                          </CardTitle>
                          <CardDescription className="text-center">
                            Level {character.level} {character.race}{" "}
                            {character.class}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>HP:</span>
                              <span>
                                {character.hitPoints.current}/
                                {character.hitPoints.maximum}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>AC:</span>
                              <span>{character.armorClass}</span>
                            </div>
                            <div className="flex gap-2 pt-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditCharacter(character)}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleViewCharacter(character)}
                              >
                                View
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteCharacter(character)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="locations">
          {locationViewMode === "create" || locationViewMode === "edit" ? (
            <LocationForm
              location={selectedLocation || undefined}
              onSave={handleSaveLocationData}
              onCancel={() => setLocationViewMode("list")}
              availableLocations={campaignLocations}
              campaignId={campaign.id}
              sessionId={campaign.sessions?.[0]?.id}
              isSaving={isSavingLocation}
            />
          ) : locationViewMode === "view" && selectedLocation ? (
            <div className="space-y-4">
              <Button
                variant="outline"
                onClick={() => setLocationViewMode("list")}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Locations
              </Button>
              <LocationDetail
                location={selectedLocation}
                onBack={() => setLocationViewMode("list")}
                onEdit={() => handleEditLocation(selectedLocation)}
                onDelete={() => handleDeleteLocation(selectedLocation)}
                allLocations={campaignLocations}
              />
            </div>
          ) : (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Campaign Locations</CardTitle>
                    <CardDescription>
                      Manage locations and world-building for this campaign
                    </CardDescription>
                  </div>
                  <Button onClick={handleCreateLocation}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Location
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {campaignLocations.length === 0 ? (
                  <div className="text-center py-8">
                    <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">
                      No locations in this campaign yet.
                    </p>
                    <Button onClick={handleCreateLocation}>
                      Create First Location
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {campaignLocations.map((location) => (
                      <Card
                        key={location.id}
                        className="bg-card border-2 border-orange-500"
                      >
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">
                              {location.name}
                            </CardTitle>
                            <Badge variant="outline" className="capitalize">
                              {location.type}
                            </Badge>
                          </div>
                          <CardDescription>
                            {location.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {location.inhabitants &&
                              location.inhabitants.length > 0 && (
                                <div>
                                  <h4 className="font-semibold text-sm">
                                    Inhabitants:
                                  </h4>
                                  <div className="flex flex-wrap gap-1">
                                    {location.inhabitants
                                      .slice(0, 2)
                                      .map((inhabitant, index) => (
                                        <Badge
                                          key={index}
                                          variant="secondary"
                                          className="text-xs"
                                        >
                                          {inhabitant}
                                        </Badge>
                                      ))}
                                    {location.inhabitants.length > 2 && (
                                      <Badge
                                        variant="secondary"
                                        className="text-xs"
                                      >
                                        +{location.inhabitants.length - 2} more
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              )}
                            <div className="flex gap-2 pt-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditLocation(location)}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleViewLocation(location)}
                              >
                                View
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteLocation(location)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="story-arc">
          {storyArcViewMode === "create" || storyArcViewMode === "edit" ? (
            <StoryArcForm
              storyArc={selectedStoryArc || undefined}
              onSave={handleSaveStoryArcData}
              onCancel={() => setStoryArcViewMode("list")}
              campaignId={campaign.id}
              isSaving={isSavingStoryArc}
            />
          ) : storyArcViewMode === "view" && selectedStoryArc ? (
            <StoryArcDetail
              storyArc={selectedStoryArc}
              onBack={() => setStoryArcViewMode("list")}
              onEdit={() => handleEditStoryArc(selectedStoryArc)}
              onDelete={() => handleDeleteStoryArc(selectedStoryArc)}
              onValidate={handleValidateStoryArc}
            />
          ) : (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Campaign Story Arc</CardTitle>
                    <CardDescription>
                      Manage the narrative structure and story progression
                    </CardDescription>
                  </div>
                  {!storyArc && (
                    <Button onClick={handleCreateStoryArc}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Story Arc
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {!storyArc ? (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">
                      No story arc created for this campaign yet.
                    </p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Create a story arc to track narrative progression, character development, and world changes.
                    </p>
                    <Button onClick={handleCreateStoryArc}>
                      Create Story Arc
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Card className="border-l-4 border-l-blue-500">
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold">Story Arc</h4>
                              <Badge variant="outline" className="capitalize">
                                {storyArc.tone}
                              </Badge>
                              <Badge variant="secondary" className="capitalize">
                                {storyArc.pacing} pacing
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {storyArc.theme}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>Chapter {storyArc.currentChapter} / {storyArc.totalChapters}</span>
                              <span>Phase: {storyArc.storyPhase}</span>
                              <span>{storyArc.storyBeats.length} story beats</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditStoryArc(storyArc)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleViewStoryArc(storyArc)}
                      >
                        View Details
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteStoryArc(storyArc)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Settings</CardTitle>
              <CardDescription>
                Configure campaign rules and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Basic Settings */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Basic Settings</h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Difficulty</label>
                      <select
                        className="w-full p-2 text-sm border rounded-md bg-background mt-1"
                        value={settings.difficulty || "medium"}
                        onChange={(e) =>
                          handleSettingChange("", "difficulty", e.target.value)
                        }
                      >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                        <option value="deadly">Deadly</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Max Level</label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={settings.maxLevel || 20}
                        onChange={(e) =>
                          handleSettingChange(
                            "",
                            "maxLevel",
                            parseInt(e.target.value),
                          )
                        }
                        className="w-full p-2 text-sm border rounded-md bg-background mt-1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">
                        Experience Rate
                      </label>
                      <select
                        className="w-full p-2 text-sm border rounded-md bg-background mt-1"
                        value={settings.experienceRate || "normal"}
                        onChange={(e) =>
                          handleSettingChange(
                            "",
                            "experienceRate",
                            e.target.value,
                          )
                        }
                      >
                        <option value="slow">Slow</option>
                        <option value="normal">Normal</option>
                        <option value="fast">Fast</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Magic Level</label>
                      <select
                        className="w-full p-2 text-sm border rounded-md bg-background mt-1"
                        value={settings.magicLevel || "medium"}
                        onChange={(e) =>
                          handleSettingChange("", "magicLevel", e.target.value)
                        }
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* AI Behavior Settings */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">AI Behavior</h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Creativity</label>
                      <select
                        className="w-full p-2 text-sm border rounded-md bg-background mt-1"
                        value={settings.aiBehavior?.creativity || "medium"}
                        onChange={(e) =>
                          handleSettingChange(
                            "aiBehavior",
                            "creativity",
                            e.target.value,
                          )
                        }
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-medium">
                        Detail Level
                      </label>
                      <select
                        className="w-full p-2 text-sm border rounded-md bg-background mt-1"
                        value={settings.aiBehavior?.detailLevel || "moderate"}
                        onChange={(e) =>
                          handleSettingChange(
                            "aiBehavior",
                            "detailLevel",
                            e.target.value,
                          )
                        }
                      >
                        <option value="minimal">Minimal</option>
                        <option value="moderate">Moderate</option>
                        <option value="detailed">Detailed</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Pacing</label>
                      <select
                        className="w-full p-2 text-sm border rounded-md bg-background mt-1"
                        value={settings.aiBehavior?.pacing || "normal"}
                        onChange={(e) =>
                          handleSettingChange(
                            "aiBehavior",
                            "pacing",
                            e.target.value,
                          )
                        }
                      >
                        <option value="slow">Slow</option>
                        <option value="normal">Normal</option>
                        <option value="fast">Fast</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-medium">
                        Combat Style
                      </label>
                      <select
                        className="w-full p-2 text-sm border rounded-md bg-background mt-1"
                        value={settings.aiBehavior?.combatStyle || "balanced"}
                        onChange={(e) =>
                          handleSettingChange(
                            "aiBehavior",
                            "combatStyle",
                            e.target.value,
                          )
                        }
                      >
                        <option value="tactical">Tactical</option>
                        <option value="balanced">Balanced</option>
                        <option value="narrative">Narrative</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Player Settings */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Player Management</h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Max Players</label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={settings.playerSettings?.maxPlayers || 6}
                        onChange={(e) =>
                          handleSettingChange(
                            "playerSettings",
                            "maxPlayers",
                            parseInt(e.target.value),
                          )
                        }
                        className="w-full p-2 text-sm border rounded-md bg-background mt-1"
                      />
                    </div>

                    <div className="flex items-center space-x-2 pt-6">
                      <input
                        type="checkbox"
                        id="allowNewPlayers"
                        checked={
                          settings.playerSettings?.allowNewPlayers ?? true
                        }
                        onChange={(e) =>
                          handleSettingChange(
                            "playerSettings",
                            "allowNewPlayers",
                            e.target.checked,
                          )
                        }
                        className="rounded"
                      />
                      <label htmlFor="allowNewPlayers" className="text-sm">
                        Allow New Players
                      </label>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="canCreateCharacters"
                        checked={
                          settings.playerSettings?.playerPermissions
                            ?.canCreateCharacters ?? true
                        }
                        onChange={(e) =>
                          handleSettingChange(
                            "playerSettings",
                            "playerPermissions",
                            {
                              ...settings.playerSettings?.playerPermissions,
                              canCreateCharacters: e.target.checked,
                            },
                          )
                        }
                        className="rounded"
                      />
                      <label htmlFor="canCreateCharacters" className="text-sm">
                        Players can create characters
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="canModifyWorld"
                        checked={
                          settings.playerSettings?.playerPermissions
                            ?.canModifyWorld ?? false
                        }
                        onChange={(e) =>
                          handleSettingChange(
                            "playerSettings",
                            "playerPermissions",
                            {
                              ...settings.playerSettings?.playerPermissions,
                              canModifyWorld: e.target.checked,
                            },
                          )
                        }
                        className="rounded"
                      />
                      <label htmlFor="canModifyWorld" className="text-sm">
                        Players can modify world
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="canManageSessions"
                        checked={
                          settings.playerSettings?.playerPermissions
                            ?.canManageSessions ?? false
                        }
                        onChange={(e) =>
                          handleSettingChange(
                            "playerSettings",
                            "playerPermissions",
                            {
                              ...settings.playerSettings?.playerPermissions,
                              canManageSessions: e.target.checked,
                            },
                          )
                        }
                        className="rounded"
                      />
                      <label htmlFor="canManageSessions" className="text-sm">
                        Players can manage sessions
                      </label>
                    </div>
                  </div>
                </div>

                {/* Error and Success Messages */}
                {settingsError && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <p className="text-destructive text-sm">{settingsError}</p>
                  </div>
                )}

                {settingsSuccess && (
                  <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <p className="text-green-700 text-sm">{settingsSuccess}</p>
                  </div>
                )}

                {/* Save Button */}
                <div className="pt-4">
                  <Button
                    className="w-full"
                    onClick={handleSaveSettings}
                    disabled={isSavingSettings}
                  >
                    {isSavingSettings ? "Saving..." : "Save Settings"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
