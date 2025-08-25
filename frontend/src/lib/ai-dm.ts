import type { Campaign, Character, Location, ChatMessage } from "./types"

interface GameContext {
  campaign: Campaign
  character: Character
  currentLocation?: Location
  recentMessages: ChatMessage[]
}

interface DiceRollContext {
  dice: string
  result: number
  modifier: number
  action: string
}

export class AIDungeonMaster {
  private static instance: AIDungeonMaster

  static getInstance(): AIDungeonMaster {
    if (!AIDungeonMaster.instance) {
      AIDungeonMaster.instance = new AIDungeonMaster()
    }
    return AIDungeonMaster.instance
  }

  async generateResponse(playerAction: string, context: GameContext): Promise<string> {
    // Mock AI response for now
    return this.getFallbackResponse(playerAction)
  }

  async generateDiceRollResponse(rollContext: DiceRollContext, gameContext: GameContext): Promise<string> {
    // Mock AI response for now
    return this.getFallbackDiceResponse(rollContext)
  }

  async generateLocationDescription(location: Location, context: GameContext): Promise<string> {
    // Mock AI response for now
    return `You arrive at ${location.name}. ${location.description}`
  }

  private buildSystemPrompt(context: GameContext): string {
    return `You are an expert Dungeon Master running a D&D 5e campaign called "${context.campaign.name}" set in ${context.campaign.setting}.

Campaign: ${context.campaign.description}

Player Character: ${context.character.name}, a Level ${context.character.level} ${context.character.race} ${context.character.class}
- Background: ${context.character.background}
- Alignment: ${context.character.alignment}
- Current HP: ${context.character.hitPoints.current}/${context.character.hitPoints.maximum}
- AC: ${context.character.armorClass}
- Backstory: ${context.character.backstory}

${context.currentLocation ? `Current Location: ${context.currentLocation.name} - ${context.currentLocation.description}` : ""}

As a DM, you should:
- Be engaging and descriptive
- Follow D&D 5e rules
- Create interesting challenges and opportunities
- Respond to player actions with consequences
- Keep the story moving forward
- Be creative but consistent with the established world
- Use appropriate difficulty for the character's level

Keep responses concise but vivid (2-4 sentences typically).`
  }

  private buildConversationHistory(messages: ChatMessage[]): string {
    const recentMessages = messages.slice(-6) // Last 6 messages for context
    return recentMessages.map((msg) => `${msg.sender === "dm" ? "DM" : "Player"}: ${msg.content}`).join("\n")
  }

  private getFallbackResponse(playerAction: string): string {
    const fallbacks = [
      "Your action has an interesting effect. The situation develops in an unexpected way...",
      "As you attempt this, you notice something important about your surroundings...",
      "Your character's experience guides them through this challenge...",
      "The outcome of your action reveals new possibilities...",
      "Something catches your attention as you proceed...",
    ]

    return fallbacks[Math.floor(Math.random() * fallbacks.length)]
  }

  private getFallbackDiceResponse(rollContext: DiceRollContext): string {
    const { result } = rollContext

    if (result >= 18) {
      return "Excellent! Your roll succeeds spectacularly. Things go better than expected..."
    } else if (result >= 15) {
      return "Success! Your action achieves what you intended..."
    } else if (result >= 10) {
      return "You manage to succeed, though not without some complications..."
    } else if (result >= 5) {
      return "Your attempt doesn't go as planned, but you learn something valuable..."
    } else {
      return "Things don't go well. The situation becomes more challenging..."
    }
  }
}
