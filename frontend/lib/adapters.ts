import type { Campaign, Character, Location, Session } from "./types";

// Backend Campaign interface (simplified based on what we've seen)
interface BackendCampaign {
  _id: string;
  name: string;
  theme: string;
  description: string;
  status: "active" | "paused" | "completed" | "archived";
  settings?: {
    difficulty: string;
    maxLevel?: number;
    startingLevel?: number;
  };
  worldState?: {
    currentLocation?: string;
    knownLocations?: Array<{
      name: string;
      type: string;
      description: string;
    }>;
  };
  sessions?: Array<{
    sessionId: string;
    sessionNumber: number;
    date: Date;
    duration: number;
    summary?: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

// Backend Character interface (simplified)
interface BackendCharacter {
  _id: string;
  name: string;
  race: string;
  class: string;
  level: number;
  attributes: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };
  hitPoints: {
    current: number;
    maximum: number;
    temporary?: number;
  };
  armorClass: number;
  personality: {
    background: string;
    alignment: string;
    traits?: string[];
    ideals?: string[];
    bonds?: string[];
    flaws?: string[];
  };
  skills: {
    [key: string]: {
      proficient: boolean;
      expertise?: boolean;
      modifier?: number;
    };
  };
  equipment?: {
    weapons?: Array<{ name: string }>;
    armor?: { name: string } | null;
    items?: Array<{ name: string }>;
  };
  campaignId: string;
  sessionId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Backend Location interface (simplified)
interface BackendLocation {
  _id: string;
  name: string;
  type: string;
  description: string;
  difficulty?: string;
  inhabitants?: string[];
  connections?: string[];
  campaignId: string;
  sessionId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Backend Session interface (simplified)
interface BackendSession {
  _id: string;
  campaignId: string;
  title?: string;
  name: string;
  description?: string;
  date: Date;
  isCompleted?: boolean;
  sessionNumber: number;
  isActive?: boolean;
  status?: string;
  duration: number;
  summary?: string;
  createdAt: Date;
  updatedAt: Date;
}

export function adaptCampaign(backendCampaign: any): Campaign {
  const result: Campaign = {
    id: backendCampaign._id,
    name: backendCampaign.name,
    description: backendCampaign.description || "",
    theme: backendCampaign.theme || "fantasy",
    difficulty: backendCampaign.difficulty || "medium",
    status: backendCampaign.status || "active",
    createdAt: new Date(backendCampaign.createdAt),
    updatedAt: new Date(backendCampaign.updatedAt),
    sessions:
      backendCampaign.sessions?.map((session: any) => ({
        id: session.sessionId,
        campaignId: backendCampaign._id?.toString() || backendCampaign._id,
        title: session.title || `Session ${session.sessionNumber}`,
        name: session.name || `Session ${session.sessionNumber}`,
        description: session.description || `Session ${session.sessionNumber}`,
        date: new Date(session.date),
        isCompleted: session.isCompleted || false,
        sessionNumber: session.sessionNumber,
        isActive: session.isActive || false,
        status: session.status || "In Progress",
        duration: session.duration,
        summary: session.summary,
        createdAt: new Date(session.createdAt || session.date),
        updatedAt: new Date(session.updatedAt || session.date),
      })) || [],
    // Add the additional fields from backend model
    settings: backendCampaign.settings,
    worldState: backendCampaign.worldState,
    progress: backendCampaign.progress,
    characters: backendCampaign.characters,
    storyContext: backendCampaign.storyContext,
    createdBy: backendCampaign.createdBy,
    lastPlayed: backendCampaign.lastPlayed,
    totalPlayTime: backendCampaign.totalPlayTime,
  };

  return result;
}

export function adaptCharacter(backendCharacter: any): Character {
  // Deep clean the character object to remove any problematic properties
  const deepCleanObject = (obj: any): any => {
    if (obj === null || obj === undefined) return obj;
    if (typeof obj !== "object") return obj;
    if (Array.isArray(obj)) return obj.map(deepCleanObject);

    const cleaned: any = {};
    for (const [key, value] of Object.entries(obj)) {
      // Skip Mongoose internal properties and problematic keys
      if (
        key.startsWith("_") ||
        key === "__v" ||
        key === "arrivedAt" ||
        key === "toJSON" ||
        key === "toObject"
      ) {
        continue;
      }
      cleaned[key] = deepCleanObject(value);
    }
    return cleaned;
  };

  // Clean the entire backend character object first
  const cleanedBackendCharacter = deepCleanObject(backendCharacter);

  // Create the character object with safe defaults
  const cleanedCharacter: Character = {
    id:
      cleanedBackendCharacter._id?.toString() ||
      cleanedBackendCharacter.id ||
      "",
    campaignId:
      cleanedBackendCharacter.campaignId?.toString() ||
      cleanedBackendCharacter.campaignId ||
      "",
    name: cleanedBackendCharacter.name || "Unknown",
    race: cleanedBackendCharacter.race || "Unknown",
    class: cleanedBackendCharacter.class || "Unknown",
    level: cleanedBackendCharacter.level || 1,
    alignment: cleanedBackendCharacter.personality?.alignment || "Neutral",
    background: cleanedBackendCharacter.personality?.background || "Adventurer",
    hitPoints: {
      current: cleanedBackendCharacter.hitPoints?.current || 0,
      maximum: cleanedBackendCharacter.hitPoints?.maximum || 0,
    },
    armorClass: cleanedBackendCharacter.armorClass || 10,
    proficiencyBonus:
      Math.floor((cleanedBackendCharacter.level || 1 - 1) / 4) + 2,
    stats: {
      strength:
        cleanedBackendCharacter.attributes?.strength ||
        cleanedBackendCharacter.stats?.strength ||
        10,
      dexterity:
        cleanedBackendCharacter.attributes?.dexterity ||
        cleanedBackendCharacter.stats?.dexterity ||
        10,
      constitution:
        cleanedBackendCharacter.attributes?.constitution ||
        cleanedBackendCharacter.stats?.constitution ||
        10,
      intelligence:
        cleanedBackendCharacter.attributes?.intelligence ||
        cleanedBackendCharacter.stats?.intelligence ||
        10,
      wisdom:
        cleanedBackendCharacter.attributes?.wisdom ||
        cleanedBackendCharacter.stats?.wisdom ||
        10,
      charisma:
        cleanedBackendCharacter.attributes?.charisma ||
        cleanedBackendCharacter.stats?.charisma ||
        10,
    },
    skills: extractSkills(cleanedBackendCharacter.skills),
    equipment: extractEquipment(cleanedBackendCharacter.equipment),
    backstory: cleanedBackendCharacter.personality?.backstory || "",
    currentLocation:
      typeof cleanedBackendCharacter.currentLocation === "string"
        ? cleanedBackendCharacter.currentLocation
        : cleanedBackendCharacter.currentLocation?.name || "",
    createdAt: new Date(cleanedBackendCharacter.createdAt || new Date()),
    updatedAt: new Date(cleanedBackendCharacter.updatedAt || new Date()),
  };

  return cleanedCharacter;
}

// Helper function to safely extract skills array
function extractSkills(skills: any): string[] {
  if (Array.isArray(skills)) {
    return skills;
  }
  if (skills && typeof skills === "object") {
    // Handle Map format from backend
    return Object.keys(skills).filter(
      (skill) => skills[skill]?.proficient === true,
    );
  }
  return [];
}

// Helper function to safely extract equipment array
function extractEquipment(equipment: any): string[] {
  if (Array.isArray(equipment)) {
    return equipment;
  }
  if (equipment && typeof equipment === "object") {
    // Handle backend equipment format
    const result: string[] = [];
    if (equipment.weapons && Array.isArray(equipment.weapons)) {
      result.push(
        ...equipment.weapons.map((w: any) => w.name || w).filter(Boolean),
      );
    }
    if (equipment.armor && equipment.armor.name) {
      result.push(equipment.armor.name);
    }
    if (equipment.items && Array.isArray(equipment.items)) {
      result.push(
        ...equipment.items.map((i: any) => i.name || i).filter(Boolean),
      );
    }
    return result;
  }
  return [];
}

export function adaptLocation(backendLocation: BackendLocation): Location {
  return {
    id: backendLocation._id?.toString() || backendLocation._id,
    campaignId:
      backendLocation.campaignId?.toString() || backendLocation.campaignId,
    name: backendLocation.name,
    type: backendLocation.type as
      | "settlement"
      | "dungeon"
      | "wilderness"
      | "landmark"
      | "shop"
      | "tavern"
      | "temple"
      | "castle"
      | "other",
    description: backendLocation.description,
    difficulty: backendLocation.difficulty || "Medium",
    inhabitants: backendLocation.inhabitants || [],
    connections: backendLocation.connections || [],
    createdAt: new Date(backendLocation.createdAt),
    updatedAt: new Date(backendLocation.updatedAt),
  };
}

export function adaptSession(backendSession: BackendSession): Session {
  return {
    id: backendSession._id?.toString() || backendSession._id,
    campaignId:
      backendSession.campaignId?.toString() || backendSession.campaignId,
    title: backendSession.title || `Session ${backendSession.sessionNumber}`,
    name: backendSession.name,
    description:
      backendSession.description || `Session ${backendSession.sessionNumber}`,
    date: new Date(backendSession.date),
    isCompleted: backendSession.isCompleted || false,
    sessionNumber: backendSession.sessionNumber,
    isActive: backendSession.isActive || false,
    status: backendSession.status || "In Progress",
    duration: backendSession.duration,
    summary: backendSession.summary,
    createdAt: new Date(backendSession.createdAt),
    updatedAt: new Date(backendSession.updatedAt),
  };
}
