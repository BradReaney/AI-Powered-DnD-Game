"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DiceRoller } from "./dice-roller"
import type { ChatMessage, Character, Location, Campaign } from "@/lib/types"
import { Send, Bot, User, Dices, Sword, Shield, Heart, MapPin } from "lucide-react"

interface GameChatProps {
  campaign: Campaign
  character: Character
  currentLocation?: Location
  onLocationChange?: (location: Location) => void
}

interface DiceRollResult {
  dice: string
  rolls: number[]
  total: number
  modifier: number
  finalTotal: number
}

export function GameChat({ campaign, character, currentLocation, onLocationChange }: GameChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const welcomeMessage: ChatMessage = {
      id: "1",
      sessionId: "current",
      sender: "dm",
      content: `Welcome to ${campaign.name}, ${character.name}! You are a Level ${character.level} ${character.race} ${character.class}. ${currentLocation ? `You find yourself in ${currentLocation.name}. ${currentLocation.description}` : "Your adventure begins now..."} What would you like to do?`,
      timestamp: new Date(),
      type: "message",
    }

    setMessages([welcomeMessage])
  }, [campaign, character, currentLocation])

  useEffect(() => {
    // Scroll to bottom when new messages are added
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const addMessage = (message: Omit<ChatMessage, "id" | "sessionId" | "timestamp">) => {
    const newMessage: ChatMessage = {
      ...message,
      id: crypto.randomUUID(),
      sessionId: "current",
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, newMessage])
    return newMessage
  }

  const handleDiceRoll = async (result: DiceRollResult) => {
    addMessage({
      sender: "player",
      content: `Rolled ${result.dice}${result.modifier !== 0 ? ` ${result.modifier > 0 ? "+" : ""}${result.modifier}` : ""}: ${result.finalTotal}`,
      type: "roll",
      metadata: {
        diceRoll: {
          dice: result.dice,
          result: result.finalTotal,
          modifier: result.modifier,
        },
        characterId: character.id,
      },
    })

    setIsLoading(true)
    setTimeout(() => {
      const mockResponses = [
        "The dice clatter across the table... Your action succeeds!",
        "An interesting result! The situation develops in an unexpected way.",
        "Your roll determines the outcome. Something significant happens.",
        "The fates smile upon you! Your action has the desired effect.",
        "The dice have spoken. The story continues in a new direction.",
      ]
      const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)]

      addMessage({
        sender: "dm",
        content: randomResponse,
        type: "message",
      })
      setIsLoading(false)
    }, 1500)
  }

  const generateMockResponse = async (playerAction: string) => {
    setIsLoading(true)

    setTimeout(() => {
      const mockResponses = [
        `${character.name} takes action. The world around you shifts and changes in response to your decision.`,
        "Your bold move catches everyone's attention. The adventure takes an interesting turn.",
        "As you act, the story unfolds in unexpected ways. New possibilities emerge.",
        "The consequences of your action ripple through the world. What happens next?",
        "Your character's decision shapes the narrative. The tale continues to evolve.",
      ]
      const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)]

      addMessage({
        sender: "dm",
        content: randomResponse,
        type: "message",
      })
      setIsLoading(false)
    }, 2000)
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage = inputMessage.trim()
    setInputMessage("")

    // Add user message
    addMessage({
      sender: "player",
      content: userMessage,
      type: "action",
      metadata: {
        characterId: character.id,
      },
    })

    // Generate mock response
    await generateMockResponse(userMessage)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div className="flex flex-col h-[600px] max-w-4xl mx-auto">
      {/* Game Header */}
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">{campaign.name}</CardTitle>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>
                  {character.name} - Level {character.level} {character.race} {character.class}
                </span>
                {currentLocation && (
                  <Badge variant="outline" className="capitalize flex items-center gap-1">
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

      <div className="flex gap-4 flex-1">
        {/* Chat Area */}
        <Card className="flex-1 flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Bot className="h-5 w-5" />
              Adventure Chat
              {isLoading && (
                <Badge variant="secondary" className="text-xs">
                  AI Thinking...
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-0">
            {/* Messages */}
            <ScrollArea className="flex-1 px-4" ref={scrollAreaRef}>
              <div className="space-y-4 pb-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.sender === "player" ? "flex-row-reverse" : ""}`}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {message.sender === "dm" ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`flex-1 max-w-[80%] ${message.sender === "player" ? "text-right" : ""}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">
                          {message.sender === "dm" ? "Dungeon Master" : character.name}
                        </span>
                        <span className="text-xs text-muted-foreground">{formatTimestamp(message.timestamp)}</span>
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
                        className={`p-3 rounded-lg ${
                          message.sender === "dm"
                            ? "bg-muted"
                            : message.type === "roll"
                              ? "bg-primary text-primary-foreground"
                              : "bg-primary text-primary-foreground"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">Dungeon Master</span>
                        <span className="text-xs text-muted-foreground">thinking...</span>
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
            </ScrollArea>

            {/* Input Area */}
            <div className="border-t p-4">
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Describe your action..."
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button onClick={handleSendMessage} disabled={!inputMessage.trim() || isLoading}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                Press Enter to send • Describe what your character wants to do
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dice Roller Sidebar */}
        <DiceRoller onRoll={handleDiceRoll} className="w-80" />
      </div>
    </div>
  )
}
