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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MessageSquare, Play, User, Sword } from "lucide-react";
import type { Campaign, Character } from "@/lib/types";
import apiService from "@/lib/api";

interface CampaignCharacterSelectorProps {
  onStartGame: (campaign: Campaign, character: Character) => void;
  onBack: () => void;
}

export function CampaignCharacterSelector({
  onStartGame,
  onBack,
}: CampaignCharacterSelectorProps) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>("");
  const [selectedCharacterId, setSelectedCharacterId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch campaigns and characters
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [campaignsData] = await Promise.all([apiService.getCampaigns()]);
        const campaignsArray = Array.isArray(campaignsData)
          ? campaignsData
          : [];

        // Only show active campaigns
        const activeCampaigns = campaignsArray.filter(
          (campaign) => campaign.status === "active",
        );
        setCampaigns(activeCampaigns);

        // Fetch characters for all active campaigns
        const allCharacters: Character[] = [];
        for (const campaign of activeCampaigns) {
          try {
            const campaignCharacters = await apiService.getCharactersByCampaign(
              campaign.id,
            );
            allCharacters.push(...campaignCharacters);
          } catch (err) {
            console.error(
              `Failed to fetch characters for campaign ${campaign.id}:`,
              err,
            );
          }
        }
        setCharacters(allCharacters);
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [apiService]); // Add apiService as dependency to ensure proper re-fetching

  // Manual refresh function
  const handleRefresh = () => {
    setLoading(true);
    setError(null);
    // Force re-fetch by updating a dependency
    setCampaigns([]);
    setCharacters([]);
    // The useEffect will run again due to state changes
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

    const selectedCampaign = campaigns.find((c) => c.id === selectedCampaignId);
    const selectedCharacter = characters.find(
      (c) => c.id === selectedCharacterId,
    );

    if (selectedCampaign && selectedCharacter) {
      onStartGame(selectedCampaign, selectedCharacter);
    }
  };

  // Check if we can start the game
  const canStartGame = selectedCampaignId && selectedCharacterId;

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">
          Loading campaigns and characters...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive mb-4">{error}</p>
        <Button onClick={() => window.location.reload()} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  if (campaigns.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">
          No campaigns available. Create a campaign first to get started.
        </p>
        <Button onClick={handleRefresh} variant="outline">
          Refresh
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
            value={selectedCampaignId}
            onValueChange={handleCampaignChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a campaign" />
            </SelectTrigger>
            <SelectContent>
              {campaigns.map((campaign) => (
                <SelectItem key={campaign.id} value={campaign.id}>
                  <div className="flex items-center gap-2">
                    <span>{campaign.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {campaign.theme || "Custom"}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
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
