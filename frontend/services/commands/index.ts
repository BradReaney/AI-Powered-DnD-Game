import { CharacterCommands } from './CharacterCommands';
import { DiceCommands } from './DiceCommands';
import { CombatCommands } from './CombatCommands';
import { UtilityCommands } from './UtilityCommands';
import type { CommandHandler } from '@/lib/types';

// Export all command modules
export { CharacterCommands } from './CharacterCommands';
export { DiceCommands } from './DiceCommands';
export { CombatCommands } from './CombatCommands';
export { UtilityCommands } from './UtilityCommands';

// Combine all commands into a single array
export const AllCommands: CommandHandler[] = [
    ...CharacterCommands,
    ...DiceCommands,
    ...CombatCommands,
    ...UtilityCommands
];

// Export command categories for easy access
export const CommandCategories = {
    character: CharacterCommands,
    dice: DiceCommands,
    combat: CombatCommands,
    utility: UtilityCommands
};

// Helper function to get commands by category
export function getCommandsByCategory(category: string): CommandHandler[] {
    return AllCommands.filter(cmd => cmd.category === category);
}

// Helper function to get all command names
export function getAllCommandNames(): string[] {
    return AllCommands.map(cmd => cmd.name);
}

// Helper function to find a specific command
export function findCommand(name: string): CommandHandler | undefined {
    return AllCommands.find(cmd => cmd.name === name.toLowerCase());
}
