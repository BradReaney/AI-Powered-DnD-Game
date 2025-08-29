import { useState, useCallback } from "react";
import { Character, Campaign, Location } from "@/lib/types";
import { apiService } from "@/lib/api";

export interface CommandResponse {
  success: boolean;
  content: string;
  type: "info" | "error" | "warning" | "roll";
  metadata?: any;
}

export function useSlashCommands(character: Character, campaign: Campaign) {
  const [isProcessing, setIsProcessing] = useState(false);

  // Character resolution using name + campaign ID for safety
  const getCharacterId = useCallback(
    async (
      characterName: string,
      campaignId: string,
    ): Promise<string | null> => {
      try {
        // Get all characters for the campaign
        const campaignCharacters =
          await apiService.getCharactersByCampaign(campaignId);

        // Find the character by name
        const character = campaignCharacters.find(
          (c: Character) =>
            c.name.toLowerCase() === characterName.toLowerCase(),
        );

        if (character) {
          return character.id;
        }

        return null;
      } catch (error) {
        console.error("Error resolving character ID:", error);
        return null;
      }
    },
    [apiService],
  );

  // Enhanced command parsing
  const parseCommand = useCallback((input: string) => {
    const trimmed = input.trim();
    if (!trimmed.startsWith("/")) return null;

    const parts = trimmed.split(" ");
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    return { command, args };
  }, []);

  // Character update commands
  const handleCharacterUpdate = useCallback(
    async (args: string[]): Promise<CommandResponse> => {
      if (args.length < 2) {
        return {
          success: false,
          content:
            "Usage: /character [field] [value] or /character [action] [target] [value]",
          type: "error",
        };
      }

      // Get the correct character ID
      const characterId = await getCharacterId(character.name, campaign.id);
      if (!characterId) {
        return {
          success: false,
          content:
            "Error: Could not resolve character. Please refresh the page and try again.",
          type: "error",
        };
      }

      const field = args[0].toLowerCase();
      const value = args.slice(1).join(" ");

      try {
        setIsProcessing(true);
        let updateData: Partial<Character> = {};

        switch (field) {
          case "name":
            updateData.name = value;
            break;
          case "level":
            const level = parseInt(value);
            if (isNaN(level) || level < 1 || level > 20) {
              return {
                success: false,
                content: "Level must be a number between 1 and 20",
                type: "error",
              };
            }
            updateData.level = level;
            break;
          case "race":
            updateData.race = value;
            break;
          case "class":
            updateData.class = value;
            break;
          case "hp":
            if (value === "restore" || value === "max") {
              updateData.hitPoints = {
                current: character.hitPoints.maximum,
                maximum: character.hitPoints.maximum,
              };
            } else if (value.startsWith("+") || value.startsWith("-")) {
              const modifier = parseInt(value);
              if (!isNaN(modifier)) {
                const newCurrent = Math.max(
                  0,
                  Math.min(
                    character.hitPoints.maximum,
                    character.hitPoints.current + modifier,
                  ),
                );
                updateData.hitPoints = {
                  ...character.hitPoints,
                  current: newCurrent,
                };
              }
            } else {
              const newHp = parseInt(value);
              if (!isNaN(newHp) && newHp > 0) {
                updateData.hitPoints = {
                  current: newHp,
                  maximum: Math.max(character.hitPoints.maximum, newHp),
                };
              }
            }
            break;
          case "ac":
            const ac = parseInt(value);
            if (isNaN(ac) || ac < 0) {
              return {
                success: false,
                content: "Armor Class must be a positive number",
                type: "error",
              };
            }
            updateData.armorClass = ac;
            break;
          case "speed":
            const speed = parseInt(value);
            if (isNaN(speed) || speed < 0) {
              return {
                success: false,
                content: "Speed must be a positive number",
                type: "error",
              };
            }
            updateData.speed = speed;
            break;
          case "skill":
            if (args.length < 3) {
              return {
                success: false,
                content: "Usage: /character skill [skillname] [value]",
                type: "error",
              };
            }
            const skillName = args[1];
            const skillValue = args[2];
            // For now, just add to skills array - could be enhanced with proficiency system
            if (skillValue === "remove") {
              updateData.skills = character.skills.filter(
                (s) => s !== skillName,
              );
            } else {
              if (!character.skills.includes(skillName)) {
                updateData.skills = [...character.skills, skillName];
              }
            }
            break;
          case "goal":
          case "fear":
          case "trait":
          case "background":
            // These would need to be added to the Character interface
            // For now, we'll use a generic approach
            updateData[field as keyof Character] = value as any;
            break;
          default:
            return {
              success: false,
              content: `Unknown character field: ${field}. Use /help character for available fields.`,
              type: "error",
            };
        }

        if (Object.keys(updateData).length > 0) {
          try {
            // Call backend directly since the API service is not working correctly
            const backendUrl =
              process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL;
            if (!backendUrl) {
              throw new Error(
                "BACKEND_URL or NEXT_PUBLIC_API_URL environment variable is required",
              );
            }

            const response = await fetch(
              `${backendUrl}/api/characters/${characterId}`,
              {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(updateData),
              },
            );

            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }

            const updatedCharacter = await response.json();
            return {
              success: true,
              content: `Character updated successfully: ${Object.keys(updateData).join(", ")}`,
              type: "info",
              metadata: { characterInfo: updatedCharacter },
            };
          } catch (apiError) {
            console.error("API error during character update:", apiError);
            return {
              success: false,
              content: `Failed to update character: ${apiError instanceof Error ? apiError.message : "Unknown API error"}`,
              type: "error",
            };
          }
        }
      } catch (error) {
        console.error("Error updating character:", error);
        return {
          success: false,
          content: `Failed to update character: ${error instanceof Error ? error.message : "Unknown error"}`,
          type: "error",
        };
      } finally {
        setIsProcessing(false);
      }

      return {
        success: false,
        content: "No valid updates to apply",
        type: "error",
      };
    },
    [character, getCharacterId, campaign.id],
  );

  // Location update commands
  const handleLocationUpdate = useCallback(
    async (args: string[]): Promise<CommandResponse> => {
      if (args.length < 2) {
        return {
          success: false,
          content:
            "Usage: /location [field] [value] or /location [action] [target] [value]",
          type: "error",
        };
      }

      const field = args[0].toLowerCase();
      const value = args.slice(1).join(" ");

      try {
        setIsProcessing(true);
        let updateData: Partial<Location> = {};

        switch (field) {
          case "name":
            updateData.name = value;
            break;
          case "type":
            const validTypes = [
              "settlement",
              "dungeon",
              "wilderness",
              "landmark",
              "shop",
              "tavern",
              "temple",
              "castle",
              "other",
            ];
            if (!validTypes.includes(value)) {
              return {
                success: false,
                content: `Invalid location type. Must be one of: ${validTypes.join(", ")}`,
                type: "error",
              };
            }
            updateData.type = value as any;
            break;
          case "description":
            updateData.description = value;
            break;
          case "importance":
            const validImportance = ["minor", "moderate", "major", "critical"];
            if (!validImportance.includes(value)) {
              return {
                success: false,
                content: `Invalid importance level. Must be one of: ${validImportance.join(", ")}`,
                type: "error",
              };
            }
            updateData.importance = value as any;
            break;
          case "climate":
            updateData.climate = value;
            break;
          case "terrain":
            updateData.terrain = value;
            break;
          case "lighting":
            updateData.lighting = value;
            break;
          case "weather":
            updateData.weather = value;
            break;
          case "explore":
            updateData.isExplored = true;
            break;
          case "mark-safe":
            updateData.isSafe = true;
            break;
          case "add-tag":
            if (args.length < 2) {
              return {
                success: false,
                content: "Usage: /location add-tag [tag]",
                type: "error",
              };
            }
            const tag = args[1];
            // For now, we'll create a new tags array since we don't have current location context
            updateData.tags = [tag];
            break;
          case "add-poi":
            if (args.length < 3) {
              return {
                success: false,
                content: "Usage: /location add-poi [name] [description]",
                type: "error",
              };
            }
            const poiName = args[1];
            const poiDescription = args.slice(2).join(" ");
            const newPoi = {
              name: poiName,
              description: poiDescription,
              type: "landmark",
              isExplored: false,
            };
            // For now, we'll create a new pointsOfInterest array since we don't have current location context
            updateData.pointsOfInterest = [newPoi];
            break;
          default:
            return {
              success: false,
              content: `Unknown location field: ${field}. Use /help location for available fields.`,
              type: "error",
            };
        }

        // For location updates, we need to find the current location first
        // This is a simplified approach - in practice, you'd want to get the current location from context
        if (Object.keys(updateData).length > 0) {
          // For now, we'll return a success message but note that we need location context
          return {
            success: true,
            content: `Location update prepared: ${Object.keys(updateData).join(", ")}. Note: Location context needed for full update.`,
            type: "info",
          };
        }

        return {
          success: false,
          content: "No valid updates to apply",
          type: "error",
        };
      } catch (error) {
        console.error("Error updating location:", error);
        return {
          success: false,
          content: `Failed to update location: ${error instanceof Error ? error.message : "Unknown error"}`,
          type: "error",
        };
      } finally {
        setIsProcessing(false);
      }
    },
    [],
  );

  // Dice rolling command handler
  const handleRollCommand = useCallback((args: string[]): CommandResponse => {
    if (args.length === 0) {
      return {
        success: false,
        content: "Usage: /roll <dice> (e.g., /roll 1d20, /roll 3d6+2)",
        type: "error",
      };
    }

    const diceNotation = args[0];

    try {
      const result = rollDice(diceNotation);
      return {
        success: true,
        content: `🎲 Rolling ${diceNotation}: ${result.total} (${result.rolls.join(", ")})${result.modifier !== 0 ? ` + ${result.modifier}` : ""}`,
        type: "roll",
        metadata: {
          diceRoll: {
            notation: diceNotation,
            result: result.total,
            rolls: result.rolls,
            modifier: result.modifier,
          },
        },
      };
    } catch (error) {
      return {
        success: false,
        content: `Invalid dice notation: ${diceNotation}. Use format like "1d20", "3d6+2", or "1d100"`,
        type: "error",
      };
    }
  }, []);

  // Main command execution
  const executeCommand = useCallback(
    async (input: string): Promise<CommandResponse | null> => {
      const parsed = parseCommand(input);
      if (!parsed) return null;

      const { command, args } = parsed;

      // Handle character update commands
      if (command === "/character") {
        return handleCharacterUpdate(args);
      }

      // Handle location update commands
      if (command === "/location") {
        return handleLocationUpdate(args);
      }

      // Handle existing commands
      switch (command) {
        case "/help":
          return {
            success: true,
            content: `Available commands:
• /help - Show this help message
• /status - Show character status (HP, AC, level)
• /inventory - Show character equipment
• /roll <dice> - Roll dice (e.g., /roll 1d20, /roll 3d6+2)
• /character <field> <value> - Update character (e.g., /character hp 25)
• /location <field> <value> - Update location info

Examples:
• /roll 1d20 - Roll a d20
• /character hp 25 - Set HP to 25
• /location name "Ancient Temple" - Set location name`,
            type: "info",
          };
        case "/roll":
          return handleRollCommand(args);
        case "/status":
          return {
            success: true,
            content: `Character: ${character.name}, Level: ${character.level}, HP: ${character.hitPoints?.current || "N/A"}/${character.hitPoints?.maximum || "N/A"}, AC: ${character.armorClass || "N/A"}`,
            type: "info",
          };
        case "/inventory":
          const equipment = Array.isArray(character.equipment)
            ? character.equipment.join(", ")
            : "None";
          return {
            success: true,
            content: `Equipment: ${equipment}`,
            type: "info",
          };
        default:
          return {
            success: false,
            content: `Unknown command: ${command}. Use /help for available commands.`,
            type: "error",
          };
      }
    },
    [
      character,
      handleCharacterUpdate,
      handleLocationUpdate,
      parseCommand,
      handleRollCommand,
    ],
  );

  // Dice rolling function
  const rollDice = (
    notation: string,
  ): { total: number; rolls: number[]; modifier: number } => {
    // Parse dice notation (e.g., "3d6+2", "1d20", "2d10-1")
    const match = notation.match(/^(\d+)d(\d+)([+-]\d+)?$/);
    if (!match) {
      throw new Error(`Invalid dice notation: ${notation}`);
    }

    const count = parseInt(match[1]);
    const sides = parseInt(match[2]);
    const modifier = match[3] ? parseInt(match[3]) : 0;

    if (count < 1 || count > 100) {
      throw new Error("Dice count must be between 1 and 100");
    }

    if (sides < 1 || sides > 1000) {
      throw new Error("Dice sides must be between 1 and 1000");
    }

    // Roll the dice
    const rolls: number[] = [];
    for (let i = 0; i < count; i++) {
      rolls.push(Math.floor(Math.random() * sides) + 1);
    }

    // Calculate total
    const total = rolls.reduce((sum, roll) => sum + roll, 0) + modifier;

    return { total, rolls, modifier };
  };

  // Check if input is a command
  const isCommand = useCallback((input: string): boolean => {
    return input.trim().startsWith("/");
  }, []);

  // Get command suggestions for autocomplete
  const getSuggestions = useCallback((partialInput: string): string[] => {
    if (!partialInput.startsWith("/")) return [];

    const commands = [
      "/help",
      "/roll",
      "/status",
      "/inventory",
      "/character",
      "/location",
    ];

    return commands.filter((cmd) =>
      cmd.toLowerCase().startsWith(partialInput.toLowerCase()),
    );
  }, []);

  // Get all available commands
  const getAllCommands = useCallback(() => {
    return [
      "/help",
      "/roll",
      "/status",
      "/inventory",
      "/character",
      "/location",
    ];
  }, []);

  // Get commands by category
  const getCommandsByCategory = useCallback((category: string) => {
    switch (category.toLowerCase()) {
      case "character":
        return [
          "/character name",
          "/character level",
          "/character hp",
          "/character ac",
          "/character skill",
        ];
      case "location":
        return [
          "/location name",
          "/location type",
          "/location description",
          "/location explore",
        ];
      case "basic":
        return ["/help", "/roll", "/status", "/inventory"];
      default:
        return [
          "/help",
          "/roll",
          "/status",
          "/inventory",
          "/character",
          "/location",
        ];
    }
  }, []);

  // Get help information
  const getHelp = useCallback(() => {
    return "Available commands: /help, /roll, /status, /inventory, /character, /location. Use /help [command] for specific help.";
  }, []);

  // Get help for a specific command
  const getCommandHelp = useCallback((commandName: string) => {
    const helpMap: Record<string, string> = {
      "/help":
        "Shows this help message. Use /help [command] for specific help.",
      "/roll": "Rolls dice (simplified)",
      "/status": "Shows character status and stats",
      "/inventory": "Shows character equipment",
      "/character":
        "Update character information. Use /help character for field options.",
      "/location":
        "Update location information. Use /help location for field options.",
    };
    return helpMap[commandName] || "Command not found";
  }, []);

  return {
    executeCommand,
    isCommand,
    getSuggestions,
    getAllCommands,
    getCommandsByCategory,
    getHelp,
    getCommandHelp,
    isProcessing,
  };
}
