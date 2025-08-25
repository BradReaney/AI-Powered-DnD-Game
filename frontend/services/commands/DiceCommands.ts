import type { CommandHandler, CommandResponse, Character, Campaign } from "@/lib/types";

export const DiceCommands: CommandHandler[] = [
    {
        name: "dice",
        description: "Roll dice with standard notation (e.g., 1d20, 3d6+2)",
        usage: "/dice <notation>",
        examples: ["/dice 1d20", "/dice 3d6+2", "/dice 1d100-5"],
        category: "dice",
        execute: (args: string[], character: Character, campaign: Campaign): CommandResponse => {
            if (args.length === 0) {
                return {
                    success: false,
                    content: "Usage: /dice <notation>\nExamples: /dice 1d20, /dice 3d6+2, /dice 1d100-5",
                    type: "error"
                };
            }

            const diceNotation = args[0];
            const result = parseAndRollDice(diceNotation);

            if (!result) {
                return {
                    success: false,
                    content: `Invalid dice notation: ${diceNotation}\nUse format like: 1d20, 3d6+2, 1d100-5`,
                    type: "error"
                };
            }

            const content = `🎲 **Dice Roll: ${diceNotation}**

**Rolls:** ${result.rolls.join(', ')}
**Total:** ${result.total}
**Modifier:** ${result.modifier >= 0 ? '+' : ''}${result.modifier}
**Final Result:** **${result.finalTotal}**`;

            return {
                success: true,
                content,
                type: "roll",
                metadata: {
                    diceRoll: result
                }
            };
        }
    },

    {
        name: "roll",
        description: "Alternative dice rolling command (same as /dice)",
        usage: "/roll <notation>",
        examples: ["/roll 1d20", "/roll 3d6+2"],
        category: "dice",
        execute: (args: string[], character: Character, campaign: Campaign): CommandResponse => {
            if (args.length === 0) {
                return {
                    success: false,
                    content: "Usage: /roll <notation>\nExamples: /roll 1d20, /roll 3d6+2",
                    type: "error"
                };
            }

            const diceNotation = args[0];
            const result = parseAndRollDice(diceNotation);

            if (!result) {
                return {
                    success: false,
                    content: `Invalid dice notation: ${diceNotation}\nUse format like: 1d20, 3d6+2`,
                    type: "error"
                };
            }

            const content = `🎲 **Dice Roll: ${diceNotation}**

**Rolls:** ${result.rolls.join(', ')}
**Total:** ${result.total}
**Modifier:** ${result.modifier >= 0 ? '+' : ''}${result.modifier}
**Final Result:** **${result.finalTotal}**`;

            return {
                success: true,
                content,
                type: "roll",
                metadata: {
                    diceRoll: result
                }
            };
        }
    },

    {
        name: "d20",
        description: "Quick roll of a d20",
        usage: "/d20 [modifier]",
        examples: ["/d20", "/d20 +5", "/d20 -2"],
        category: "dice",
        execute: (args: string[], character: Character, campaign: Campaign): CommandResponse => {
            const modifier = args.length > 0 ? parseInt(args[0]) || 0 : 0;
            const roll = Math.floor(Math.random() * 20) + 1;
            const finalTotal = roll + modifier;

            const content = `🎲 **D20 Roll**

**Roll:** ${roll}
**Modifier:** ${modifier >= 0 ? '+' : ''}${modifier}
**Final Result:** **${finalTotal}**`;

            return {
                success: true,
                content,
                type: "roll",
                metadata: {
                    diceRoll: {
                        dice: "1d20",
                        rolls: [roll],
                        total: roll,
                        modifier,
                        finalTotal
                    }
                }
            };
        }
    },

    {
        name: "attack",
        description: "Roll attack with character's attack bonus",
        usage: "/attack [weapon]",
        examples: ["/attack", "/attack sword", "/attack bow"],
        category: "dice",
        execute: (args: string[], character: Character, campaign: Campaign): CommandResponse => {
            const weapon = args[0] || "weapon";
            const d20Roll = Math.floor(Math.random() * 20) + 1;

            // Calculate attack bonus based on character stats
            const strengthMod = Math.floor((character.stats?.strength || 10 - 10) / 2);
            const dexterityMod = Math.floor((character.stats?.dexterity || 10 - 10) / 2);
            const proficiencyBonus = character.proficiencyBonus || 2;

            // Assume melee weapon for now (strength-based)
            const attackBonus = strengthMod + proficiencyBonus;
            const totalRoll = d20Roll + attackBonus;

            const content = `⚔️ **Attack Roll: ${weapon}**

**D20 Roll:** ${d20Roll}
**Attack Bonus:** +${attackBonus} (Str: ${strengthMod >= 0 ? '+' : ''}${strengthMod}, Prof: +${proficiencyBonus})
**Total Attack Roll:** **${totalRoll}**

**Critical Hit:** ${d20Roll === 20 ? 'YES! 🎉' : 'No'}
**Critical Miss:** ${d20Roll === 1 ? 'YES! 😵' : 'No'}`;

            return {
                success: true,
                content,
                type: "roll",
                metadata: {
                    diceRoll: {
                        dice: "1d20",
                        rolls: [d20Roll],
                        total: d20Roll,
                        modifier: attackBonus,
                        finalTotal: totalRoll
                    },
                    combatAction: {
                        type: "attack",
                        name: weapon,
                        result: { attackRoll: totalRoll, isCritical: d20Roll === 20, isCriticalMiss: d20Roll === 1 }
                    }
                }
            };
        }
    },

    {
        name: "initiative",
        description: "Roll initiative for combat",
        usage: "/initiative",
        examples: ["/initiative"],
        category: "dice",
        execute: (args: string[], character: Character, campaign: Campaign): CommandResponse => {
            const d20Roll = Math.floor(Math.random() * 20) + 1;
            const dexterityMod = Math.floor((character.stats?.dexterity || 10 - 10) / 2);
            const totalInitiative = d20Roll + dexterityMod;

            const content = `⚡ **Initiative Roll**

**D20 Roll:** ${d20Roll}
**Dexterity Modifier:** ${dexterityMod >= 0 ? '+' : ''}${dexterityMod}
**Total Initiative:** **${totalInitiative}**`;

            return {
                success: true,
                content,
                type: "roll",
                metadata: {
                    diceRoll: {
                        dice: "1d20",
                        rolls: [d20Roll],
                        total: d20Roll,
                        modifier: dexterityMod,
                        finalTotal: totalInitiative
                    }
                }
            };
        }
    }
];

/**
 * Parse dice notation and roll the dice
 * Supports formats like: 1d20, 3d6+2, 1d100-5
 */
function parseAndRollDice(notation: string): {
    dice: string;
    rolls: number[];
    total: number;
    modifier: number;
    finalTotal: number;
} | null {
    // Match patterns like: 1d20, 3d6+2, 1d100-5
    const match = notation.match(/^(\d+)?d(\d+)([+-]\d+)?$/i);
    if (!match) return null;

    const count = parseInt(match[1] || "1");
    const sides = parseInt(match[2]);
    const modifier = match[3] ? parseInt(match[3]) : 0;

    // Validate dice parameters
    if (count < 1 || count > 100 || sides < 2 || sides > 100) return null;

    // Roll the dice
    const rolls: number[] = [];
    for (let i = 0; i < count; i++) {
        rolls.push(Math.floor(Math.random() * sides) + 1);
    }

    const total = rolls.reduce((sum, roll) => sum + roll, 0);
    const finalTotal = total + modifier;

    return {
        dice: notation,
        rolls,
        total,
        modifier,
        finalTotal
    };
}
