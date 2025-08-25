import type { CommandHandler, CommandResponse, Character, Campaign, Location } from "@/lib/types";

export const UtilityCommands: CommandHandler[] = [
    {
        name: "help",
        description: "Show help information for commands",
        usage: "/help [command]",
        examples: ["/help", "/help dice", "/help character"],
        category: "utility",
        execute: (args: string[], character: Character, campaign: Campaign): CommandResponse => {
            if (args.length === 0) {
                // Show general help
                const content = `📚 **Slash Commands Help**

Welcome to the D&D Adventure Chat! Here are the available command categories:

**🎲 Dice Commands:**
• \`/dice <notation>\` - Roll dice (e.g., /dice 1d20+5)
• \`/roll <notation>\` - Alternative dice rolling
• \`/d20 [modifier]\` - Quick d20 roll
• \`/attack [weapon]\` - Attack roll with bonuses
• \`/initiative\` - Roll initiative

**⚔️ Combat Commands:**
• \`/defend\` - Take defensive stance
• \`/spell <spell>\` - Cast a spell
• \`/item <item>\` - Use an item
• \`/damage <dice>\` - Roll damage
• \`/save <ability> [dc]\` - Saving throw

**👤 Character Commands:**
• \`/character\` - Show character overview
• \`/stats\` - Display ability scores
• \`/inventory\` - Show equipment and spells
• \`/proficiency\` - List skills
• \`/status\` - Current character status

**🔧 Utility Commands:**
• \`/help [command]\` - Show this help or specific command help
• \`/location\` - Show current location info

**Examples:**
• \`/dice 3d6+2\` - Roll 3d6 with +2 modifier
• \`/attack sword\` - Attack with sword
• \`/character\` - Show character info
• \`/help dice\` - Show dice command help

Type \`/help <command>\` for detailed help on a specific command.`;

                return {
                    success: true,
                    content,
                    type: "info"
                };
            } else {
                // Show specific command help
                const commandName = args[0].toLowerCase();
                const content = `📖 **Help: /${commandName}**

This command is not found or help is not available.

Use \`/help\` to see all available commands.`;

                return {
                    success: false,
                    content,
                    type: "error"
                };
            }
        }
    },

    {
        name: "location",
        description: "Show current location information",
        usage: "/location",
        examples: ["/location"],
        category: "utility",
        execute: (args: string[], character: Character, campaign: Campaign): CommandResponse => {
            // This would need to be passed from the parent component
            // For now, we'll show a placeholder
            const content = `🗺️ **Location Information**

**Current Location:** ${character.currentLocation || "Unknown"}
**Campaign:** ${campaign.name}

**Note:** Location details are managed by the Dungeon Master. Ask about your surroundings or explore to discover more about your current location.`;

            return {
                success: true,
                content,
                type: "info",
                metadata: {
                    characterInfo: {
                        currentLocation: character.currentLocation
                    }
                }
            };
        }
    },

    {
        name: "clear",
        description: "Clear the chat (for testing purposes)",
        usage: "/clear",
        examples: ["/clear"],
        category: "utility",
        execute: (args: string[], character: Character, campaign: Campaign): CommandResponse => {
            const content = `🧹 **Chat Cleared**

The chat has been cleared. This is useful for testing or starting fresh.

**Note:** This only clears the current session. Your character progress and campaign state are preserved.`;

            return {
                success: true,
                content,
                type: "info"
            };
        }
    },

    {
        name: "version",
        description: "Show application version information",
        usage: "/version",
        examples: ["/version"],
        category: "utility",
        execute: (args: string[], character: Character, campaign: Campaign): CommandResponse => {
            const content = `ℹ️ **Application Information**

**D&D Adventure Chat** - Slash Commands System
**Version:** 1.0.0
**Features:**
• Slash Commands for all game tools
• Mobile-optimized interface
• Local command processing
• Comprehensive help system

**Character:** ${character.name} (Level ${character.level} ${character.class})
**Campaign:** ${campaign.name}`;

            return {
                success: true,
                content,
                type: "info"
            };
        }
    },

    {
        name: "commands",
        description: "List all available commands",
        usage: "/commands [category]",
        examples: ["/commands", "/commands dice", "/commands character"],
        category: "utility",
        execute: (args: string[], character: Character, campaign: Campaign): CommandResponse => {
            if (args.length === 0) {
                const content = `📋 **All Available Commands**

**🎲 Dice Commands:**
• \`/dice\` - Roll dice with notation
• \`/roll\` - Alternative dice rolling
• \`/d20\` - Quick d20 roll
• \`/attack\` - Attack roll
• \`/initiative\` - Initiative roll

**⚔️ Combat Commands:**
• \`/defend\` - Defensive action
• \`/spell\` - Cast spell
• \`/item\` - Use item
• \`/damage\` - Roll damage
• \`/save\` - Saving throw

**👤 Character Commands:**
• \`/character\` - Character overview
• \`/stats\` - Ability scores
• \`/inventory\` - Equipment & spells
• \`/proficiency\` - Skills
• \`/status\` - Current status

**🔧 Utility Commands:**
• \`/help\` - Show help
• \`/location\` - Location info
• \`/clear\` - Clear chat
• \`/version\` - App version
• \`/commands\` - This list

Use \`/commands <category>\` to see commands in a specific category.`;

                return {
                    success: true,
                    content,
                    type: "info"
                };
            } else {
                const category = args[0].toLowerCase();
                let categoryCommands: string[] = [];
                let categoryTitle = "";

                switch (category) {
                    case "dice":
                        categoryTitle = "🎲 Dice Commands";
                        categoryCommands = [
                            "• `/dice <notation>` - Roll dice (e.g., /dice 1d20+5)",
                            "• `/roll <notation>` - Alternative dice rolling",
                            "• `/d20 [modifier]` - Quick d20 roll",
                            "• `/attack [weapon]` - Attack roll with bonuses",
                            "• `/initiative` - Roll initiative"
                        ];
                        break;
                    case "combat":
                        categoryTitle = "⚔️ Combat Commands";
                        categoryCommands = [
                            "• `/defend` - Take defensive stance",
                            "• `/spell <spell>` - Cast a spell",
                            "• `/item <item>` - Use an item",
                            "• `/damage <dice>` - Roll damage",
                            "• `/save <ability> [dc]` - Saving throw"
                        ];
                        break;
                    case "character":
                        categoryTitle = "👤 Character Commands";
                        categoryCommands = [
                            "• `/character` - Show character overview",
                            "• `/stats` - Display ability scores",
                            "• `/inventory` - Show equipment and spells",
                            "• `/proficiency` - List skills",
                            "• `/status` - Current character status"
                        ];
                        break;
                    case "utility":
                        categoryTitle = "🔧 Utility Commands";
                        categoryCommands = [
                            "• `/help [command]` - Show help",
                            "• `/location` - Show location info",
                            "• `/clear` - Clear chat",
                            "• `/version` - App version",
                            "• `/commands` - List all commands"
                        ];
                        break;
                    default:
                        return {
                            success: false,
                            content: `Unknown category: ${category}\nAvailable categories: dice, combat, character, utility`,
                            type: "error"
                        };
                }

                const content = `${categoryTitle}

${categoryCommands.join('\n')}

Use \`/help <command>\` for detailed help on a specific command.`;

                return {
                    success: true,
                    content,
                    type: "info"
                };
            }
        }
    }
];
