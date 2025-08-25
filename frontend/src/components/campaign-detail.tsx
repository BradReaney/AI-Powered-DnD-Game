"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Campaign, Session, Character, Location } from "@/lib/types"
import { SessionManager } from "./session-manager"
import { CharacterForm } from "./character-form"
import { CharacterSheet } from "./character-sheet"
import { LocationForm } from "./location-form"
import { LocationDetail } from "./location-detail"
import { ArrowLeft, Edit, Settings, Play, Users, MapPin, Plus } from "lucide-react"

interface CampaignDetailProps {
  campaign: Campaign
  characters: Character[]
  locations: Location[]
  onBack: () => void
  onEdit: () => void
  onPlaySession?: (session: Session) => void
  onSaveCharacter: (character: Partial<Character>) => void
  onSaveLocation: (location: Partial<Location>) => void
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
}: CampaignDetailProps) {
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [characterViewMode, setCharacterViewMode] = useState<"list" | "create" | "edit" | "view">("list")
  const [locationViewMode, setLocationViewMode] = useState<"list" | "create" | "edit" | "view">("list")

  const campaignCharacters = characters.filter((char) => char.campaignId === campaign.id)
  const campaignLocations = locations.filter((loc) => loc.campaignId === campaign.id)

  const handleCreateCharacter = () => {
    setSelectedCharacter(null)
    setCharacterViewMode("create")
  }

  const handleEditCharacter = (character: Character) => {
    setSelectedCharacter(character)
    setCharacterViewMode("edit")
  }

  const handleViewCharacter = (character: Character) => {
    setSelectedCharacter(character)
    setCharacterViewMode("view")
  }

  const handleSaveCharacterData = (characterData: Partial<Character>) => {
    onSaveCharacter({ ...characterData, campaignId: campaign.id })
    setCharacterViewMode("list")
    setSelectedCharacter(null)
  }

  const handleCreateLocation = () => {
    setSelectedLocation(null)
    setLocationViewMode("create")
  }

  const handleEditLocation = (location: Location) => {
    setSelectedLocation(location)
    setLocationViewMode("edit")
  }

  const handleViewLocation = (location: Location) => {
    setSelectedLocation(location)
    setLocationViewMode("view")
  }

  const handleSaveLocationData = (locationData: Partial<Location>) => {
    onSaveLocation({ ...locationData, campaignId: campaign.id })
    setLocationViewMode("list")
    setSelectedLocation(null)
  }

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
            <Badge variant={campaign.isActive ? "default" : "secondary"}>
              {campaign.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
          <p className="text-muted-foreground">{campaign.setting}</p>
        </div>
        <Button variant="outline" onClick={onEdit}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Campaign
        </Button>
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
                    <span>{campaign.setting}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created:</span>
                    <span>{campaign.createdAt.toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Updated:</span>
                    <span>{campaign.updatedAt.toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Campaign Management Tabs */}
      <Tabs defaultValue="sessions" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
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
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sessions">
          <SessionManager campaign={campaign} onSessionSelect={onPlaySession} />
        </TabsContent>

        <TabsContent value="characters">
          {characterViewMode === "create" || characterViewMode === "edit" ? (
            <CharacterForm
              character={selectedCharacter || undefined}
              onSave={handleSaveCharacterData}
              onCancel={() => setCharacterViewMode("list")}
            />
          ) : characterViewMode === "view" && selectedCharacter ? (
            <div className="space-y-4">
              <Button variant="outline" onClick={() => setCharacterViewMode("list")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Characters
              </Button>
              <CharacterSheet character={selectedCharacter} onEdit={() => handleEditCharacter(selectedCharacter)} />
            </div>
          ) : (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Campaign Characters</CardTitle>
                    <CardDescription>Manage player characters and NPCs for this campaign</CardDescription>
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
                    <p className="text-muted-foreground mb-4">No characters in this campaign yet.</p>
                    <Button onClick={handleCreateCharacter}>Create First Character</Button>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {campaignCharacters.map((character) => (
                      <Card key={character.id} className="bg-card border-2 border-orange-500">
                        <CardHeader>
                          <CardTitle className="text-center text-lg">{character.name}</CardTitle>
                          <CardDescription className="text-center">
                            Level {character.level} {character.race} {character.class}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>HP:</span>
                              <span>
                                {character.hitPoints.current}/{character.hitPoints.maximum}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>AC:</span>
                              <span>{character.armorClass}</span>
                            </div>
                            <div className="flex gap-2 pt-2">
                              <Button size="sm" variant="outline" onClick={() => handleEditCharacter(character)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </Button>
                              <Button size="sm" onClick={() => handleViewCharacter(character)}>
                                View
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
            />
          ) : locationViewMode === "view" && selectedLocation ? (
            <div className="space-y-4">
              <Button variant="outline" onClick={() => setLocationViewMode("list")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Locations
              </Button>
              <LocationDetail
                location={selectedLocation}
                onBack={() => setLocationViewMode("list")}
                onEdit={() => handleEditLocation(selectedLocation)}
                allLocations={campaignLocations}
              />
            </div>
          ) : (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Campaign Locations</CardTitle>
                    <CardDescription>Manage locations and world-building for this campaign</CardDescription>
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
                    <p className="text-muted-foreground mb-4">No locations in this campaign yet.</p>
                    <Button onClick={handleCreateLocation}>Create First Location</Button>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {campaignLocations.map((location) => (
                      <Card key={location.id} className="bg-card border-2 border-orange-500">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">{location.name}</CardTitle>
                            <Badge variant="outline" className="capitalize">
                              {location.type}
                            </Badge>
                          </div>
                          <CardDescription>{location.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {location.inhabitants && location.inhabitants.length > 0 && (
                              <div>
                                <h4 className="font-semibold text-sm">Inhabitants:</h4>
                                <div className="flex flex-wrap gap-1">
                                  {location.inhabitants.slice(0, 2).map((inhabitant, index) => (
                                    <Badge key={index} variant="secondary" className="text-xs">
                                      {inhabitant}
                                    </Badge>
                                  ))}
                                  {location.inhabitants.length > 2 && (
                                    <Badge variant="secondary" className="text-xs">
                                      +{location.inhabitants.length - 2} more
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            )}
                            <div className="flex gap-2 pt-2">
                              <Button size="sm" variant="outline" onClick={() => handleEditLocation(location)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </Button>
                              <Button size="sm" onClick={() => handleViewLocation(location)}>
                                View
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

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Settings</CardTitle>
              <CardDescription>Configure campaign rules and preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Campaign settings coming soon...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
