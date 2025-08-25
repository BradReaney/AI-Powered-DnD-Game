export interface Campaign {
  id: string
  name: string
  description: string
  setting: string
  isActive: boolean
  imageUrl?: string
  createdAt: Date
  updatedAt: Date
  sessions: Session[]
}

export interface Session {
  id: string
  campaignId: string
  name: string
  description: string
  date: Date
  isCompleted: boolean
  notes?: string
  sessionNumber: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  summary?: string
}

export interface Character {
  id: string
  campaignId: string
  name: string
  race: string
  class: string
  level: number
  alignment: string
  background: string
  hitPoints: {
    current: number
    maximum: number
  }
  armorClass: number
  proficiencyBonus: number
  currentLocation?: string
  stats: {
    strength: number
    dexterity: number
    constitution: number
    intelligence: number
    wisdom: number
    charisma: number
  }
  skills: string[]
  equipment: string[]
  spells?: string[]
  backstory?: string
  imageUrl?: string
  createdAt: Date
  updatedAt: Date
}

export interface Location {
  id: string
  campaignId: string
  name: string
  type: "city" | "dungeon" | "wilderness" | "building" | "other"
  description: string
  inhabitants?: string[]
  connections?: string[]
  imageUrl?: string
  createdAt: Date
  updatedAt: Date
}

export interface ChatMessage {
  id: string
  sessionId: string
  sender: "player" | "dm"
  content: string
  timestamp: Date
  type: "message" | "action" | "roll"
  metadata?: {
    characterId?: string
    diceRoll?: {
      dice: string
      result: number
      modifier: number
    }
  }
}

export interface GameState {
  gameStarted: boolean
  currentCampaign: Campaign | null
  currentCharacter: Character | null
  currentLocation: Location | null
  messages: ChatMessage[]
  lastSaved: Date | null
}
