import type { CommandHandler, CommandResponse, Character, Campaign } from "@/lib/types";

export const CharacterCommands: CommandHandler[] = [
    {
        name: "character",
        description: "Display character overview and basic information",
        usage: "/character",
        examples: ["/character"],
        category: "character",
        execute: (args: string[], character: Character, campaign: Campaign): CommandResponse => {
            const content = `**${character.name}** - Level ${character.level} ${character.race} ${character.class}

**Background:** ${character.background}
**Alignment:** ${character.alignment}
**Current Location:** ${character.currentLocation || "Unknown"}

**Hit Points:** ${character.hitPoints.current}/${character.hitPoints.maximum}
**Armor Class:** ${character.armorClass}
**Proficiency Bonus:** +${character.proficiencyBonus || 2}`;

            return {
                success: true,
                content,
                type: "info",
                metadata: {
                    characterInfo: character
                }
            };
        }
    },

    {
        name: "stats",
        description: "Display character ability scores and modifiers",
        usage: "/stats",
        examples: ["/stats"],
        category: "character",
        execute: (args: string[], character: Character, campaign: Campaign): CommandResponse => {
            const statsContent = Object.entries(character.stats || {})
                .map(([stat, value]) => {
                    const modifier = Math.floor((value - 10) / 2);
                    const modifierStr = modifier >= 0 ? `+${modifier}` : `${modifier}`;
                    return `**${stat.charAt(0).toUpperCase() + stat.slice(1)}:** ${value} (${modifierStr})`;
                })
                .join('\n');

            const content = `**${character.name}'s Ability Scores:**

${statsContent}

**Proficiency Bonus:** +${character.proficiencyBonus || 2}`;

            return {
                success: true,
                content,
                type: "info",
                metadata: {
                    characterInfo: { stats: character.stats, proficiencyBonus: character.proficiencyBonus }
                }
            };
        }
    },

    {
        name: "inventory",
        description: "Display character equipment and items",
        usage: "/inventory",
        examples: ["/inventory"],
        category: "character",
        execute: (args: string[], character: Character, campaign: Campaign): CommandResponse => {
            const equipmentList = character.equipment && character.equipment.length > 0
                ? character.equipment.map(item => `• ${item}`).join('\n')
                : "No equipment listed";

            const spellsList = character.spells && character.spells.length > 0
                ? character.spells.map(spell => `• ${spell}`).join('\n')
                : "No spells known";

            const content = `**${character.name}'s Inventory:**

**Equipment:**
${equipmentList}

**Spells:**
${spellsList}`;

            return {
                success: true,
                content,
                type: "info",
                metadata: {
                    characterInfo: { equipment: character.equipment, spells: character.spells }
                }
            };
        }
    },

    {
        name: "proficiency",
        description: "Display character skills and proficiencies",
        usage: "/proficiency",
        examples: ["/proficiency"],
        category: "character",
        execute: (args: string[], character: Character, campaign: Campaign): CommandResponse => {
            const skillsList = character.skills && character.skills.length > 0
                ? character.skills.map(skill => `• ${skill}`).join('\n')
                : "No skills listed";

            const content = `**${character.name}'s Skills & Proficiencies:**

**Skills:**
${skillsList}

**Proficiency Bonus:** +${character.proficiencyBonus || 2}`;

            return {
                success: true,
                content,
                type: "info",
                metadata: {
                    characterInfo: { skills: character.skills, proficiencyBonus: character.proficiencyBonus }
                }
            };
        }
    },

    {
        name: "status",
        description: "Display current character status and health",
        usage: "/status",
        examples: ["/status"],
        category: "character",
        execute: (args: string[], character: Character, campaign: Campaign): CommandResponse => {
            const hpPercentage = Math.round((character.hitPoints.current / character.hitPoints.maximum) * 100);
            const hpStatus = hpPercentage > 75 ? "Healthy" : hpPercentage > 50 ? "Wounded" : hpPercentage > 25 ? "Injured" : "Critical";

            const content = `**${character.name}'s Current Status:**

**Health:** ${character.hitPoints.current}/${character.hitPoints.maximum} (${hpPercentage}% - ${hpStatus})
**Armor Class:** ${character.armorClass}
**Level:** ${character.level} ${character.class}
**Location:** ${character.currentLocation || "Unknown"}

**Campaign:** ${campaign.name}`;

            return {
                success: true,
                content,
                type: "info",
                metadata: {
                    characterInfo: {
                        hitPoints: character.hitPoints,
                        armorClass: character.armorClass,
                        level: character.level,
                        class: character.class,
                        currentLocation: character.currentLocation
                    }
                }
            };
        }
    }
];
