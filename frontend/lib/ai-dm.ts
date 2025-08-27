import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import type { Campaign, Character, Location, ChatMessage } from "./types";

interface GameContext {
  campaign: Campaign;
  character: Character;
  currentLocation?: Location;
  recentMessages: ChatMessage[];
}

interface DiceRollContext {
  dice: string;
  result: number;
  modifier: number;
  action: string;
}

export class AIDungeonMaster {
  private static instance: AIDungeonMaster;

  static getInstance(): AIDungeonMaster {
    if (!AIDungeonMaster.instance) {
      AIDungeonMaster.instance = new AIDungeonMaster();
    }
    return AIDungeonMaster.instance;
  }

  async generateResponse(
    playerAction: string,
    context: GameContext,
  ): Promise<string> {
    const systemPrompt = this.buildSystemPrompt(context);
    const conversationHistory = this.buildConversationHistory(
      context.recentMessages,
    );

    try {
      const { text } = await generateText({
        model: openai("gpt-4o"),
        system: systemPrompt,
        prompt: `${conversationHistory}\n\nPlayer Action: ${playerAction}\n\nAs the Dungeon Master, respond to this action:`,
        temperature: 0.8,
      });

      return text;
    } catch (error) {
      console.error("AI DM Error:", error);
      return this.getFallbackResponse(playerAction);
    }
  }

  async generateDiceRollResponse(
    rollContext: DiceRollContext,
    gameContext: GameContext,
  ): Promise<string> {
    const systemPrompt = this.buildSystemPrompt(gameContext);

    try {
      const { text } = await generateText({
        model: openai("gpt-4o"),
        system: systemPrompt,
        prompt: `The player rolled ${rollContext.dice} for "${rollContext.action}" and got ${rollContext.result}${rollContext.modifier !== 0 ? ` (with ${rollContext.modifier > 0 ? "+" : ""}${rollContext.modifier} modifier)` : ""}.

Interpret this roll result and describe what happens. Consider:
- DC 10-15 for moderate tasks, DC 15-20 for hard tasks
- Natural 1s and 20s for dramatic moments
- The character's abilities and the current situation

Respond as a Dungeon Master:`,
        temperature: 0.7,
      });

      return text;
    } catch (error) {
      console.error("AI DM Dice Roll Error:", error);
      return this.getFallbackDiceResponse(rollContext);
    }
  }

  async generateLocationDescription(
    location: Location,
    context: GameContext,
  ): Promise<string> {
    const systemPrompt = this.buildSystemPrompt(context);

    try {
      const { text } = await generateText({
        model: openai("gpt-4o"),
        system: systemPrompt,
        prompt: `The player has arrived at ${location.name}, which is ${location.description}.

This is a ${location.type} in the ${context.campaign.theme} setting. ${location.inhabitants ? `Notable inhabitants include: ${location.inhabitants.join(", ")}.` : ""}

Provide an immersive description of what the character sees, hears, and experiences upon arriving here. Make it atmospheric and engaging:`,
        temperature: 0.8,
      });

      return text;
    } catch (error) {
      console.error("AI Location Description Error:", error);
      return `You arrive at ${location.name}. ${location.description}`;
    }
  }

  private buildSystemPrompt(context: GameContext): string {
    return `You are an expert Dungeon Master running a D&D 5e campaign called "${context.campaign.name}" set in ${context.campaign.theme}.

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

Keep responses concise but vivid (2-4 sentences typically).`;
  }

  private buildConversationHistory(messages: ChatMessage[]): string {
    const recentMessages = messages.slice(-6); // Last 6 messages for context
    return recentMessages
      .map((msg) => `${msg.sender === "dm" ? "DM" : "Player"}: ${msg.content}`)
      .join("\n");
  }

  private getFallbackResponse(playerAction: string): string {
    const fallbacks = [
      "Your action has an interesting effect. The situation develops in an unexpected way...",
      "As you attempt this, you notice something important about your surroundings...",
      "Your character's experience guides them through this challenge...",
      "The outcome of your action reveals new possibilities...",
      "Something catches your attention as you proceed...",
    ];

    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }

  private getFallbackDiceResponse(rollContext: DiceRollContext): string {
    const { result } = rollContext;

    if (result >= 18) {
      return "Excellent! Your roll succeeds spectacularly. Things go better than expected...";
    } else if (result >= 15) {
      return "Success! Your action achieves what you intended...";
    } else if (result >= 10) {
      return "You manage to succeed, though not without some complications...";
    } else if (result >= 5) {
      return "Your attempt doesn't go as planned, but you learn something valuable...";
    } else {
      return "Things don't go well. The situation becomes more challenging...";
    }
  }
}
