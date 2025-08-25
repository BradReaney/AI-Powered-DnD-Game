export interface Campaign {
  id: string;
  name: string;
  description: string;
  theme: string; // Changed from setting to match backend
  difficulty: string;
  status: 'active' | 'paused' | 'completed' | 'archived'; // Changed from isActive to match backend
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  sessions: Session[];
  // Add missing fields from backend model
  settings?: {
    difficulty: 'easy' | 'medium' | 'hard' | 'deadly';
    maxLevel: number;
    startingLevel: number;
    experienceRate: 'slow' | 'normal' | 'fast';
    magicLevel: 'low' | 'medium' | 'high';
    technologyLevel: 'primitive' | 'medieval' | 'renaissance' | 'modern' | 'futuristic';
  };
  worldState?: {
    currentLocation: string;
    knownLocations: Array<{
      name: string;
      type: 'city' | 'town' | 'village' | 'dungeon' | 'wilderness' | 'other';
      description: string;
      discovered: boolean;
      visited: boolean;
    }>;
    factions: Array<{
      name: string;
      type: 'guild' | 'noble house' | 'religious order' | 'mercenary company' | 'criminal syndicate' | 'other';
      alignment: string;
      influence: number;
      relationship: 'hostile' | 'unfriendly' | 'neutral' | 'friendly' | 'allied';
      description: string;
    }>;
    activeThreats: Array<{
      name: string;
      type: 'monster' | 'organization' | 'natural disaster' | 'political' | 'other';
      threatLevel: 'low' | 'medium' | 'high' | 'critical';
      description: string;
      location: string;
      status: 'active' | 'defeated' | 'resolved';
    }>;
    worldEvents: Array<{
      title: string;
      description: string;
      impact: 'minor' | 'moderate' | 'major' | 'catastrophic';
      resolved: boolean;
      timestamp: Date;
    }>;
  };
  progress?: {
    currentChapter: number;
    totalChapters: number;
    completedQuests: Array<{
      name: string;
      description: string;
      completedAt: Date;
      experienceReward: number;
      itemsRewarded: string[];
    }>;
    activeQuests: Array<{
      name: string;
      description: string;
      objectives: Array<{
        description: string;
        completed: boolean;
      }>;
      difficulty: 'easy' | 'medium' | 'hard' | 'deadly';
      experienceReward: number;
      timeLimit?: Date;
    }>;
    campaignGoals: Array<{
      description: string;
      completed: boolean;
      progress: number;
    }>;
  };
  characters?: Array<{
    characterId: string;
    role: 'player' | 'dm' | 'npc';
    joinedAt: Date;
    isActive: boolean;
  }>;
  storyContext?: {
    campaignSummary: string;
    currentScene: string;
    storyHistory: Array<{
      timestamp: Date;
      event: string;
      characters: string[];
      location: string;
      importance: 'minor' | 'moderate' | 'major' | 'critical';
    }>;
    npcDatabase: Array<{
      name: string;
      role: string;
      description: string;
      personality: string;
      currentLocation: string;
      relationshipToParty: string;
      lastSeen: Date;
    }>;
    worldLore: Array<{
      category: string;
      title: string;
      content: string;
      discoveredBy: string[];
      importance: 'common' | 'uncommon' | 'rare' | 'legendary';
    }>;
  };
  createdBy?: string;
  lastPlayed?: Date;
  totalPlayTime?: number;
}

export interface Session {
  id: string;
  campaignId: string;
  title: string;
  name: string;
  description: string;
  date: Date;
  isCompleted: boolean;
  notes?: string;
  sessionNumber: number;
  isActive: boolean;
  status: string;
  duration: number;
  createdAt: Date;
  updatedAt: Date;
  summary?: string;
}

export interface Character {
  id: string;
  campaignId: string;
  name: string;
  race: string;
  class: string;
  level: number;
  alignment: string;
  background: string;
  hitPoints: {
    current: number;
    maximum: number;
  };
  armorClass: number;
  proficiencyBonus?: number;
  currentLocation?: string;
  stats: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };
  skills: string[];
  equipment: string[];
  spells?: string[];
  backstory?: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Location {
  id: string;
  campaignId: string;
  name: string;
  type: "city" | "dungeon" | "wilderness" | "building" | "other";
  description: string;
  difficulty: string;
  inhabitants?: string[];
  connections?: string[];
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  sender: "player" | "dm";
  content: string;
  timestamp: Date;
  type: "message" | "action" | "roll";
  metadata?: {
    characterId?: string;
    diceRoll?: {
      dice: string;
      result: number;
      modifier: number;
    };
  };
}

export interface GameState {
  gameStarted: boolean;
  currentCampaign: Campaign | null;
  currentCharacter: Character | null;
  currentLocation: Location | null;
  messages: ChatMessage[];
  lastSaved: Date | null;
}

// Command System Types
export interface CommandResult {
  command: string;
  args: string[];
  isValid: boolean;
  error?: string;
}

export interface CommandResponse {
  success: boolean;
  content: string;
  type: "message" | "roll" | "info" | "error";
  metadata?: {
    diceRoll?: {
      dice: string;
      rolls: number[];
      total: number;
      modifier: number;
      finalTotal: number;
    };
    characterInfo?: Partial<Character>;
    combatAction?: {
      type: string;
      name: string;
      result: any;
    };
  };
}

export interface CommandHandler {
  name: string;
  description: string;
  usage: string;
  examples: string[];
  category: "character" | "dice" | "combat" | "utility";
  execute: (args: string[], character: Character, campaign: Campaign) => CommandResponse;
}

export interface CommandHelp {
  name: string;
  description: string;
  usage: string;
  examples: string[];
  category: string;
}
