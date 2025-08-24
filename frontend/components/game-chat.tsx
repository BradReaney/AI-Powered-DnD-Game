"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { ChatMessage, Character, Location, Campaign } from "@/lib/types";
import apiService from "@/lib/api";
import { GameTools } from "./game-tools";
import {
  Send,
  Bot,
  User,
  Dices,
  Sword,
  Shield,
  Heart,
  MapPin,
  ArrowLeft,
} from "lucide-react";

interface GameChatProps {
  campaign: Campaign;
  character: Character;
  currentLocation?: Location;
  onLocationChange?: (location: Location) => void;
  onBack: () => void;
}

interface DiceRollResult {
  dice: string;
  rolls: number[];
  total: number;
  modifier: number;
  finalTotal: number;
}

export function GameChat({
  campaign,
  character,
  currentLocation,
  onLocationChange,
  onBack,
}: GameChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const initializeCampaign = async () => {
      try {
        // Generate a session ID for this game session
        const sessionId = crypto.randomUUID();

        // Call the campaign initialization API
        const initialization = await apiService.initializeCampaign(
          campaign.id,
          sessionId,
          [character.id]
        );

        // Create the welcome message with the AI-generated content
        const welcomeMessage: ChatMessage = {
          id: "1",
          sessionId: sessionId,
          sender: "dm",
          content: initialization.content,
          timestamp: new Date(),
          type: "message",
        };

        setMessages([welcomeMessage]);
        setIsInitializing(false);
      } catch (error) {
        console.error('Failed to initialize campaign:', error);

        // Fallback to basic welcome message if API fails
        const fallbackMessage: ChatMessage = {
          id: "1",
          sessionId: "current",
          sender: "dm",
          content: `Welcome to ${campaign.name}, ${character.name}! You are a Level ${character.level} ${character.race} ${character.class}. ${currentLocation ? `You find yourself in ${currentLocation.name}. ${currentLocation.description}` : "Your adventure begins now..."} What would you like to do?`,
          timestamp: new Date(),
          type: "message",
        };

        setMessages([fallbackMessage]);
        setIsInitializing(false);
      }
    };

    initializeCampaign();
  }, [campaign, character, currentLocation]);

  useEffect(() => {
    // Scroll to bottom when new messages are added
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const addMessage = (
    message: Omit<ChatMessage, "id" | "sessionId" | "timestamp">,
  ) => {
    const newMessage: ChatMessage = {
      ...message,
      id: crypto.randomUUID(),
      sessionId: "current",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
    return newMessage;
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage("");

    // Add user message
    addMessage({
      sender: "player",
      content: userMessage,
      type: "action",
      metadata: {
        characterId: character.id,
      },
    });

    // Get AI response from backend
    setIsLoading(true);
    try {
      const response = await fetch("/api/gameplay/story-response", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          playerAction: userMessage,
          campaignId: campaign.id,
          characterContext: `${character.name} - Level ${character.level} ${character.race} ${character.class}`,
          worldState: currentLocation
            ? `You are currently in ${currentLocation.name}. ${currentLocation.description}`
            : "You are in an unknown location, beginning your adventure.",
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.aiResponse) {
        addMessage({
          sender: "dm",
          content: data.aiResponse,
          type: "message",
        });
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("AI request failed:", error);
      // Fallback to basic response if AI fails
      addMessage({
        sender: "dm",
        content: `I apologize, but I encountered an error while processing your request. Please try again.`,
        type: "message",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex flex-col h-[600px] max-w-4xl mx-auto">
      {/* Back Button */}
      <div className="mb-4">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Game Session
        </Button>
      </div>

      {/* Game Header */}
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">{campaign.name}</CardTitle>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>
                  {character.name} - Level {character.level} {character.race}{" "}
                  {character.class}
                </span>
                {currentLocation && (
                  <Badge
                    variant="outline"
                    className="capitalize flex items-center gap-1"
                  >
                    <MapPin className="h-3 w-3" />
                    {currentLocation.name}
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Heart className="h-4 w-4 text-red-500" />
                <span>
                  {character.hitPoints.current}/{character.hitPoints.maximum}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Shield className="h-4 w-4 text-blue-500" />
                <span>{character.armorClass}</span>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="flex gap-4 flex-1 min-h-0">
        {/* Chat Area */}
        <Card className="flex-1 flex flex-col min-h-0">
          <CardHeader className="pb-3 flex-shrink-0">
            <CardTitle className="text-lg flex items-center gap-2">
              <Bot className="h-5 w-5" />
              Adventure Chat
              {(isLoading || isInitializing) && (
                <Badge variant="secondary" className="text-xs">
                  {isInitializing ? "Initializing Campaign..." : "AI Thinking..."}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-0 min-h-0">
            {/* Messages */}
            <div
              className="flex-1 px-4 overflow-y-auto"
              style={{ height: '400px', maxHeight: '400px' }}
              ref={scrollAreaRef}
            >
              <div className="space-y-4 pb-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.sender === "player" ? "flex-row-reverse" : ""}`}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {message.sender === "dm" ? (
                          <Bot className="h-4 w-4" />
                        ) : (
                          <User className="h-4 w-4" />
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={`flex-1 max-w-[80%] ${message.sender === "player" ? "text-right" : ""}`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">
                          {message.sender === "dm"
                            ? "Dungeon Master"
                            : character.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatTimestamp(message.timestamp)}
                        </span>
                        {message.type === "roll" && (
                          <Badge variant="secondary" className="text-xs">
                            <Dices className="h-3 w-3 mr-1" />
                            Roll
                          </Badge>
                        )}
                        {message.type === "action" && (
                          <Badge variant="outline" className="text-xs">
                            <Sword className="h-3 w-3 mr-1" />
                            Action
                          </Badge>
                        )}
                      </div>
                      <div
                        className={`p-3 rounded-lg ${message.sender === "dm"
                          ? "bg-muted"
                          : message.type === "roll"
                            ? "bg-primary text-primary-foreground"
                            : "bg-primary text-primary-foreground"
                          }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">
                          {message.content}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {(isLoading || isInitializing) && (
                  <div className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">
                          Dungeon Master
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {isInitializing ? "initializing campaign..." : "thinking..."}
                        </span>
                      </div>
                      <div className="p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                          <div
                            className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Input Area */}
            <div className="border-t p-4 flex-shrink-0">
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={isInitializing ? "Initializing campaign..." : "Describe your action..."}
                  disabled={isLoading || isInitializing}
                  className="flex-1"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading || isInitializing}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                Press Enter to send • Describe what your character wants to do
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Game Tools Sidebar */}
        <GameTools
          character={character}
          campaign={campaign}
          currentLocation={currentLocation}
          onCombatAction={(action) => {
            // Add combat action to chat
            addMessage({
              sender: "player",
              content: `[Combat] ${action.name}`,
              type: "action",
              metadata: {
                characterId: character.id,
                combatAction: action,
              },
            });
          }}
          onDiceRoll={(result) => {
            // Add dice roll to chat
            addMessage({
              sender: "player",
              content: `[Dice] Rolled ${result.dice} = ${result.total}${result.modifier ? ` + ${result.modifier} = ${result.finalTotal}` : ""}`,
              type: "roll",
              metadata: {
                characterId: character.id,
                diceRoll: result,
              },
            });
          }}
        />
      </div>
    </div>
  );
}
