import type { CommandHandler, CommandResponse, Character, Campaign } from "@/lib/types";

export const CombatCommands: CommandHandler[] = [
    {
        name: "defend",
        description: "Take defensive action in combat",
        usage: "/defend",
        examples: ["/defend"],
        category: "combat",
        execute: (args: string[], character: Character, campaign: Campaign): CommandResponse => {
            const content = `🛡️ **Defensive Action**

**${character.name}** takes a defensive stance.

**Effect:** +2 to Armor Class until next turn
**Current AC:** ${character.armorClass} → **${character.armorClass + 2}**
**Duration:** Until next turn`;

            return {
                success: true,
                content,
                type: "action",
                metadata: {
                    combatAction: {
                        type: "defend",
                        name: "Defend",
                        result: { acBonus: 2, newAC: character.armorClass + 2 }
                    }
                }
            };
        }
    },

    {
        name: "spell",
        description: "Cast a spell (rolls spell attack or saving throw)",
        usage: "/spell <spell_name> [target]",
        examples: ["/spell fireball", "/spell magic missile goblin", "/spell cure wounds self"],
        category: "combat",
        execute: (args: string[], character: Character, campaign: Campaign): CommandResponse => {
            if (args.length === 0) {
                return {
                    success: false,
                    content: "Usage: /spell <spell_name> [target]\nExamples: /spell fireball, /spell magic missile goblin",
                    type: "error"
                };
            }

            const spellName = args[0];
            const target = args[1] || "target";

            // Roll spell attack (assuming spell attack bonus)
            const d20Roll = Math.floor(Math.random() * 20) + 1;
            const intelligenceMod = Math.floor((character.stats?.intelligence || 10 - 10) / 2);
            const wisdomMod = Math.floor((character.stats?.wisdom || 10 - 10) / 2);
            const charismaMod = Math.floor((character.stats?.charisma || 10 - 10) / 2);
            const proficiencyBonus = character.proficiencyBonus || 2;

            // Use highest mental stat for spellcasting
            const spellcastingMod = Math.max(intelligenceMod, wisdomMod, charismaMod);
            const spellAttackBonus = spellcastingMod + proficiencyBonus;
            const totalSpellAttack = d20Roll + spellAttackBonus;

            const content = `✨ **Spell Cast: ${spellName}**

**Target:** ${target}
**Spell Attack Roll:** ${d20Roll} + ${spellAttackBonus} = **${totalSpellAttack}**
**Spellcasting Modifier:** ${spellcastingMod >= 0 ? '+' : ''}${spellcastingMod} (Int: ${intelligenceMod >= 0 ? '+' : ''}${intelligenceMod}, Wis: ${wisdomMod >= 0 ? '+' : ''}${wisdomMod}, Cha: ${charismaMod >= 0 ? '+' : ''}${charismaMod})
**Proficiency Bonus:** +${proficiencyBonus}

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
                        modifier: spellAttackBonus,
                        finalTotal: totalSpellAttack
                    },
                    combatAction: {
                        type: "spell",
                        name: spellName,
                        result: {
                            spellAttack: totalSpellAttack,
                            isCritical: d20Roll === 20,
                            isCriticalMiss: d20Roll === 1,
                            target: target
                        }
                    }
                }
            };
        }
    },

    {
        name: "item",
        description: "Use an item or consumable",
        usage: "/item <item_name> [target]",
        examples: ["/item potion self", "/item scroll of fireball", "/item rope"],
        category: "combat",
        execute: (args: string[], character: Character, campaign: Campaign): CommandResponse => {
            if (args.length === 0) {
                return {
                    success: false,
                    content: "Usage: /item <item_name> [target]\nExamples: /item potion self, /item scroll of fireball",
                    type: "error"
                };
            }

            const itemName = args[0];
            const target = args[1] || "self";

            const content = `🎒 **Item Use: ${itemName}**

**Target:** ${target}
**Action:** Using ${itemName}

**Note:** This is a narrative action. The DM will determine the specific effects of using this item.`;

            return {
                success: true,
                content,
                type: "action",
                metadata: {
                    combatAction: {
                        type: "item",
                        name: itemName,
                        result: { itemUsed: itemName, target: target }
                    }
                }
            };
        }
    },

    {
        name: "damage",
        description: "Roll damage for a weapon or spell",
        usage: "/damage <dice_notation> [weapon/spell]",
        examples: ["/damage 1d8 sword", "/damage 8d6 fireball", "/damage 1d6+3 dagger"],
        category: "combat",
        execute: (args: string[], character: Character, campaign: Campaign): CommandResponse => {
            if (args.length === 0) {
                return {
                    success: false,
                    content: "Usage: /damage <dice_notation> [weapon/spell]\nExamples: /damage 1d8 sword, /damage 8d6 fireball",
                    type: "error"
                };
            }

            const diceNotation = args[0];
            const weaponSpell = args[1] || "attack";

            // Parse and roll damage dice
            const damageResult = parseAndRollDice(diceNotation);

            if (!damageResult) {
                return {
                    success: false,
                    content: `Invalid dice notation: ${diceNotation}\nUse format like: 1d8, 8d6, 1d6+3`,
                    type: "error"
                };
            }

            const content = `💥 **Damage Roll: ${weaponSpell}**

**Dice:** ${diceNotation}
**Rolls:** ${damageResult.rolls.join(', ')}
**Base Damage:** ${damageResult.total}
**Modifier:** ${damageResult.modifier >= 0 ? '+' : ''}${damageResult.modifier}
**Total Damage:** **${damageResult.finalTotal}**`;

            return {
                success: true,
                content,
                type: "roll",
                metadata: {
                    diceRoll: damageResult,
                    combatAction: {
                        type: "damage",
                        name: weaponSpell,
                        result: { damage: damageResult.finalTotal, weaponSpell: weaponSpell }
                    }
                }
            };
        }
    },

    {
        name: "save",
        description: "Roll a saving throw",
        usage: "/save <ability> [dc]",
        examples: ["/save strength", "/save dex 15", "/save wisdom 18"],
        category: "combat",
        execute: (args: string[], character: Character, campaign: Campaign): CommandResponse => {
            if (args.length === 0) {
                return {
                    success: false,
                    content: "Usage: /save <ability> [dc]\nExamples: /save strength, /save dex 15, /save wisdom 18",
                    type: "error"
                };
            }

            const ability = args[0].toLowerCase();
            const dc = args[1] ? parseInt(args[1]) : null;

            // Get ability score and modifier
            const abilityScore = character.stats?.[ability as keyof typeof character.stats] || 10;
            const abilityMod = Math.floor((abilityScore - 10) / 2);
            const proficiencyBonus = character.proficiencyBonus || 2;

            // Roll the save
            const d20Roll = Math.floor(Math.random() * 20) + 1;
            const totalSave = d20Roll + abilityMod;

            // Determine success if DC is provided
            let resultText = "";
            if (dc !== null) {
                const isSuccess = totalSave >= dc;
                const isCriticalSuccess = d20Roll === 20;
                const isCriticalFailure = d20Roll === 1;

                resultText = `\n**DC ${dc}:** ${isSuccess ? 'SUCCESS! ✅' : 'FAILURE ❌'}`;
                if (isCriticalSuccess) resultText += ' (Critical Success! 🎉)';
                if (isCriticalFailure) resultText += ' (Critical Failure! 😵)';
            }

            const content = `🔄 **Saving Throw: ${ability.charAt(0).toUpperCase() + ability.slice(1)}**

**D20 Roll:** ${d20Roll}
**${ability.charAt(0).toUpperCase() + ability.slice(1)} Modifier:** ${abilityMod >= 0 ? '+' : ''}${abilityMod}
**Total Save:** **${totalSave}**${resultText}`;

            return {
                success: true,
                content,
                type: "roll",
                metadata: {
                    diceRoll: {
                        dice: "1d20",
                        rolls: [d20Roll],
                        total: d20Roll,
                        modifier: abilityMod,
                        finalTotal: totalSave
                    },
                    combatAction: {
                        type: "save",
                        name: ability,
                        result: {
                            saveType: ability,
                            total: totalSave,
                            dc: dc,
                            success: dc ? totalSave >= dc : null
                        }
                    }
                }
            };
        }
    }
];

/**
 * Parse dice notation and roll the dice (same as in DiceCommands)
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
