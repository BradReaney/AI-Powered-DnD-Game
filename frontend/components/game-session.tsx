import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { GameChat } from "./game-chat";
import type { Campaign, Character, Location } from "@/lib/types";
import { ArrowLeft, Play, Users, MapPin, Settings, Save } from "lucide-react";
import { useState, useEffect } from "react";
import apiService from "@/lib/api";

interface GameSessionProps {
  campaigns: Campaign[];
  characters: Character[];
  locations: Location[];
  onBack: () => void;
  onStartGameplay: (campaign: Campaign, character: Character) => void;
}

export function GameSession({
  campaigns,
  characters: initialCharacters,
  locations,
  onBack,
  onStartGameplay,
}: GameSessionProps) {
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [campaignCharacters, setCampaignCharacters] = useState<Character[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeCampaigns = campaigns.filter((c) => c.status === 'active');

  // Fetch characters when a campaign is selected
  useEffect(() => {
    if (selectedCampaign) {
      fetchCampaignCharacters(selectedCampaign.id);
    } else {
      setCampaignCharacters([]);
      setSelectedCharacter(null);
    }
  }, [selectedCampaign]);

  const fetchCampaignCharacters = async (campaignId: string) => {
    try {
      setLoading(true);
      setError(null);
      const characters = await apiService.getCharactersByCampaign(campaignId);
      setCampaignCharacters(characters);
    } catch (err) {
      console.error('Failed to fetch characters:', err);
      setError('Failed to fetch characters for this campaign');
      setCampaignCharacters([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCampaignSelect = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setSelectedCharacter(null);
  };

  const handleCharacterSelect = (character: Character) => {
    setSelectedCharacter(character);
  };

  const handleStartAdventure = () => {
    if (selectedCampaign && selectedCharacter) {
      onStartGameplay(selectedCampaign, selectedCharacter);
    }
  };

  const canStartAdventure = selectedCampaign && selectedCharacter;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Overview
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Start New Game Session</h1>
          <p className="text-muted-foreground">
            Select your campaign and character to begin
          </p>
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
                <p className="text-muted-foreground">
                  No active campaigns available.
                </p>
                <p className="text-sm text-muted-foreground">
                  Create a campaign first to start playing.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeCampaigns.map((campaign) => (
                  <div
                    key={campaign.id}
                    className={`p-4 border rounded-lg border-border transition-colors cursor-pointer ${selectedCampaign?.id === campaign.id
                      ? 'border-primary bg-primary/5'
                      : 'hover:border-primary/50'
                      }`}
                    onClick={() => handleCampaignSelect(campaign)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{campaign.name}</h3>
                      <Badge variant="default">Active</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {campaign.description}
                    </p>
                    <div className="text-xs text-muted-foreground">
                      {campaign.setting}
                    </div>
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
            <CardDescription>
              {selectedCampaign
                ? `Choose your character for ${selectedCampaign.name}`
                : 'Choose your character for this session'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!selectedCampaign ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Please select a campaign first.
                </p>
              </div>
            ) : loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading characters...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-destructive mb-2">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchCampaignCharacters(selectedCampaign.id)}
                >
                  Retry
                </Button>
              </div>
            ) : campaignCharacters.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No characters available for this campaign.
                </p>
                <p className="text-sm text-muted-foreground">
                  Create a character first to start playing.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {campaignCharacters.map((character) => (
                  <div
                    key={character.id}
                    className={`p-4 border rounded-lg border-border transition-colors cursor-pointer ${selectedCharacter?.id === character.id
                      ? 'border-primary bg-primary/5'
                      : 'hover:border-primary/50'
                      }`}
                    onClick={() => handleCharacterSelect(character)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{character.name}</h3>
                      <Badge variant="secondary">Level {character.level}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {character.race} {character.class}
                    </p>
                    <div className="text-xs text-muted-foreground">
                      HP: {character.hitPoints?.current || 0}/{character.hitPoints?.maximum || 0} | AC: {character.armorClass}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Start Game Button */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <Button
              size="lg"
              disabled={!canStartAdventure}
              className="bg-primary hover:bg-primary/90"
              onClick={handleStartAdventure}
            >
              <Play className="h-5 w-5 mr-2" />
              Start Adventure
            </Button>
            {!canStartAdventure && (
              <p className="text-sm text-muted-foreground mt-2">
                {!selectedCampaign
                  ? 'Please select a campaign first'
                  : !selectedCharacter
                    ? 'Please select a character first'
                    : 'Ready to start!'
                }
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
