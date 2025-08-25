"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { mockCampaigns, mockCharacters, mockLocations } from "@/lib/mock-data"
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
  const [campaigns, setCampaigns] = useState<Campaign[]>(mockCampaigns)
  const [characters, setCharacters] = useState<Character[]>(mockCharacters)
  const [locations, setLocations] = useState<Location[]>(mockLocations)
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>("overview")
  const [activeTab, setActiveTab] = useState("campaigns")

  const handleCreateCampaign = () => {
    setSelectedCampaign(null)
    setViewMode("create-campaign")
  }

  const handleEditCampaign = (campaign?: Campaign) => {
    setSelectedCampaign(campaign || null)
    setViewMode("edit-campaign")
  }

  const handleSaveCampaign = (campaignData: Partial<Campaign>) => {
    if (selectedCampaign) {
      setCampaigns(
        campaigns.map((c) =>
          c.id === selectedCampaign.id ? ({ ...selectedCampaign, ...campaignData } as Campaign) : c,
        ),
      )
    } else {
      const newCampaign = {
        ...campaignData,
        id: campaignData.id || crypto.randomUUID(),
        createdAt: campaignData.createdAt || new Date(),
        updatedAt: new Date(),
      } as Campaign
      setCampaigns([...campaigns, newCampaign])
    }
    setViewMode("overview")
    setSelectedCampaign(null)
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

  const handleSaveCharacter = (characterData: Partial<Character>) => {
    if (selectedCharacter) {
      setCharacters(
        characters.map((c) =>
          c.id === selectedCharacter.id ? ({ ...selectedCharacter, ...characterData } as Character) : c,
        ),
      )
    } else {
      const newCharacter = {
        ...characterData,
        id: characterData.id || crypto.randomUUID(),
        createdAt: characterData.createdAt || new Date(),
        updatedAt: new Date(),
      } as Character
      setCharacters([...characters, newCharacter])
    }
    setViewMode("overview")
    setSelectedCharacter(null)
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

  const handleSaveLocation = (locationData: Partial<Location>) => {
    if (selectedLocation) {
      setLocations(
        locations.map((l) =>
          l.id === selectedLocation.id ? ({ ...selectedLocation, ...locationData } as Location) : l,
        ),
      )
    } else {
      const newLocation = {
        ...locationData,
        id: locationData.id || crypto.randomUUID(),
        createdAt: locationData.createdAt || new Date(),
        updatedAt: new Date(),
      } as Location
      setLocations([...locations, newLocation])
    }
    setViewMode("overview")
    setSelectedLocation(null)
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
          />
        </div>
      </div>
    )
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
                <h1 className="text-2xl font-bold text-foreground">AI Dungeons & Dragons</h1>
                <p className="text-muted-foreground">Campaign Details</p>
              </div>
            </div>
          </div>
        </header>
        <div className="container mx-auto px-4 py-8">
          <CampaignDetail
            campaign={selectedCampaign!}
            onEdit={() => handleEditCampaign(selectedCampaign!)}
            onBack={handleBackToOverview}
          />
        </div>
      </div>
    )
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
                <h1 className="text-2xl font-bold text-foreground">AI Dungeons & Dragons</h1>
                <p className="text-muted-foreground">Character Sheet</p>
              </div>
            </div>
          </div>
        </header>
        <div className="container mx-auto px-4 py-8">
          <CharacterSheet
            character={selectedCharacter!}
            onEdit={() => handleEditCharacter(selectedCharacter!)}
            onBack={handleBackToOverview}
          />
        </div>
      </div>
    )
  }

  if (viewMode === "location-detail") {
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
            location={selectedLocation!}
            onEdit={() => handleEditLocation(selectedLocation!)}
            onBack={handleBackToOverview}
          />
        </div>
      </div>
    )
  }

  if (viewMode === "game-session") {
    return (
      <div className="min-h-screen bg-background">
        <GameSession onBack={handleBackToOverview} />
      </div>
    )
  }

  // Main overview
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
              <p className="text-muted-foreground">Your adventure awaits</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-foreground">Game Dashboard</h2>
            <Button onClick={handleStartGameSession} className="flex items-center gap-2">
              <Play className="h-4 w-4" />
              Start Game Session
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            <TabsTrigger value="characters">Characters</TabsTrigger>
            <TabsTrigger value="locations">Locations</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
          </TabsList>

          <TabsContent value="campaigns" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-foreground">Your Campaigns</h3>
              <Button onClick={handleCreateCampaign} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                New Campaign
              </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {campaigns.map((campaign) => (
                <Card key={campaign.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sword className="h-5 w-5 text-primary" />
                      {campaign.name}
                    </CardTitle>
                    <CardDescription>{campaign.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="secondary">{campaign.theme}</Badge>
                      <Badge variant="outline">{campaign.difficulty}</Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewCampaign(campaign)}
                      >
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditCampaign(campaign)}
                      >
                        Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="characters" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-foreground">Your Characters</h3>
              <Button onClick={handleCreateCharacter} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                New Character
              </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {characters.map((character) => (
                <Card key={character.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sword className="h-5 w-5 text-primary" />
                      {character.name}
                    </CardTitle>
                    <CardDescription>
                      Level {character.level} {character.race} {character.class}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="secondary">HP: {character.hitPoints}</Badge>
                      <Badge variant="outline">AC: {character.armorClass}</Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewCharacter(character)}
                      >
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditCharacter(character)}
                      >
                        Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="locations" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-foreground">Your Locations</h3>
              <Button onClick={handleCreateLocation} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                New Location
              </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {locations.map((location) => (
                <Card key={location.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sword className="h-5 w-5 text-primary" />
                      {location.name}
                    </CardTitle>
                    <CardDescription>{location.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="secondary">{location.type}</Badge>
                      <Badge variant="outline">{location.difficulty}</Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewLocation(location)}
                      >
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditLocation(location)}
                      >
                        Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="sessions" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-foreground">Recent Sessions</h3>
              <Button onClick={handleStartGameSession} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                New Session
              </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {campaigns.flatMap((campaign) =>
                campaign.sessions?.map((session) => (
                  <Card key={session.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-primary" />
                        {session.title}
                      </CardTitle>
                      <CardDescription>
                        {campaign.name} - {session.date.toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="secondary">{session.status}</Badge>
                        <Badge variant="outline">{session.duration} min</Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePlaySession(session)}
                        >
                          Play
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )) || []
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
