"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MessageSquare, Play, User, Sword } from "lucide-react";
import type { Campaign, Character } from "@/lib/types";

interface CampaignCharacterSelectorProps {
  campaigns: Campaign[];
  characters: Character[];
  onStartGame: (campaign: Campaign, character: Character) => void;
  onBack: () => void;
}

export function CampaignCharacterSelector({
  campaigns,
  characters,
  onStartGame,
  onBack,
}: CampaignCharacterSelectorProps) {
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>("");
  const [selectedCharacterId, setSelectedCharacterId] = useState<string>("");

  // Filter campaigns that have characters available
  // Temporarily show all campaigns for testing
  const availableCampaigns = campaigns;

  // Manual refresh function - now just triggers a re-render
  const handleRefresh = () => {
    // Reset selections to force re-render
    setSelectedCampaignId("");
    setSelectedCharacterId("");
  };

  // Get characters for selected campaign
  const getCharactersForCampaign = (campaignId: string) => {
    return characters.filter((char) => char.campaignId === campaignId);
  };

  // Handle campaign selection
  const handleCampaignChange = (campaignId: string) => {
    setSelectedCampaignId(campaignId);
    setSelectedCharacterId(""); // Reset character selection when campaign changes
  };

  // Handle start game
  const handleStartGame = () => {
    if (!selectedCampaignId || !selectedCharacterId) return;

    const selectedCampaign = availableCampaigns.find(
      (c) => c.id === selectedCampaignId,
    );
    const selectedCharacter = characters.find(
      (c) => c.id === selectedCharacterId,
    );

    if (selectedCampaign && selectedCharacter) {
      onStartGame(selectedCampaign, selectedCharacter);
    }
  };

  // Check if we can start the game
  const canStartGame = selectedCampaignId && selectedCharacterId;

  // Show loading state if data is not yet available
  if (!campaigns || campaigns.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">
          Loading campaigns... Please wait.
        </p>
        <Button onClick={onBack} variant="outline">
          Back to Overview
        </Button>
      </div>
    );
  }

  if (availableCampaigns.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">
          No campaigns with characters available. Create a campaign and
          character first to get started.
        </p>
        <Button onClick={onBack} variant="outline">
          Back to Overview
        </Button>
      </div>
    );
  }

  if (characters.length === 0) {
    return (
      <div className="text-center py-12">
        <User className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-foreground mb-2">
          No Characters Available
        </h2>
        <p className="text-muted-foreground mb-6">
          You need to create a character in one of your campaigns before you can
          start playing.
        </p>
        <Button onClick={onBack} variant="outline">
          Back to Overview
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Choose Your Adventure
        </h2>
        <p className="text-muted-foreground mb-6">
          Select your campaign and character to begin your adventure with the AI
          Dungeon Master.
        </p>
        <Button onClick={handleRefresh} variant="outline" size="sm">
          Refresh Data
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sword className="h-5 w-5" />
            Campaign Selection
          </CardTitle>
          <CardDescription>
            Choose the campaign world you want to play in
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select
            key={`campaign-select-${availableCampaigns.length}-${Date.now()}`}
            value={selectedCampaignId}
            onValueChange={handleCampaignChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a campaign" />
            </SelectTrigger>
            <SelectContent>
              {availableCampaigns && availableCampaigns.length > 0 ? (
                availableCampaigns.map((campaign) => (
                  <SelectItem
                    key={`campaign-${campaign.id}`}
                    value={campaign.id}
                  >
                    <div className="flex items-center gap-2">
                      <span>{campaign.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {campaign.theme || "Custom"}
                      </Badge>
                    </div>
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="" disabled>
                  No campaigns available
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedCampaignId && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Character Selection
            </CardTitle>
            <CardDescription>
              Choose your character for this adventure
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select
              value={selectedCharacterId}
              onValueChange={setSelectedCharacterId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a character" />
              </SelectTrigger>
              <SelectContent>
                {getCharactersForCampaign(selectedCampaignId).map(
                  (character) => (
                    <SelectItem key={character.id} value={character.id}>
                      <div className="flex items-center gap-2">
                        <span>{character.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          Level {character.level} {character.race}{" "}
                          {character.class}
                        </Badge>
                      </div>
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-4 justify-center">
        <Button onClick={onBack} variant="outline">
          Back
        </Button>
        <Button
          onClick={handleStartGame}
          disabled={!canStartGame}
          className="bg-primary hover:bg-primary/90"
        >
          <Play className="h-4 w-4 mr-2" />
          Start Adventure
        </Button>
      </div>

      {selectedCampaignId && selectedCharacterId && (
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Ready to begin your adventure! The AI Dungeon Master will
                automatically create a new session and guide you through your
                story.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
