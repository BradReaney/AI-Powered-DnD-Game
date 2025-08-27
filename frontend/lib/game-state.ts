import type {
  Campaign,
  Character,
  Location,
  ChatMessage,
  Session,
} from "./types";

export interface GameState {
  currentCampaign: Campaign | null;
  currentCharacter: Character | null;
  currentLocation: Location | null;
  currentSession: Session | null;
  chatHistory: ChatMessage[];
  gameStarted: boolean;
  lastSaved: Date | null;
}

export class GameStateManager {
  private static instance: GameStateManager;
  private state: GameState;
  private listeners: ((state: GameState) => void)[] = [];

  private constructor() {
    this.state = {
      currentCampaign: null,
      currentCharacter: null,
      currentLocation: null,
      currentSession: null,
      chatHistory: [],
      gameStarted: false,
      lastSaved: null,
    };

    // Load saved state from localStorage
    this.loadState();
  }

  static getInstance(): GameStateManager {
    if (!GameStateManager.instance) {
      GameStateManager.instance = new GameStateManager();
    }
    return GameStateManager.instance;
  }

  getState(): GameState {
    return { ...this.state };
  }

  subscribe(listener: (state: GameState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => listener(this.getState()));
    this.saveState();
  }

  startGame(campaign: Campaign, character: Character, location?: Location) {
    this.state = {
      ...this.state,
      currentCampaign: campaign,
      currentCharacter: character,
      currentLocation: location || null,
      currentSession: {
        id: crypto.randomUUID(),
        campaignId: campaign.id,
        name: `Session ${new Date().toLocaleDateString()}`,
        title: `Session ${new Date().toLocaleDateString()}`,
        description: `Playing as ${character.name}`,
        date: new Date(),
        isCompleted: false,
        sessionNumber: 1,
        isActive: true,
        status: "active",
        duration: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      gameStarted: true,
      chatHistory: [],
    };

    this.notify();
  }

  endGame() {
    this.state = {
      ...this.state,
      gameStarted: false,
      currentSession: null,
    };

    this.notify();
  }

  addMessage(message: Omit<ChatMessage, "id" | "sessionId" | "timestamp">) {
    const newMessage: ChatMessage = {
      ...message,
      id: crypto.randomUUID(),
      sessionId: this.state.currentSession?.id || "unknown",
      timestamp: new Date(),
    };

    this.state = {
      ...this.state,
      chatHistory: [...this.state.chatHistory, newMessage],
    };

    this.notify();
    return newMessage;
  }

  updateCharacter(character: Character) {
    this.state = {
      ...this.state,
      currentCharacter: character,
    };

    this.notify();
  }

  changeLocation(location: Location) {
    this.state = {
      ...this.state,
      currentLocation: location,
    };

    this.notify();
  }

  getRecentMessages(count = 10): ChatMessage[] {
    return this.state.chatHistory.slice(-count);
  }

  private saveState() {
    try {
      const stateToSave = {
        ...this.state,
        lastSaved: new Date(),
      };
      localStorage.setItem("dnd-game-state", JSON.stringify(stateToSave));
    } catch (error) {
      console.error("Failed to save game state:", error);
    }
  }

  private loadState() {
    try {
      const saved = localStorage.getItem("dnd-game-state");
      if (saved) {
        const parsedState = JSON.parse(saved);
        // Convert date strings back to Date objects
        if (parsedState.lastSaved) {
          parsedState.lastSaved = new Date(parsedState.lastSaved);
        }
        if (parsedState.chatHistory) {
          parsedState.chatHistory = parsedState.chatHistory.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          }));
        }

        this.state = { ...this.state, ...parsedState };
      }
    } catch (error) {
      console.error("Failed to load game state:", error);
    }
  }

  clearSavedState() {
    localStorage.removeItem("dnd-game-state");
    this.state = {
      currentCampaign: null,
      currentCharacter: null,
      currentLocation: null,
      currentSession: null,
      chatHistory: [],
      gameStarted: false,
      lastSaved: null,
    };
    this.notify();
  }
}
