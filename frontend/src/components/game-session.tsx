"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { GameChat } from "./game-chat"
import type { Campaign, Character, Location } from "@/lib/types"
import { ArrowLeft, Play, Users, MapPin, Settings, Save } from "lucide-react"

interface GameSessionProps {
  campaigns: Campaign[]
  characters: Character[]
  locations: Location[]
  onBack: () => void
}

export function GameSession({ campaigns, characters, locations, onBack }: GameSessionProps) {
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null)
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null)
  const [gameStarted, setGameStarted] = useState(false)

  const activeCampaigns = campaigns.filter((c) => c.isActive)

  const handleStartGame = () => {
    if (selectedCampaign && selectedCharacter) {
      const initialLocation = currentLocation || (locations.length > 0 ? locations[0] : null)
      setCurrentLocation(initialLocation)
      setGameStarted(true)
    }
  }

  const handleEndSession = () => {
    setGameStarted(false)
    setSelectedCampaign(null)
    setSelectedCharacter(null)
    setCurrentLocation(null)
    onBack()
  }

  const handleLocationChange = (location: Location) => {
    setCurrentLocation(location)
  }

  if (gameStarted && selectedCampaign && selectedCharacter) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => setGameStarted(false)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Setup
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Playing: {selectedCampaign.name}</h1>
            <p className="text-muted-foreground">
              {selectedCharacter.name} • {currentLocation?.name || "Unknown Location"}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Save className="h-4 w-4 mr-2" />
              Auto-Saved
            </Button>
            <Button variant="outline" onClick={handleEndSession}>
              <Settings className="h-4 w-4 mr-2" />
              End Session
            </Button>
          </div>
        </div>

        <GameChat
          campaign={selectedCampaign}
          character={selectedCharacter}
          currentLocation={currentLocation || undefined}
          onLocationChange={handleLocationChange}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Overview
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Start New Game Session</h1>
          <p className="text-muted-foreground">Select your campaign and character to begin</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Campaign Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              Select Campaign
            </CardTitle>
            <CardDescription>Choose an active campaign to play</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeCampaigns.length === 0 ? (
              <div className="text-center py-8">
                <Play className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No active campaigns available.</p>
                <p className="text-sm text-muted-foreground">Create a campaign first to start playing.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeCampaigns.map((campaign) => (
                  <div
                    key={campaign.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedCampaign?.id === campaign.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => setSelectedCampaign(campaign)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{campaign.name}</h3>
                      <Badge variant="default">Active</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{campaign.description}</p>
                    <div className="text-xs text-muted-foreground">{campaign.setting}</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Character Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Select Character
            </CardTitle>
            <CardDescription>Choose your character for this session</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {characters.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No characters available.</p>
                <p className="text-sm text-muted-foreground">Create a character first to start playing.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {characters.map((character) => (
                  <div
                    key={character.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedCharacter?.id === character.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => setSelectedCharacter(character)}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div>
                        <h3 className="font-semibold">{character.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Level {character.level} {character.race} {character.class}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>
                        HP: {character.hitPoints.current}/{character.hitPoints.maximum}
                      </span>
                      <span>AC: {character.armorClass}</span>
                      <Badge variant="outline" className="text-xs">
                        {character.alignment}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Location Selection (Optional) */}
      {selectedCampaign && selectedCharacter && locations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Starting Location (Optional)
            </CardTitle>
            <CardDescription>Choose where your adventure begins</CardDescription>
          </CardHeader>
          <CardContent>
            <Select
              value={currentLocation?.id || ""}
              onValueChange={(value) => {
                const location = locations.find((l) => l.id === value)
                setCurrentLocation(location || null)
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select starting location..." />
              </SelectTrigger>
              <SelectContent>
                {locations.map((location) => (
                  <SelectItem key={location.id} value={location.id}>
                    <div className="flex items-center gap-2">
                      <span>{location.name}</span>
                      <Badge variant="outline" className="capitalize text-xs">
                        {location.type}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}

      {/* Start Game Button */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <Button
              size="lg"
              onClick={handleStartGame}
              disabled={!selectedCampaign || !selectedCharacter}
              className="bg-primary hover:bg-primary/90"
            >
              <Play className="h-5 w-5 mr-2" />
              Start Adventure
            </Button>
            {(!selectedCampaign || !selectedCharacter) && (
              <p className="text-sm text-muted-foreground mt-2">Please select both a campaign and character to begin</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
