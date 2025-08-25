import { useCallback, useMemo } from 'react';
import { CommandRegistry } from '@/services/CommandRegistry';
import { AllCommands } from '@/services/commands';
import type { Character, Campaign, CommandResponse } from '@/lib/types';

export function useSlashCommands(character: Character, campaign: Campaign) {
    // Initialize command registry with all commands
    const commandRegistry = useMemo(() => {
        const registry = CommandRegistry.getInstance();

        // Clear existing commands and register all new ones
        registry.clear();
        registry.registerMultiple(AllCommands);

        return registry;
    }, []);

    // Execute a slash command
    const executeCommand = useCallback((input: string): CommandResponse | null => {
        if (!input.trim().startsWith('/')) {
            return null;
        }

        try {
            return commandRegistry.execute(input, character, campaign);
        } catch (error) {
            console.error('Error executing command:', error);
            return {
                success: false,
                content: `Error executing command: ${error instanceof Error ? error.message : 'Unknown error'}`,
                type: "error"
            };
        }
    }, [commandRegistry, character, campaign]);

    // Check if input is a command
    const isCommand = useCallback((input: string): boolean => {
        return input.trim().startsWith('/');
    }, []);

    // Get command suggestions for autocomplete
    const getSuggestions = useCallback((partialInput: string): string[] => {
        if (!partialInput.startsWith('/')) return [];

        return commandRegistry.getSuggestions(partialInput);
    }, [commandRegistry]);

    // Get all available commands
    const getAllCommands = useCallback(() => {
        return commandRegistry.getAllCommands();
    }, [commandRegistry]);

    // Get commands by category
    const getCommandsByCategory = useCallback((category: string) => {
        return commandRegistry.getCommandsByCategory(category);
    }, [commandRegistry]);

    // Get help information
    const getHelp = useCallback(() => {
        return commandRegistry.getHelp();
    }, [commandRegistry]);

    // Get help for a specific command
    const getCommandHelp = useCallback((commandName: string) => {
        return commandRegistry.getCommandHelp(commandName);
    }, [commandRegistry]);

    return {
        executeCommand,
        isCommand,
        getSuggestions,
        getAllCommands,
        getCommandsByCategory,
        getHelp,
        getCommandHelp
    };
}
