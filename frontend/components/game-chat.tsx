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
import { useSlashCommands } from "@/hooks/useSlashCommands";
// CommandAutocomplete component removed - functionality integrated elsewhere
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
  Command,
} from "lucide-react";

interface GameChatProps {
  campaign: Campaign;
  character: Character;
  currentLocation?: Location;
  onLocationChange?: (location: Location) => void;
  onBack: () => void;
  existingSessionId?: string; // For resuming existing sessions
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
  existingSessionId,
}: GameChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize slash commands
  const {
    executeCommand,
    isCommand,
    getSuggestions
  } = useSlashCommands(character, campaign);

  // Get command suggestions for autocomplete
  const suggestions = getSuggestions(inputMessage);

  useEffect(() => {
    const initializeCampaign = async () => {
      try {
        if (existingSessionId) {
          // Resume existing session - load messages from database
          await loadExistingSession(existingSessionId);
        } else {
          // Start new session - generate new session ID
          const sessionId = crypto.randomUUID();
          await startNewSession(sessionId);
        }
      } catch (error) {
        console.error('Failed to initialize campaign:', error);

        // Don't use generic fallback - let the specific error handlers deal with it
        // This prevents the wrong message from being displayed
        setIsInitializing(false);

        // Show user-friendly error message
        console.error('Campaign initialization failed. Please refresh the page or contact support.');
      }
    };

    initializeCampaign();
  }, [campaign, character, currentLocation, existingSessionId]);

  const startNewSession = async (sessionId: string) => {
    try {
      // First, create the session automatically
      await apiService.createAutomaticSession(
        campaign.id,
        character.id,
        sessionId
      );

      // Then call the campaign initialization API
      const initialization = await apiService.initializeCampaign(
        campaign.id,
        sessionId,
        [character.id]
      );

      // Wait for backend operations to complete
      // This prevents race conditions where the frontend might try to
      // access the session before it's fully initialized
      await new Promise(resolve => setTimeout(resolve, 200)); // Increased delay to ensure backend completion

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

      // Instead of a generic fallback, retry the initialization
      // This handles temporary backend issues
      try {
        console.log('Retrying campaign initialization...');
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry

        const retryInitialization = await apiService.initializeCampaign(
          campaign.id,
          sessionId,
          [character.id]
        );

        const welcomeMessage: ChatMessage = {
          id: "1",
          sessionId: sessionId,
          sender: "dm",
          content: retryInitialization.content,
          timestamp: new Date(),
          type: "message",
        };

        setMessages([welcomeMessage]);
        setIsInitializing(false);
      } catch (retryError) {
        console.error('Retry failed, using minimal fallback:', retryError);

        // Only use minimal fallback if retry also fails
        const minimalFallback: ChatMessage = {
          id: "1",
          sessionId: sessionId,
          sender: "dm",
          content: `Welcome to ${campaign.name}, ${character.name}! The campaign is initializing...`,
          timestamp: new Date(),
          type: "message",
        };

        setMessages([minimalFallback]);
        setIsInitializing(false);

        // Show user-friendly error message
        console.error('Campaign initialization failed after retry. Please refresh the page or contact support.');
      }
    }
  };

  const loadExistingSession = async (sessionId: string) => {
    try {
      // Load existing messages from the database
      const response = await fetch(`/api/sessions/${sessionId}/messages`);
      if (!response.ok) {
        throw new Error('Failed to load session messages');
      }

      const data = await response.json();
      const existingMessages = data.messages || [];

      if (existingMessages.length > 0) {
        // Transform backend messages to frontend format
        const transformedMessages = existingMessages.map(msg => {
          // Transform backend message structure to frontend ChatMessage format
          let transformedSender: "player" | "dm";
          let transformedType: "message" | "action" | "roll";

          // Map backend sender to frontend sender
          if (msg.type === 'ai') {
            transformedSender = "dm";
          } else if (msg.type === 'player') {
            transformedSender = "player";
          } else {
            // For system, combat, skill-check messages, treat as DM messages
            transformedSender = "dm";
          }

          // Map backend type to frontend type
          if (msg.type === 'player') {
            transformedType = "action";
          } else if (msg.type === 'ai') {
            transformedType = "message";
          } else {
            // For other types, default to message
            transformedType = "message";
          }

          return {
            id: msg._id || msg.id || crypto.randomUUID(),
            sessionId: msg.sessionId,
            sender: transformedSender,
            content: msg.content,
            timestamp: new Date(msg.timestamp),
            type: transformedType,
            metadata: {
              characterId: msg.characterId || character.id,
              ...msg.metadata
            }
          };
        });

        setMessages(transformedMessages);
      } else {
        // No existing messages, create a welcome back message
        const welcomeBackMessage: ChatMessage = {
          id: "1",
          sessionId: sessionId,
          sender: "dm",
          content: `Welcome back to ${campaign.name}, ${character.name}! Your adventure continues...`,
          timestamp: new Date(),
          type: "message",
        };
        setMessages([welcomeBackMessage]);
      }

      setIsInitializing(false);
    } catch (error) {
      throw error;
    }
  };

  useEffect(() => {
    // Scroll to bottom when new messages are added
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const addMessage = (
    message: Omit<ChatMessage, "id" | "sessionId" | "timestamp">,
  ) => {
    // Get the session ID from the first message (which contains the real session ID)
    const sessionId = messages.length > 0 ? messages[0].sessionId : "current";

    const newMessage: ChatMessage = {
      ...message,
      id: crypto.randomUUID(),
      sessionId: sessionId,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
    return newMessage;
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage("");
    setShowAutocomplete(false);

    // Check if this is a slash command
    if (isCommand(userMessage)) {
      const commandResponse = executeCommand(userMessage);

      if (commandResponse) {
        // Add user command message
        addMessage({
          sender: "player",
          content: userMessage,
          type: "action",
          metadata: {
            characterId: character.id,
          },
        });

        // Add command response message
        addMessage({
          sender: "dm",
          content: commandResponse.content,
          type: commandResponse.type === "roll" ? "roll" : "message",
          metadata: {
            characterId: "system",
            diceRoll: commandResponse.metadata?.diceRoll,
          },
        });
      }
      return;
    }

    // Add user message
    addMessage({
      sender: "player",
      content: userMessage,
      type: "action",
      metadata: {
        characterId: character.id,
      },
    });

    // Update session activity
    try {
      const sessionId = messages.length > 0 ? messages[0].sessionId : null;
      if (sessionId) {
        await apiService.updateSessionActivity(sessionId);
      }
    } catch (error) {
      console.warn('Failed to update session activity:', error);
      // Don't block the message flow if activity update fails
    }

    // Get AI response from backend
    setIsLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        throw new Error('API URL not configured');
      }

      // Get the session ID from the first message (which contains the session ID)
      const sessionId = messages.length > 0 ? messages[0].sessionId : null;

      const response = await fetch(`${apiUrl}/api/gameplay/story-response`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          playerAction: userMessage,
          campaignId: campaign.id,
          sessionId: sessionId,
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputMessage(value);

    // Show autocomplete for slash commands
    if (value.startsWith('/') && value.length > 1) {
      setShowAutocomplete(true);
    } else {
      setShowAutocomplete(false);
    }
  };

  const handleSelectSuggestion = (suggestion: string) => {
    if (suggestion) {
      setInputMessage(`/${suggestion} `);
    }
    setShowAutocomplete(false);
    inputRef.current?.focus();
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
    <div className="flex flex-col h-[600px] md:h-[600px] max-w-4xl mx-auto">
      {/* Back Button - No gap to title */}
      <div className="mb-0">
        <Button variant="outline" size="sm" onClick={onBack} className="h-7 md:h-8 px-2 md:px-3">
          <ArrowLeft className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
          <span className="text-xs md:text-sm">Back to Game Session</span>
        </Button>
      </div>

      {/* Game Header - Ultra Compact on Mobile */}
      <Card className="mb-0">
        <CardHeader className="py-0 px-2 md:px-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-1 md:gap-0">
            <div className="space-y-0.5">
              <CardTitle className="text-sm md:text-lg leading-tight">{campaign.name}</CardTitle>
              <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2 text-xs md:text-sm text-muted-foreground">
                <span className="font-medium text-xs md:text-sm">
                  {character.name} - Level {character.level} {character.race}{" "}
                  {character.class}
                </span>
                {currentLocation && (
                  <Badge
                    variant="outline"
                    className="capitalize flex items-center gap-1 w-fit text-xs"
                  >
                    <MapPin className="h-2 w-2 md:h-3 md:w-3" />
                    {currentLocation.name}
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-3 text-xs">
              <div className="flex items-center gap-1">
                <Heart className="h-2 w-2 md:h-3 md:w-3 text-red-500" />
                <span className="text-xs">
                  {character.hitPoints.current}/{character.hitPoints.maximum}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Shield className="h-2 w-2 md:h-3 md:w-3 text-blue-500" />
                <span className="text-xs">{character.armorClass}</span>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Chat Area - Now Full Width */}
      <Card className="flex-1 flex flex-col min-h-0">
        <CardHeader className="py-0 flex-shrink-0 px-2 md:px-6">
          <CardTitle className="text-sm md:text-lg flex items-center gap-2">
            <Bot className="h-3 w-3 md:h-5 md:w-5" />
            Adventure Chat
            {(isLoading || isInitializing) && (
              <Badge variant="secondary" className="text-xs">
                {isInitializing ? "Initializing..." : "AI Thinking..."}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-0 min-h-0">
          {/* Messages */}
          <div
            className="flex-1 px-3 md:px-4 overflow-y-auto"
            style={{ height: '500px', maxHeight: '500px' }}
            ref={scrollAreaRef}
          >
            <div className="space-y-2 md:space-y-4 pb-2">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-2 md:gap-3 ${message.sender === "player" ? "flex-row-reverse" : ""}`}
                >
                  <Avatar className="h-6 w-6 md:h-8 md:w-8">
                    <AvatarFallback>
                      {message.sender === "dm" ? (
                        <Bot className="h-3 w-3 md:h-4 md:w-4" />
                      ) : (
                        <User className="h-3 w-3 md:h-4 md:w-4" />
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={`flex-1 max-w-[80%] ${message.sender === "player" ? "text-right" : ""}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs md:text-sm font-medium">
                        {message.sender === "dm"
                          ? "Dungeon Master"
                          : character.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatTimestamp(message.timestamp)}
                      </span>
                      {message.type === "roll" && (
                        <Badge variant="secondary" className="text-xs">
                          <Dices className="h-2 w-2 md:h-3 md:w-3 mr-1" />
                          Roll
                        </Badge>
                      )}
                      {message.type === "action" && (
                        <Badge variant="outline" className="text-xs">
                          <Sword className="h-2 w-2 md:h-3 md:w-3 mr-1" />
                          Action
                        </Badge>
                      )}
                    </div>
                    <div
                      className={`p-2 md:p-3 rounded-lg ${message.sender === "dm"
                        ? "bg-muted"
                        : message.type === "roll"
                          ? "bg-primary text-primary-foreground"
                          : "bg-primary text-primary-foreground"
                        }`}
                    >
                      <p className="text-xs md:text-sm whitespace-pre-wrap">
                        {message.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {(isLoading || isInitializing) && (
                <div className="flex gap-2 md:gap-3">
                  <Avatar className="h-6 w-6 md:h-8 md:w-8">
                    <AvatarFallback>
                      <Bot className="h-3 w-3 md:h-4 md:w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs md:text-sm font-medium">
                        Dungeon Master
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {isInitializing ? "initializing campaign..." : "thinking..."}
                      </span>
                    </div>
                    <div className="p-2 md:p-3 bg-muted rounded-lg">
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

          {/* Input Area with Command Autocomplete */}
          <div className="border-t p-1 md:p-4 flex-shrink-0 relative pb-0">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  ref={inputRef}
                  value={inputMessage}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  placeholder={isInitializing ? "Initializing campaign..." : "Describe your action or use /help for commands..."}
                  disabled={isLoading || isInitializing}
                  className="flex-1 text-sm md:text-base"
                />
                {inputMessage.startsWith('/') && (
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                    <Command className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                  </div>
                )}

                {/* Command Autocomplete - simplified implementation */}
                {showAutocomplete && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-background border rounded-md shadow-lg z-10 max-h-48 overflow-y-auto">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSelectSuggestion(suggestion)}
                        className="w-full text-left px-3 py-2 hover:bg-muted text-sm"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading || isInitializing}
                size="sm"
                className="h-8 md:h-10 px-2 md:px-3"
              >
                <Send className="h-3 w-3 md:h-4 md:w-4" />
              </Button>
            </div>

          </div>
        </CardContent>
      </Card>
    </div>
  );
}
