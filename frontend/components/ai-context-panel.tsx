"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  ChevronUp,
  Brain,
  Users,
  MapPin,
  BookOpen,
  Clock,
} from "lucide-react";
import type { ChatMessage, Character, Location, Campaign } from "@/lib/types";

interface AIContextPanelProps {
  messages: ChatMessage[];
  character: Character;
  currentLocation?: Location;
  campaign: Campaign;
}

interface StoryElement {
  id: string;
  type: "npc" | "location" | "event" | "item" | "quest";
  name: string;
  description: string;
  importance: "high" | "medium" | "low";
  lastMentioned: Date;
  context: string;
}

export function AIContextPanel({
  messages,
  character,
  currentLocation,
  campaign,
}: AIContextPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [storyElements, setStoryElements] = useState<StoryElement[]>([]);
  const [recentEvents, setRecentEvents] = useState<string[]>([]);

  useEffect(() => {
    // Extract story elements from recent messages
    const extractStoryElements = () => {
      const elements: StoryElement[] = [];
      const recentMessages = messages.slice(-20); // Last 20 messages

      // Extract NPCs mentioned
      const npcMentions = new Map<
        string,
        { count: number; lastMention: Date; context: string }
      >();

      recentMessages.forEach((message) => {
        if (message.sender === "dm") {
          // Simple NPC extraction (in a real app, this would use NLP)
          const npcPatterns = [
            /(?:meet|encounter|see|talk to|speak with) ([A-Z][a-z]+)/g,
            /([A-Z][a-z]+) (?:says|tells|asks|offers|gives)/g,
            /(?:the|a) ([A-Z][a-z]+) (?:merchant|guard|wizard|knight|villager)/g,
          ];

          npcPatterns.forEach((pattern) => {
            const matches = message.content.matchAll(pattern);
            for (const match of matches) {
              const npcName = match[1];
              if (npcName && npcName.length > 2 && !npcName.includes(" ")) {
                const existing = npcMentions.get(npcName);
                npcMentions.set(npcName, {
                  count: (existing?.count || 0) + 1,
                  lastMention: message.timestamp,
                  context: message.content.substring(
                    Math.max(0, message.content.indexOf(npcName) - 50),
                    Math.min(
                      message.content.length,
                      message.content.indexOf(npcName) + 100,
                    ),
                  ),
                });
              }
            }
          });
        }
      });

      // Convert NPC mentions to story elements
      npcMentions.forEach((data, name) => {
        if (data.count >= 2) {
          // Only include NPCs mentioned multiple times
          elements.push({
            id: `npc-${name}`,
            type: "npc",
            name,
            description: `NPC mentioned ${data.count} times`,
            importance: data.count >= 3 ? "high" : "medium",
            lastMentioned: data.lastMention,
            context: data.context,
          });
        }
      });

      // Add current location as story element
      if (currentLocation) {
        elements.push({
          id: `location-${currentLocation.id}`,
          type: "location",
          name: currentLocation.name,
          description: currentLocation.description,
          importance: "high",
          lastMentioned: new Date(),
          context: `Currently located in ${currentLocation.name}`,
        });
      }

      // Add character's recent actions
      const characterActions = recentMessages
        .filter((m) => m.sender === "player" && m.type === "action")
        .slice(-5)
        .map((m) => m.content);

      if (characterActions.length > 0) {
        elements.push({
          id: "character-actions",
          type: "event",
          name: "Recent Actions",
          description: `Last ${characterActions.length} actions taken`,
          importance: "medium",
          lastMentioned: new Date(),
          context: characterActions.join("; "),
        });
      }

      return elements.sort(
        (a, b) => b.lastMentioned.getTime() - a.lastMentioned.getTime(),
      );
    };

    setStoryElements(extractStoryElements());

    // Extract recent events
    const events = messages
      .filter((m) => m.sender === "dm")
      .slice(-5)
      .map((m) => m.content.substring(0, 100) + "...");

    setRecentEvents(events);
  }, [messages, currentLocation]);

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "npc":
        return <Users className="h-3 w-3" />;
      case "location":
        return <MapPin className="h-3 w-3" />;
      case "event":
        return <BookOpen className="h-3 w-3" />;
      case "item":
        return <BookOpen className="h-3 w-3" />;
      case "quest":
        return <BookOpen className="h-3 w-3" />;
      default:
        return <BookOpen className="h-3 w-3" />;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Memory Context
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
            {/* Story Elements */}
            <div>
              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Story Elements
              </h4>
              <ScrollArea className="h-32">
                <div className="space-y-2">
                  {storyElements.length > 0 ? (
                    storyElements.map((element) => (
                      <div key={element.id} className="p-2 bg-muted rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            {getTypeIcon(element.type)}
                            <span className="text-sm font-medium">
                              {element.name}
                            </span>
                            <Badge
                              variant="outline"
                              className={`text-xs ${getImportanceColor(element.importance)}`}
                            >
                              {element.importance}
                            </Badge>
                          </div>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {element.lastMentioned.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {element.description}
                        </p>
                        <p className="text-xs mt-1 italic">
                          &ldquo;{element.context}&rdquo;
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground italic">
                      No story elements yet...
                    </p>
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Recent Events */}
            <div>
              <h4 className="text-sm font-medium mb-2">Recent Events</h4>
              <ScrollArea className="h-24">
                <div className="space-y-2">
                  {recentEvents.length > 0 ? (
                    recentEvents.map((event, index) => (
                      <div key={index} className="p-2 bg-muted rounded-lg">
                        <p className="text-xs text-muted-foreground">{event}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground italic">
                      No recent events...
                    </p>
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Character Context */}
            <div>
              <h4 className="text-sm font-medium mb-2">Character Context</h4>
              <div className="p-2 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground">
                  <strong>{character.name}</strong> is a Level {character.level}{" "}
                  {character.race} {character.class}
                  currently in {currentLocation?.name || "an unknown location"}.
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  HP: {character.hitPoints.current}/
                  {character.hitPoints.maximum} | AC: {character.armorClass}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
