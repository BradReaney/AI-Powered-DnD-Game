import type { CommandResult } from "@/lib/types";

export class CommandParserService {
    /**
     * Parse a slash command input string
     * @param input - The user input (e.g., "/dice 1d20+5")
     * @returns CommandResult with parsed command and arguments
     */
    static parse(input: string): CommandResult {
        // Remove leading slash and trim whitespace
        const trimmedInput = input.trim();

        if (!trimmedInput.startsWith("/")) {
            return {
                command: "",
                args: [],
                isValid: false,
                error: "Input must start with '/' to be a command"
            };
        }

        // Split the input into command and arguments
        const parts = trimmedInput.slice(1).trim().split(/\s+/);

        if (parts.length === 0 || parts[0] === "") {
            return {
                command: "",
                args: [],
                isValid: false,
                error: "No command specified"
            };
        }

        const command = parts[0].toLowerCase();
        const args = parts.slice(1);

        return {
            command,
            args,
            isValid: true
        };
    }

    /**
     * Check if input is a valid command
     * @param input - The user input
     * @returns boolean indicating if input is a command
     */
    static isCommand(input: string): boolean {
        return input.trim().startsWith("/");
    }

    /**
     * Extract the command name from input
     * @param input - The user input
     * @returns The command name without the slash
     */
    static getCommandName(input: string): string {
        const trimmedInput = input.trim();
        if (!trimmedInput.startsWith("/")) return "";

        const parts = trimmedInput.slice(1).trim().split(/\s+/);
        return parts[0]?.toLowerCase() || "";
    }

    /**
     * Get command arguments from input
     * @param input - The user input
     * @returns Array of command arguments
     */
    static getCommandArgs(input: string): string[] {
        const trimmedInput = input.trim();
        if (!trimmedInput.startsWith("/")) return [];

        const parts = trimmedInput.slice(1).trim().split(/\s+/);
        return parts.slice(1);
    }
}
