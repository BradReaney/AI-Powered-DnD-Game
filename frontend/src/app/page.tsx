"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { dataService } from "@/lib/data-service"
import type { Campaign, Session, Character, Location } from "@/lib/types"
import { CampaignForm } from "@/components/campaign-form"
import { CampaignDetail } from "@/components/campaign-detail"
import { CharacterForm } from "@/components/character-form"
import { CharacterSheet } from "@/components/character-sheet"
import { LocationForm } from "@/components/location-form"
import { LocationDetail } from "@/components/location-detail"
import { GameSession } from "@/components/game-session"
import { Sword, MessageSquare, Plus, Play } from "lucide-react"

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

export default function HomePage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [characters, setCharacters] = useState<Character[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>("overview")
  const [activeTab, setActiveTab] = useState("campaigns")

  // Load data when component mounts
  useEffect(() => {
    const loadData = async () => {
      try {
        const [campaignsData, charactersData, locationsData] = await Promise.all([
          dataService.getCampaigns(),
          dataService.getCharacters(),
          dataService.getLocations(),
        ]);
        
        setCampaigns(campaignsData);
        setCharacters(charactersData);
        setLocations(locationsData);
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    };

    loadData();
  }, []);

  const handleCreateCampaign = () => {
    setSelectedCampaign(null)
    setViewMode("create-campaign")
  }

  const handleEditCampaign = (campaign?: Campaign) => {
    setSelectedCampaign(campaign || null)
    setViewMode("edit-campaign")
  }

  const handleSaveCampaign = async (campaignData: Partial<Campaign>) => {
    try {
      if (selectedCampaign) {
        const updatedCampaign = await dataService.updateCampaign(selectedCampaign.id, campaignData);
        setCampaigns(
          campaigns.map((c) =>
            c.id === selectedCampaign.id ? updatedCampaign : c,
          ),
        );
      } else {
        const newCampaign = await dataService.createCampaign(campaignData);
        setCampaigns([...campaigns, newCampaign]);
      }
      setViewMode("overview");
      setSelectedCampaign(null);
    } catch (error) {
      console.error('Failed to save campaign:', error);
      // You could add error handling UI here
    }
  }

  const handleViewCampaign = (campaign: Campaign) => {
    setSelectedCampaign(campaign)
    setViewMode("campaign-detail")
  }

  const handleCreateCharacter = () => {
    setSelectedCharacter(null)
    setViewMode("create-character")
  }

  const handleEditCharacter = (character?: Character) => {
    setSelectedCharacter(character || null)
    setViewMode("edit-character")
  }

  const handleSaveCharacter = async (characterData: Partial<Character>) => {
    try {
      if (selectedCharacter) {
        const updatedCharacter = await dataService.updateCharacter(selectedCharacter.id, characterData);
        setCharacters(
          characters.map((c) =>
            c.id === selectedCharacter.id ? updatedCharacter : c,
          ),
        );
      } else {
        const newCharacter = await dataService.createCharacter(characterData);
        setCharacters([...characters, newCharacter]);
      }
      setViewMode("overview");
      setSelectedCharacter(null);
    } catch (error) {
      console.error('Failed to save character:', error);
      // You could add error handling UI here
    }
  }

  const handleViewCharacter = (character: Character) => {
    setSelectedCharacter(character)
    setViewMode("character-sheet")
  }

  const handleCreateLocation = () => {
    setSelectedLocation(null)
    setViewMode("create-location")
  }

  const handleEditLocation = (location?: Location) => {
    setSelectedLocation(location || null)
    setViewMode("edit-location")
  }

  const handleSaveLocation = async (locationData: Partial<Location>) => {
    try {
      if (selectedLocation) {
        const updatedLocation = await dataService.updateLocation(selectedLocation.id, locationData);
        setLocations(
          locations.map((l) =>
            l.id === selectedLocation.id ? updatedLocation : l,
          ),
        );
      } else {
        const newLocation = await dataService.createLocation(locationData);
        setLocations([...locations, newLocation]);
      }
      setViewMode("overview");
      setSelectedLocation(null);
    } catch (error) {
      console.error('Failed to save location:', error);
      // You could add error handling UI here
    }
  }

  const handleViewLocation = (location: Location) => {
    setSelectedLocation(location)
    setViewMode("location-detail")
  }

  const handlePlaySession = (session: Session) => {
    console.log("Starting session:", session)
    setViewMode("game-session")
  }

  const handleStartGameSession = () => {
    setViewMode("game-session")
  }

  const handleBackToOverview = () => {
    setViewMode("overview")
    setSelectedCampaign(null)
    setSelectedCharacter(null)
    setSelectedLocation(null)
  }

  // Render different views based on current mode
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
                <h1 className="text-2xl font-bold text-foreground">AI Dungeons & Dragons</h1>
                <p className="text-muted-foreground">
                  {viewMode === "create-campaign" ? "Create New Campaign" : "Edit Campaign"}
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
          />
        </div>
      </div>
    )
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
                <h1 className="text-2xl font-bold text-foreground">AI Dungeons & Dragons</h1>
                <p className="text-muted-foreground">
                  {viewMode === "create-character" ? "Create New Character" : "Edit Character"}
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
          />
        </div>
      </div>
    )
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
                <h1 className="text-2xl font-bold text-foreground">AI Dungeons & Dragons</h1>
                <p className="text-muted-foreground">
                  {viewMode === "create-location" ? "Create New Location" : "Edit Location"}
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
            availableLocations={locations}
          />
        </div>
      </div>
    )
  }

  if (viewMode === "character-sheet" && selectedCharacter) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary rounded-lg">
                <Sword className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">AI Dungeons & Dragons</h1>
                <p className="text-muted-foreground">Character Sheet</p>
              </div>
            </div>
          </div>
        </header>
        <div className="container mx-auto px-4 py-8">
          <div className="mb-4">
            <Button variant="outline" onClick={handleBackToOverview}>
              ← Back to Overview
            </Button>
          </div>
          <CharacterSheet character={selectedCharacter} onEdit={() => handleEditCharacter(selectedCharacter)} />
        </div>
      </div>
    )
  }

  if (viewMode === "location-detail" && selectedLocation) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary rounded-lg">
                <Sword className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">AI Dungeons & Dragons</h1>
                <p className="text-muted-foreground">Location Details</p>
              </div>
            </div>
          </div>
        </header>
        <div className="container mx-auto px-4 py-8">
          <LocationDetail
            location={selectedLocation}
            onBack={handleBackToOverview}
            onEdit={() => handleEditLocation(selectedLocation)}
            allLocations={locations}
          />
        </div>
      </div>
    )
  }

  if (viewMode === "campaign-detail" && selectedCampaign) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary rounded-lg">
                <Sword className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">AI Dungeons & Dragons</h1>
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
    )
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
                <h1 className="text-2xl font-bold text-foreground">AI Dungeons & Dragons</h1>
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
          />
        </div>
      </div>
    )
  }

  // Default overview mode
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
                <h1 className="text-2xl font-bold text-foreground">AI Dungeons & Dragons</h1>
                <p className="text-muted-foreground">Your AI-powered tabletop adventure</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm text-muted-foreground">API Mode:</label>
                <select 
                  className="text-sm border rounded px-2 py-1"
                  onChange={(e) => {
                    dataService.setUseMockData(e.target.value === 'mock');
                    // Reload data when switching modes
                    window.location.reload();
                  }}
                  defaultValue="mock"
                >
                  <option value="mock">Mock Data</option>
                  <option value="api">Real API</option>
                </select>
              </div>
              <Button className="bg-primary hover:bg-primary/90" onClick={handleCreateCampaign}>
                <Plus className="h-4 w-4 mr-2" />
                New Campaign
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
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
              <h2 className="text-3xl font-bold text-foreground">Your Campaigns</h2>
              <Button variant="outline" onClick={handleCreateCampaign}>
                <Plus className="h-4 w-4 mr-2" />
                Create Campaign
              </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {campaigns.map((campaign) => (
                <Card
                  key={campaign.id}
                  className="bg-card border-2 border-orange-500 hover:shadow-lg hover:shadow-primary/10 transition-all cursor-pointer"
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl">{campaign.name}</CardTitle>
                      <Badge variant={campaign.isActive ? "default" : "secondary"}>
                        {campaign.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <CardDescription>{campaign.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{campaign.setting}</span>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEditCampaign(campaign)}>
                          Edit
                        </Button>
                        <Button size="sm" onClick={() => handleViewCampaign(campaign)}>
                          <Play className="h-4 w-4 mr-2" />
                          Manage
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Play Tab */}
          <TabsContent value="play" className="space-y-6">
            <div className="text-center py-12">
              <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground mb-2">Begin Your Adventure</h2>
              <p className="text-muted-foreground mb-6">
                Choose your campaign and character to start playing with your AI Dungeon Master. The AI will guide your
                story and play all the NPCs you encounter.
              </p>
              <Button size="lg" className="bg-primary hover:bg-primary/90" onClick={handleStartGameSession}>
                <Play className="h-5 w-5 mr-2" />
                Start New Adventure
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
