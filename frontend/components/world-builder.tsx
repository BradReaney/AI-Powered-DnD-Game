"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import {
  Map,
  Sparkles,
  Users,
  Sword,
  Gem,
  Leaf,
  Mountain,
  Building,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Clock,
  AlertTriangle,
  Star,
} from "lucide-react";
import type { Character, Location, Campaign } from "@/lib/types";

interface WorldBuilderProps {
  character: Character;
  currentLocation?: Location;
  campaign: Campaign;
  onLocationChange?: (location: Location) => void;
}

interface Encounter {
  id: string;
  type: "combat" | "social" | "exploration" | "puzzle" | "treasure";
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard" | "deadly";
  partyLevel: number;
  location: string;
  rewards: string[];
  consequences: string[];
  timestamp: Date;
}

interface WorldEvent {
  id: string;
  type: "natural" | "political" | "magical" | "social" | "economic";
  title: string;
  description: string;
  impact: "minor" | "moderate" | "major" | "catastrophic";
  affectedAreas: string[];
  duration: string;
  timestamp: Date;
  isActive: boolean;
}

export function WorldBuilder({
  character,
  currentLocation,
  campaign,
  onLocationChange,
}: WorldBuilderProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "encounters" | "events" | "locations"
  >("encounters");
  const [encounters, setEncounters] = useState<Encounter[]>([]);
  const [worldEvents, setWorldEvents] = useState<WorldEvent[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    // Initialize with sample data
    const sampleEncounters: Encounter[] = [
      {
        id: "1",
        type: "combat",
        title: "Goblin Ambush",
        description:
          "A group of goblins ambush the party from the surrounding trees",
        difficulty: "easy",
        partyLevel: 1,
        location: "Forest Path",
        rewards: ["Goblin weapons", "Small treasure", "XP"],
        consequences: [
          "Party may be wounded",
          "Noise might attract more enemies",
        ],
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
      {
        id: "2",
        type: "social",
        title: "Mysterious Traveler",
        description: "A cloaked figure approaches asking for directions",
        difficulty: "medium",
        partyLevel: 2,
        location: "Crossroads",
        rewards: ["Information", "Potential ally", "Quest hook"],
        consequences: ["Might be a trap", "Could waste time"],
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
      },
    ];

    const sampleEvents: WorldEvent[] = [
      {
        id: "1",
        type: "magical",
        title: "Ley Line Surge",
        description:
          "Magical energy surges through the region, affecting spellcasters",
        impact: "moderate",
        affectedAreas: ["Forest", "Mountain", "City"],
        duration: "2 days",
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
        isActive: true,
      },
      {
        id: "2",
        type: "political",
        title: "Noble Dispute",
        description: "Two noble houses are in conflict over territory",
        impact: "major",
        affectedAreas: ["City", "Villages", "Trade routes"],
        duration: "1 week",
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
        isActive: true,
      },
    ];

    setEncounters(sampleEncounters);
    setWorldEvents(sampleEvents);
  }, []);

  const generateRandomEncounter = () => {
    setIsGenerating(true);

    // Simulate generation time
    setTimeout(() => {
      const encounterTypes = [
        "combat",
        "social",
        "exploration",
        "puzzle",
        "treasure",
      ];
      const difficulties = ["easy", "medium", "hard", "deadly"];
      const locations = [
        "Forest",
        "Mountain",
        "City",
        "Dungeon",
        "Road",
        "Tavern",
        "Market",
      ];

      const randomType =
        encounterTypes[Math.floor(Math.random() * encounterTypes.length)];
      const randomDifficulty =
        difficulties[Math.floor(Math.random() * difficulties.length)];
      const randomLocation =
        locations[Math.floor(Math.random() * locations.length)];

      const encounterTemplates = {
        combat: {
          easy: ["Goblin scouts", "Bandit thugs", "Wild animals"],
          medium: ["Orc raiders", "Undead warriors", "Giant spiders"],
          hard: ["Dragon wyrmlings", "Mind flayers", "Ancient guardians"],
          deadly: ["Adult dragons", "Demon lords", "Titanic constructs"],
        },
        social: {
          easy: ["Friendly merchant", "Lost child", "Helpful guard"],
          medium: [
            "Suspicious stranger",
            "Noble in disguise",
            "Mysterious sage",
          ],
          hard: ["Political rival", "Criminal mastermind", "Corrupt official"],
          deadly: ["Evil overlord", "Ancient evil", "Betrayer"],
        },
        exploration: {
          easy: ["Hidden cave", "Ancient ruins", "Secret passage"],
          medium: [
            "Underground complex",
            "Floating island",
            "Time-warped area",
          ],
          hard: ["Pocket dimension", "Reality rift", "Forgotten realm"],
          deadly: ["Void portal", "Chaos realm", "Eldritch space"],
        },
        puzzle: {
          easy: ["Simple riddle", "Basic mechanism", "Pattern matching"],
          medium: [
            "Complex logic",
            "Multi-step process",
            "Symbol interpretation",
          ],
          hard: ["Reality-bending", "Time manipulation", "Dimensional logic"],
          deadly: [
            "Mind-shattering",
            "Existence questioning",
            "Cosmic understanding",
          ],
        },
        treasure: {
          easy: ["Small chest", "Hidden cache", "Merchant's goods"],
          medium: ["Ancient vault", "Dragon's hoard", "Temple treasury"],
          hard: ["Legendary artifacts", "Godly weapons", "Reality shards"],
          deadly: [
            "Cosmic essence",
            "Creation fragments",
            "Omnipotence shards",
          ],
        },
      };

      const typeTemplates =
        encounterTemplates[randomType as keyof typeof encounterTemplates];
      const difficultyTemplates =
        typeTemplates[randomDifficulty as keyof typeof typeTemplates];
      const randomTitle =
        difficultyTemplates[
          Math.floor(Math.random() * difficultyTemplates.length)
        ];

      const newEncounter: Encounter = {
        id: crypto.randomUUID(),
        type: randomType as any,
        title: randomTitle,
        description: `A ${randomDifficulty} ${randomType} encounter in the ${randomLocation}`,
        difficulty: randomDifficulty as any,
        partyLevel: character.level,
        location: randomLocation,
        rewards: ["Experience", "Loot", "Knowledge"],
        consequences: ["Time cost", "Resource drain", "Risk"],
        timestamp: new Date(),
      };

      setEncounters((prev) => [newEncounter, ...prev]);
      setIsGenerating(false);
    }, 1500);
  };

  const getEncounterIcon = (type: string) => {
    switch (type) {
      case "combat":
        return <Sword className="h-4 w-4" />;
      case "social":
        return <Users className="h-4 w-4" />;
      case "exploration":
        return <Map className="h-4 w-4" />;
      case "puzzle":
        return <Sparkles className="h-4 w-4" />;
      case "treasure":
        return <Gem className="h-4 w-4" />;
      default:
        return <Star className="h-4 w-4" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800 border-green-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "hard":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "deadly":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case "natural":
        return <Leaf className="h-4 w-4" />;
      case "political":
        return <Building className="h-4 w-4" />;
      case "magical":
        return <Sparkles className="h-4 w-4" />;
      case "social":
        return <Users className="h-4 w-4" />;
      case "economic":
        return <Gem className="h-4 w-4" />;
      default:
        return <Star className="h-4 w-4" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "minor":
        return "bg-green-100 text-green-800 border-green-200";
      case "moderate":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "major":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "catastrophic":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Map className="h-5 w-5" />
            World Builder
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8 w-8 p-0"
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0">
          {/* Tab Navigation */}
          <div className="flex space-x-1 mb-4 p-1 bg-muted rounded-lg">
            {[
              { id: "encounters", label: "Encounters", icon: Sword },
              { id: "events", label: "World Events", icon: Sparkles },
              { id: "locations", label: "Locations", icon: Map },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab(tab.id as any)}
                  className="flex-1 h-8 text-xs"
                >
                  <Icon className="h-3 w-3 mr-1" />
                  {tab.label}
                </Button>
              );
            })}
          </div>

          {/* Tab Content */}
          {activeTab === "encounters" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Random Encounters</h4>
                <Button
                  onClick={generateRandomEncounter}
                  disabled={isGenerating}
                  size="sm"
                  className="text-xs"
                >
                  <RefreshCw
                    className={`h-3 w-3 mr-1 ${isGenerating ? "animate-spin" : ""}`}
                  />
                  {isGenerating ? "Generating..." : "Generate"}
                </Button>
              </div>

              <ScrollArea className="h-48">
                <div className="space-y-2">
                  {encounters.map((encounter) => (
                    <div key={encounter.id} className="p-3 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getEncounterIcon(encounter.type)}
                          <span className="text-sm font-medium">
                            {encounter.title}
                          </span>
                          <Badge
                            variant="outline"
                            className={`text-xs ${getDifficultyColor(encounter.difficulty)}`}
                          >
                            {encounter.difficulty}
                          </Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {encounter.timestamp.toLocaleTimeString()}
                        </span>
                      </div>

                      <p className="text-xs text-muted-foreground mb-2">
                        {encounter.description}
                      </p>

                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <span className="font-medium">Location:</span>{" "}
                          {encounter.location}
                        </div>
                        <div>
                          <span className="font-medium">Party Level:</span>{" "}
                          {encounter.partyLevel}
                        </div>
                      </div>

                      <div className="mt-2">
                        <div className="text-xs font-medium mb-1">Rewards:</div>
                        <div className="flex flex-wrap gap-1">
                          {encounter.rewards.map((reward, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="text-xs"
                            >
                              {reward}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="mt-2">
                        <div className="text-xs font-medium mb-1">
                          Consequences:
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {encounter.consequences.map((consequence, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-xs"
                            >
                              {consequence}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {activeTab === "events" && (
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Active World Events</h4>

              <ScrollArea className="h-48">
                <div className="space-y-2">
                  {worldEvents
                    .filter((event) => event.isActive)
                    .map((event) => (
                      <div key={event.id} className="p-3 border rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getEventIcon(event.type)}
                            <span className="text-sm font-medium">
                              {event.title}
                            </span>
                            <Badge
                              variant="outline"
                              className={`text-xs ${getImpactColor(event.impact)}`}
                            >
                              {event.impact}
                            </Badge>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {event.timestamp.toLocaleDateString()}
                          </span>
                        </div>

                        <p className="text-xs text-muted-foreground mb-2">
                          {event.description}
                        </p>

                        <div className="grid grid-cols-2 gap-4 text-xs mb-2">
                          <div>
                            <span className="font-medium">Type:</span>{" "}
                            {event.type}
                          </div>
                          <div>
                            <span className="font-medium">Duration:</span>{" "}
                            {event.duration}
                          </div>
                        </div>

                        <div>
                          <div className="text-xs font-medium mb-1">
                            Affected Areas:
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {event.affectedAreas.map((area, index) => (
                              <Badge
                                key={index}
                                variant="secondary"
                                className="text-xs"
                              >
                                {area}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {activeTab === "locations" && (
            <div className="space-y-4">
              <h4 className="text-sm font-medium">World Locations</h4>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-muted rounded-lg text-center">
                  <Leaf className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <div className="text-sm font-medium">Forest</div>
                  <div className="text-xs text-muted-foreground">
                    Wilderness area
                  </div>
                </div>

                <div className="p-3 bg-muted rounded-lg text-center">
                  <Mountain className="h-8 w-8 mx-auto mb-2 text-gray-600" />
                  <div className="text-sm font-medium">Mountains</div>
                  <div className="text-xs text-muted-foreground">
                    High elevation
                  </div>
                </div>

                <div className="p-3 bg-muted rounded-lg text-center">
                  <Building className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <div className="text-sm font-medium">City</div>
                  <div className="text-xs text-muted-foreground">
                    Urban center
                  </div>
                </div>

                <div className="p-3 bg-muted rounded-lg text-center">
                  <Map className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                  <div className="text-sm font-medium">Dungeon</div>
                  <div className="text-xs text-muted-foreground">
                    Underground
                  </div>
                </div>
              </div>

              {currentLocation && (
                <div className="p-3 border rounded-lg">
                  <h5 className="text-sm font-medium mb-2">Current Location</h5>
                  <div className="text-xs text-muted-foreground">
                    <div>
                      <strong>Name:</strong> {currentLocation.name}
                    </div>
                    <div>
                      <strong>Type:</strong> {currentLocation.type}
                    </div>
                    <div>
                      <strong>Difficulty:</strong> {currentLocation.difficulty}
                    </div>
                    <div>
                      <strong>Description:</strong>{" "}
                      {currentLocation.description}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
