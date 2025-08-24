"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Star,
  TrendingUp,
  Award,
  Users,
  Heart,
  Shield,
  Zap,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Plus,
  Minus,
  Sword,
  MapPin,
} from "lucide-react";
import type { Character, Location, Campaign } from "@/lib/types";

interface CharacterProgressionProps {
  character: Character;
  currentLocation?: Location;
  campaign: Campaign;
}

interface Milestone {
  id: string;
  type: "combat" | "exploration" | "social" | "quest" | "level";
  title: string;
  description: string;
  date: Date;
  xpGained: number;
  completed: boolean;
}

interface Relationship {
  id: string;
  name: string;
  type: "ally" | "enemy" | "neutral" | "mentor" | "student";
  description: string;
  trustLevel: number;
  lastInteraction: Date;
  notes: string[];
}

export function CharacterProgression({
  character,
  currentLocation,
  campaign,
}: CharacterProgressionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [showAddMilestone, setShowAddMilestone] = useState(false);
  const [showAddRelationship, setShowAddRelationship] = useState(false);

  useEffect(() => {
    // Initialize with some sample data
    const sampleMilestones: Milestone[] = [
      {
        id: "1",
        type: "combat",
        title: "First Victory",
        description: "Defeated your first enemy in combat",
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        xpGained: 100,
        completed: true,
      },
      {
        id: "2",
        type: "exploration",
        title: "New Territory",
        description: "Discovered a new location",
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        xpGained: 50,
        completed: true,
      },
      {
        id: "3",
        type: "level",
        title: "Level Up",
        description: `Reached level ${character.level}`,
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        xpGained: 0,
        completed: true,
      },
    ];

    const sampleRelationships: Relationship[] = [
      {
        id: "1",
        name: "Eldrin the Wise",
        type: "mentor",
        description: "A powerful wizard who has taken you under their wing",
        trustLevel: 8,
        lastInteraction: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        notes: [
          "Teaches magic",
          "Lives in the tower",
          "Has a cat named Whiskers",
        ],
      },
      {
        id: "2",
        name: "Captain Thorne",
        type: "ally",
        description: "The captain of the city guard, respects your abilities",
        trustLevel: 6,
        lastInteraction: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        notes: [
          "Provides quests",
          "Likes strong ale",
          "Has a scar on his left cheek",
        ],
      },
    ];

    setMilestones(sampleMilestones);
    setRelationships(sampleRelationships);
  }, [character.level]);

  const calculateLevelProgress = () => {
    // Simple XP calculation (in a real app, this would use actual XP values)
    const baseXP = 300;
    const levelXP = character.level * baseXP;
    const currentXP = Math.floor(Math.random() * levelXP); // Mock current XP
    return Math.min(100, (currentXP / levelXP) * 100);
  };

  const getMilestoneIcon = (type: string) => {
    switch (type) {
      case "combat":
        return <Sword className="h-4 w-4" />;
      case "exploration":
        return <MapPin className="h-4 w-4" />;
      case "social":
        return <Users className="h-4 w-4" />;
      case "quest":
        return <BookOpen className="h-4 w-4" />;
      case "level":
        return <Star className="h-4 w-4" />;
      default:
        return <Award className="h-4 w-4" />;
    }
  };

  const getMilestoneColor = (type: string) => {
    switch (type) {
      case "combat":
        return "bg-red-100 text-red-800 border-red-200";
      case "exploration":
        return "bg-green-100 text-green-800 border-green-200";
      case "social":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "quest":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "level":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getRelationshipIcon = (type: string) => {
    switch (type) {
      case "ally":
        return <Heart className="h-4 w-4" />;
      case "enemy":
        return <Sword className="h-4 w-4" />;
      case "neutral":
        return <Shield className="h-4 w-4" />;
      case "mentor":
        return <BookOpen className="h-4 w-4" />;
      case "student":
        return <Zap className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const getTrustLevelColor = (level: number) => {
    if (level >= 7) return "bg-green-100 text-green-800 border-green-200";
    if (level >= 4) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-red-100 text-red-800 border-red-200";
  };

  const addMilestone = (milestone: Omit<Milestone, "id" | "date">) => {
    const newMilestone: Milestone = {
      ...milestone,
      id: crypto.randomUUID(),
      date: new Date(),
    };
    setMilestones((prev) => [newMilestone, ...prev]);
    setShowAddMilestone(false);
  };

  const addRelationship = (
    relationship: Omit<Relationship, "id" | "lastInteraction">,
  ) => {
    const newRelationship: Relationship = {
      ...relationship,
      id: crypto.randomUUID(),
      lastInteraction: new Date(),
    };
    setRelationships((prev) => [newRelationship, ...prev]);
    setShowAddRelationship(false);
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Character Progression
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
          <div className="space-y-4">
            {/* Level Progress */}
            <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-lg font-semibold">
                  Level {character.level}
                </h4>
                <Badge variant="outline" className="bg-white">
                  <Star className="h-3 w-3 mr-1" />
                  {character.class}
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Progress to next level:
                  </span>
                  <span className="text-sm font-medium">
                    {Math.round(calculateLevelProgress())}%
                  </span>
                </div>
                <Progress value={calculateLevelProgress()} className="h-2" />
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>
                    HP: {character.hitPoints.current}/
                    {character.hitPoints.maximum}
                  </span>
                  <span>AC: {character.armorClass}</span>
                  <span>Proficiency: +{character.proficiencyBonus || 2}</span>
                </div>
              </div>
            </div>

            {/* Milestones */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium">Achievement Milestones</h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddMilestone(!showAddMilestone)}
                  className="h-6 px-2 text-xs"
                >
                  {showAddMilestone ? (
                    <Minus className="h-3 w-3" />
                  ) : (
                    <Plus className="h-3 w-3" />
                  )}
                </Button>
              </div>

              {showAddMilestone && (
                <div className="p-3 bg-muted rounded-lg mb-3">
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Milestone title"
                      className="px-2 py-1 text-xs border rounded"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          const target = e.target as HTMLInputElement;
                          addMilestone({
                            type: "quest",
                            title: target.value,
                            description: "New milestone achieved",
                            xpGained: 50,
                            completed: true,
                          });
                        }
                      }}
                    />
                    <select className="px-2 py-1 text-xs border rounded">
                      <option value="combat">Combat</option>
                      <option value="exploration">Exploration</option>
                      <option value="social">Social</option>
                      <option value="quest">Quest</option>
                      <option value="level">Level</option>
                    </select>
                  </div>
                </div>
              )}

              <ScrollArea className="h-32">
                <div className="space-y-2">
                  {milestones.map((milestone) => (
                    <div key={milestone.id} className="p-2 bg-muted rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          {getMilestoneIcon(milestone.type)}
                          <span className="text-sm font-medium">
                            {milestone.title}
                          </span>
                          <Badge
                            variant="outline"
                            className={`text-xs ${getMilestoneColor(milestone.type)}`}
                          >
                            {milestone.type}
                          </Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {milestone.date.toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {milestone.description}
                      </p>
                      {milestone.xpGained > 0 && (
                        <Badge variant="secondary" className="text-xs mt-1">
                          +{milestone.xpGained} XP
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Relationships */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium">NPC Relationships</h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddRelationship(!showAddRelationship)}
                  className="h-6 px-2 text-xs"
                >
                  {showAddRelationship ? (
                    <Minus className="h-3 w-3" />
                  ) : (
                    <Plus className="h-3 w-3" />
                  )}
                </Button>
              </div>

              {showAddRelationship && (
                <div className="p-3 bg-muted rounded-lg mb-3">
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="NPC name"
                      className="px-2 py-1 text-xs border rounded"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          const target = e.target as HTMLInputElement;
                          addRelationship({
                            name: target.value,
                            type: "neutral",
                            description: "New NPC encountered",
                            trustLevel: 3,
                            notes: [],
                          });
                        }
                      }}
                    />
                    <select className="px-2 py-1 text-xs border rounded">
                      <option value="ally">Ally</option>
                      <option value="enemy">Enemy</option>
                      <option value="neutral">Neutral</option>
                      <option value="mentor">Mentor</option>
                      <option value="student">Student</option>
                    </select>
                  </div>
                </div>
              )}

              <ScrollArea className="h-32">
                <div className="space-y-2">
                  {relationships.map((relationship) => (
                    <div
                      key={relationship.id}
                      className="p-2 bg-muted rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          {getRelationshipIcon(relationship.type)}
                          <span className="text-sm font-medium">
                            {relationship.name}
                          </span>
                          <Badge
                            variant="outline"
                            className={`text-xs ${getTrustLevelColor(relationship.trustLevel)}`}
                          >
                            Trust: {relationship.trustLevel}/10
                          </Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {relationship.lastInteraction.toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {relationship.description}
                      </p>
                      {relationship.notes.length > 0 && (
                        <div className="mt-1">
                          <p className="text-xs text-muted-foreground italic">
                            Notes: {relationship.notes[0]}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
