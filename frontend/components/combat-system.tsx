"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import {
  Sword,
  Shield,
  Heart,
  Zap,
  Target,
  Clock,
  Bot,
  ChevronDown,
  ChevronUp,
  Play,
  Pause,
  RotateCcw,
} from "lucide-react";
import type { Character, Location, Campaign } from "@/lib/types";

interface CombatSystemProps {
  character: Character;
  currentLocation?: Location;
  campaign: Campaign;
  onCombatAction?: (action: CombatAction) => void;
}

interface CombatAction {
  id: string;
  type: "attack" | "defend" | "spell" | "item" | "move";
  name: string;
  description: string;
  damage?: number;
  healing?: number;
  cooldown?: number;
  target?: string;
  timestamp: Date;
}

interface CombatState {
  isActive: boolean;
  round: number;
  turn: number;
  participants: CombatParticipant[];
  currentTurn: string;
  log: CombatAction[];
}

interface CombatParticipant {
  id: string;
  name: string;
  type: "player" | "enemy" | "ally";
  hp: { current: number; maximum: number };
  ac: number;
  initiative: number;
  status: "active" | "unconscious" | "dead";
}

export function CombatSystem({
  character,
  currentLocation,
  campaign,
  onCombatAction,
}: CombatSystemProps) {
  const [combatState, setCombatState] = useState<CombatState>({
    isActive: false,
    round: 1,
    turn: 1,
    participants: [],
    currentTurn: "",
    log: [],
  });

  const [isExpanded, setIsExpanded] = useState(false);
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (combatState.isActive) {
      // Auto-scroll combat log to bottom
      if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
      }
    }
  }, [combatState.log, combatState.isActive]);

  const initializeCombat = () => {
    const mockEnemies = [
      {
        id: "enemy-1",
        name: "Goblin Scout",
        type: "enemy" as const,
        hp: { current: 12, maximum: 12 },
        ac: 14,
        initiative: Math.floor(Math.random() * 20) + 1,
        status: "active" as const,
      },
      {
        id: "enemy-2",
        name: "Orc Warrior",
        type: "enemy" as const,
        hp: { current: 25, maximum: 25 },
        ac: 16,
        initiative: Math.floor(Math.random() * 20) + 1,
        status: "active" as const,
      },
    ];

    const playerParticipant: CombatParticipant = {
      id: character.id,
      name: character.name,
      type: "player",
      hp: character.hitPoints,
      ac: character.armorClass,
      initiative: Math.floor(Math.random() * 20) + 1,
      status: "active",
    };

    const allParticipants = [playerParticipant, ...mockEnemies].sort(
      (a, b) => b.initiative - a.initiative,
    );

    setCombatState({
      isActive: true,
      round: 1,
      turn: 1,
      participants: allParticipants,
      currentTurn: allParticipants[0].id,
      log: [],
    });

    // Generate AI suggestions
    generateAISuggestions(allParticipants, playerParticipant);
  };

  const generateAISuggestions = (
    participants: CombatParticipant[],
    player: CombatParticipant,
  ) => {
    const suggestions: string[] = [];

    // Analyze combat situation
    const enemies = participants.filter(
      (p) => p.type === "enemy" && p.status === "active",
    );
    const lowHealthEnemies = enemies.filter(
      (e) => e.hp.current < e.hp.maximum * 0.5,
    );
    const highThreatEnemies = enemies.filter(
      (e) => e.hp.current > e.hp.maximum * 0.8,
    );

    if (player.hp.current < player.hp.maximum * 0.3) {
      suggestions.push(
        "Consider using healing or defensive actions - you're low on health!",
      );
    }

    if (lowHealthEnemies.length > 0) {
      suggestions.push(
        `Focus on ${lowHealthEnemies[0].name} - they're weakened and easier to defeat`,
      );
    }

    if (highThreatEnemies.length > 0) {
      suggestions.push(
        `Be careful of ${highThreatEnemies[0].name} - they're at full strength`,
      );
    }

    if (enemies.length > 1) {
      suggestions.push(
        "Multiple enemies present - consider area attacks or positioning",
      );
    }

    setAiSuggestions(suggestions);
  };

  const executeAction = (actionType: string, targetId?: string) => {
    if (!combatState.isActive) return;

    const currentParticipant = combatState.participants.find(
      (p) => p.id === combatState.currentTurn,
    );
    if (!currentParticipant) return;

    let action: CombatAction;
    let damage = 0;
    let healing = 0;

    switch (actionType) {
      case "attack":
        damage =
          Math.floor(Math.random() * 8) +
          1 +
          Math.floor(character.stats.strength / 2);
        action = {
          id: crypto.randomUUID(),
          type: "attack",
          name: "Melee Attack",
          description: `${currentParticipant.name} attacks with their weapon`,
          damage,
          target: targetId,
          timestamp: new Date(),
        };
        break;

      case "defend":
        action = {
          id: crypto.randomUUID(),
          type: "defend",
          name: "Defensive Stance",
          description: `${currentParticipant.name} takes a defensive stance`,
          timestamp: new Date(),
        };
        break;

      case "spell":
        damage =
          Math.floor(Math.random() * 12) +
          1 +
          Math.floor(character.stats.intelligence / 2);
        action = {
          id: crypto.randomUUID(),
          type: "spell",
          name: "Magic Missile",
          description: `${currentParticipant.name} casts a spell`,
          damage,
          target: targetId,
          timestamp: new Date(),
        };
        break;

      case "heal":
        healing =
          Math.floor(Math.random() * 8) +
          1 +
          Math.floor(character.stats.wisdom / 2);
        action = {
          id: crypto.randomUUID(),
          type: "item",
          name: "Healing Potion",
          description: `${currentParticipant.name} uses a healing item`,
          healing,
          target: targetId,
          timestamp: new Date(),
        };
        break;

      default:
        return;
    }

    // Add action to combat log
    setCombatState((prev) => ({
      ...prev,
      log: [...prev.log, action],
    }));

    // Apply damage/healing to target
    if (targetId && (damage > 0 || healing > 0)) {
      setCombatState((prev) => ({
        ...prev,
        participants: prev.participants.map((p) => {
          if (p.id === targetId) {
            const newHp = Math.max(
              0,
              Math.min(p.hp.maximum, p.hp.current + healing - damage),
            );
            return {
              ...p,
              hp: { ...p.hp, current: newHp },
              status: newHp <= 0 ? "unconscious" : "active",
            };
          }
          return p;
        }),
      }));
    }

    // Move to next turn
    nextTurn();

    // Call parent callback if provided
    if (onCombatAction) {
      onCombatAction(action);
    }
  };

  const nextTurn = () => {
    setCombatState((prev) => {
      const currentIndex = prev.participants.findIndex(
        (p) => p.id === prev.currentTurn,
      );
      const nextIndex = (currentIndex + 1) % prev.participants.length;
      const nextParticipant = prev.participants[nextIndex];

      // Skip unconscious/dead participants
      let actualNextIndex = nextIndex;
      while (prev.participants[actualNextIndex].status !== "active") {
        actualNextIndex = (actualNextIndex + 1) % prev.participants.length;
        if (actualNextIndex === nextIndex) break; // Prevent infinite loop
      }

      const newTurn = prev.participants[actualNextIndex].id;
      const newRound =
        actualNextIndex < nextIndex ? prev.round + 1 : prev.round;

      return {
        ...prev,
        round: newRound,
        turn: prev.turn + 1,
        currentTurn: newTurn,
      };
    });
  };

  const endCombat = () => {
    setCombatState({
      isActive: false,
      round: 1,
      turn: 1,
      participants: [],
      currentTurn: "",
      log: [],
    });
  };

  const getCurrentParticipant = () => {
    return combatState.participants.find(
      (p) => p.id === combatState.currentTurn,
    );
  };

  const isPlayerTurn = () => {
    return combatState.currentTurn === character.id;
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Sword className="h-5 w-5" />
            Combat System
          </CardTitle>
          <div className="flex items-center gap-2">
            {combatState.isActive && (
              <>
                <Badge variant="outline">Round {combatState.round}</Badge>
                <Badge variant="outline">Turn {combatState.turn}</Badge>
              </>
            )}
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
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0">
          {!combatState.isActive ? (
            <div className="space-y-4">
              <Button onClick={initializeCombat} className="w-full">
                <Play className="h-4 w-4 mr-2" />
                Start Combat
              </Button>
              <p className="text-sm text-muted-foreground text-center">
                Click to begin a combat encounter
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Combat Status */}
              <div className="grid grid-cols-2 gap-4">
                {combatState.participants.map((participant) => (
                  <div
                    key={participant.id}
                    className={`p-3 rounded-lg border ${
                      participant.id === combatState.currentTurn
                        ? "border-primary bg-primary/10"
                        : "border-border"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">
                        {participant.name}
                      </span>
                      <Badge
                        variant={
                          participant.type === "player"
                            ? "default"
                            : "destructive"
                        }
                      >
                        {participant.type}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Heart className="h-3 w-3 text-red-500" />
                        <Progress
                          value={
                            (participant.hp.current / participant.hp.maximum) *
                            100
                          }
                          className="flex-1"
                        />
                        <span className="text-xs w-12 text-right">
                          {participant.hp.current}/{participant.hp.maximum}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Shield className="h-3 w-3 text-blue-500" />
                        <span className="text-xs">AC: {participant.ac}</span>
                      </div>
                    </div>

                    {participant.status !== "active" && (
                      <Badge variant="secondary" className="mt-2">
                        {participant.status}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>

              {/* AI Suggestions */}
              {showAISuggestions && aiSuggestions.length > 0 && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Bot className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">
                        AI Suggestions
                      </span>
                    </div>
                    <div className="space-y-1">
                      {aiSuggestions.map((suggestion, index) => (
                        <p key={index} className="text-xs text-blue-700">
                          {suggestion}
                        </p>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Quick Action Buttons */}
              {isPlayerTurn() && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">
                    Your Turn - Choose an Action:
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={() => executeAction("attack")}
                      className="h-12 text-sm"
                      variant="default"
                    >
                      <Sword className="h-4 w-4 mr-2" />
                      Attack
                    </Button>
                    <Button
                      onClick={() => executeAction("defend")}
                      className="h-12 text-sm"
                      variant="outline"
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      Defend
                    </Button>
                    <Button
                      onClick={() => executeAction("spell")}
                      className="h-12 text-sm"
                      variant="outline"
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      Cast Spell
                    </Button>
                    <Button
                      onClick={() => executeAction("heal")}
                      className="h-12 text-sm"
                      variant="outline"
                    >
                      <Heart className="h-4 w-4 mr-2" />
                      Heal
                    </Button>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => setShowAISuggestions(!showAISuggestions)}
                      variant="ghost"
                      size="sm"
                      className="flex-1"
                    >
                      <Bot className="h-4 w-4 mr-2" />
                      {showAISuggestions ? "Hide" : "Show"} AI Tips
                    </Button>
                    <Button
                      onClick={nextTurn}
                      variant="ghost"
                      size="sm"
                      className="flex-1"
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      Skip Turn
                    </Button>
                  </div>
                </div>
              )}

              {/* Combat Log */}
              <div>
                <h4 className="text-sm font-medium mb-2">Combat Log</h4>
                <ScrollArea
                  className="h-32 border rounded-lg p-2"
                  ref={scrollAreaRef}
                >
                  <div className="space-y-2">
                    {combatState.log.map((action) => (
                      <div
                        key={action.id}
                        className="text-xs p-2 bg-muted rounded"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">{action.name}</span>
                          <span className="text-muted-foreground">
                            {action.timestamp.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <p className="text-muted-foreground">
                          {action.description}
                        </p>
                        {action.damage && (
                          <Badge variant="destructive" className="text-xs">
                            -{action.damage} HP
                          </Badge>
                        )}
                        {action.healing && (
                          <Badge variant="default" className="text-xs">
                            +{action.healing} HP
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              {/* Combat Controls */}
              <div className="flex gap-2">
                <Button
                  onClick={endCombat}
                  variant="destructive"
                  className="flex-1"
                >
                  End Combat
                </Button>
                <Button onClick={nextTurn} variant="outline" className="flex-1">
                  Next Turn
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
