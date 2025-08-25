import type { CommandHandler, CommandResponse, CommandHelp, Character, Campaign } from "@/lib/types";

export class CommandRegistry {
    private static instance: CommandRegistry;
    private commands: Map<string, CommandHandler> = new Map();

    private constructor() {
        // Private constructor for singleton pattern
    }

    public static getInstance(): CommandRegistry {
        if (!CommandRegistry.instance) {
            CommandRegistry.instance = new CommandRegistry();
        }
        return CommandRegistry.instance;
    }

    /**
     * Register a new command handler
     * @param command - The command handler to register
     */
    public register(command: CommandHandler): void {
        this.commands.set(command.name.toLowerCase(), command);
    }

    /**
     * Register multiple command handlers at once
     * @param commands - Array of command handlers to register
     */
    public registerMultiple(commands: CommandHandler[]): void {
        commands.forEach(command => this.register(command));
    }

    /**
     * Execute a command
     * @param input - The raw command input (e.g., "/dice 1d20+5")
     * @param character - The current character
     * @param campaign - The current campaign
     * @returns CommandResponse with the result
     */
    public execute(input: string, character: Character, campaign: Campaign): CommandResponse {
        // Remove leading slash and get command name
        const commandName = input.trim().slice(1).split(/\s+/)[0]?.toLowerCase();

        if (!commandName) {
            return {
                success: false,
                content: "No command specified. Use /help to see available commands.",
                type: "error"
            };
        }

        const command = this.commands.get(commandName);

        if (!command) {
            return {
                success: false,
                content: `Unknown command: ${commandName}. Use /help to see available commands.`,
                type: "error"
            };
        }

        try {
            // Get arguments (everything after the command)
            const args = input.trim().slice(1).split(/\s+/).slice(1);

            // Execute the command
            const result = command.execute(args, character, campaign);

            // Ensure the response has the required fields
            return {
                success: result.success !== false,
                content: result.content,
                type: result.type || "message",
                metadata: result.metadata
            };
        } catch (error) {
            console.error(`Error executing command ${commandName}:`, error);
            return {
                success: false,
                content: `Error executing command: ${error instanceof Error ? error.message : 'Unknown error'}`,
                type: "error"
            };
        }
    }

    /**
     * Get all available commands
     * @returns Array of all registered commands
     */
    public getAllCommands(): CommandHandler[] {
        return Array.from(this.commands.values());
    }

    /**
     * Get commands by category
     * @param category - The category to filter by
     * @returns Array of commands in the specified category
     */
    public getCommandsByCategory(category: string): CommandHandler[] {
        return Array.from(this.commands.values()).filter(cmd => cmd.category === category);
    }

    /**
     * Get help information for all commands
     * @returns Array of command help information
     */
    public getHelp(): CommandHelp[] {
        return Array.from(this.commands.values()).map(cmd => ({
            name: cmd.name,
            description: cmd.description,
            usage: cmd.usage,
            examples: cmd.examples,
            category: cmd.category
        }));
    }

    /**
     * Get help for a specific command
     * @param commandName - The name of the command
     * @returns CommandHelp for the specified command, or null if not found
     */
    public getCommandHelp(commandName: string): CommandHelp | null {
        const command = this.commands.get(commandName.toLowerCase());
        if (!command) return null;

        return {
            name: command.name,
            description: command.description,
            usage: command.usage,
            examples: command.examples,
            category: command.category
        };
    }

    /**
     * Check if a command exists
     * @param commandName - The name of the command to check
     * @returns boolean indicating if the command exists
     */
    public hasCommand(commandName: string): boolean {
        return this.commands.has(commandName.toLowerCase());
    }

    /**
     * Get command suggestions for autocomplete
     * @param partialInput - Partial command input
     * @returns Array of matching command names
     */
    public getSuggestions(partialInput: string): string[] {
        if (!partialInput.startsWith("/")) return [];

        const partialCommand = partialInput.slice(1).toLowerCase();
        const suggestions: string[] = [];

        for (const [name, command] of this.commands) {
            if (name.startsWith(partialCommand)) {
                suggestions.push(name);
            }
        }

        return suggestions.sort();
    }

    /**
     * Clear all registered commands (useful for testing)
     */
    public clear(): void {
        this.commands.clear();
    }
}
