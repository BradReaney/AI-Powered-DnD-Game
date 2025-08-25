import mongoose, { Document, Schema } from 'mongoose';

export interface ICharacter extends Document {
  name: string;
  characterType: 'human' | 'ai';
  race: string;
  class: string;
  archetype?: string;
  level: number;
  experience: number;

  // Core D&D 5e attributes
  attributes: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };

  // Derived stats
  hitPoints: {
    maximum: number;
    current: number;
    temporary: number;
  };

  armorClass: number;
  initiative: number;
  speed: number;

  // Skills and proficiencies
  skills: {
    [key: string]: {
      proficient: boolean;
      expertise: boolean;
      modifier: number;
    };
  };

  // Personality and background
  personality: {
    traits: string[];
    ideals: string[];
    bonds: string[];
    flaws: string[];
    background: string;
    alignment: string;
  };

  // AI-specific properties
  aiPersonality?: {
    goals: string[];
    fears: string[];
    relationships: {
      [characterId: string]: {
        type: 'friend' | 'enemy' | 'neutral' | 'romantic' | 'mentor' | 'student';
        strength: number; // -100 to 100
        notes: string;
      };
    };
    memory: {
      importantEvents: string[];
      characterDevelopment: string[];
      worldKnowledge: string[];
    };
  };

  // Equipment and inventory
  equipment: {
    weapons: Array<{
      name: string;
      type: string;
      damage: string;
      properties: string[];
      equipped: boolean;
    }>;
    armor: {
      name: string;
      type: string;
      ac: number;
      equipped: boolean;
    } | null;
    items: Array<{
      name: string;
      description: string;
      quantity: number;
      weight: number;
      magical: boolean;
    }>;
  };

  // Campaign and session tracking
  campaignId: mongoose.Types.ObjectId;
  sessionId: string; // Changed from ObjectId to string to support UUIDs
  isActive: boolean;

  // Location tracking
  currentLocation?: {
    locationId: mongoose.Types.ObjectId;
    locationName: string;
    arrivedAt: Date;
  };

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

const CharacterSchema = new Schema<ICharacter>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    characterType: {
      type: String,
      enum: ['human', 'ai'],
      required: true,
    },
    race: {
      type: String,
      required: true,
      trim: true,
    },
    class: {
      type: String,
      required: true,
      trim: true,
    },
    archetype: {
      type: String,
      trim: true,
    },
    level: {
      type: Number,
      required: true,
      min: 1,
      max: 20,
      default: 1,
    },
    experience: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    attributes: {
      strength: {
        type: Number,
        required: true,
        min: 3,
        max: 18,
      },
      dexterity: {
        type: Number,
        required: true,
        min: 3,
        max: 18,
      },
      constitution: {
        type: Number,
        required: true,
        min: 3,
        max: 18,
      },
      intelligence: {
        type: Number,
        required: true,
        min: 3,
        max: 18,
      },
      wisdom: {
        type: Number,
        required: true,
        min: 3,
        max: 18,
      },
      charisma: {
        type: Number,
        required: true,
        min: 3,
        max: 18,
      },
    },

    hitPoints: {
      maximum: {
        type: Number,
        required: true,
        min: 1,
      },
      current: {
        type: Number,
        required: true,
        min: 0,
      },
      temporary: {
        type: Number,
        default: 0,
        min: 0,
      },
    },

    armorClass: {
      type: Number,
      required: true,
      min: 10,
      default: 10,
    },
    initiative: {
      type: Number,
      default: 0,
    },
    speed: {
      type: Number,
      required: true,
      min: 0,
      default: 30,
    },

    skills: {
      type: Map,
      of: {
        proficient: Boolean,
        expertise: Boolean,
        modifier: Number,
      },
      default: {},
    },

    personality: {
      traits: [String],
      ideals: [String],
      bonds: [String],
      flaws: [String],
      background: String,
      alignment: String,
    },

    aiPersonality: {
      goals: [String],
      fears: [String],
      relationships: {
        type: Map,
        of: {
          type: String,
          enum: ['friend', 'enemy', 'neutral', 'romantic', 'mentor', 'student'],
          strength: Number,
          notes: String,
        },
      },
      memory: {
        importantEvents: [String],
        characterDevelopment: [String],
        worldKnowledge: [String],
      },
    },

    equipment: {
      weapons: [
        {
          name: String,
          type: String,
          damage: String,
          properties: [String],
          equipped: Boolean,
        },
      ],
      armor: {
        name: String,
        type: String,
        ac: Number,
        equipped: Boolean,
      },
      items: [
        {
          name: String,
          description: String,
          quantity: Number,
          weight: Number,
          magical: Boolean,
        },
      ],
    },

    campaignId: {
      type: Schema.Types.ObjectId,
      ref: 'Campaign',
      required: true,
    },
    sessionId: {
      type: String, // Changed from ObjectId to String to support UUIDs
      ref: 'Session',
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },

    currentLocation: {
      locationId: {
        type: Schema.Types.ObjectId,
        ref: 'Location',
      },
      locationName: String,
      arrivedAt: {
        type: Date,
        default: Date.now,
      },
    },

    createdBy: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
CharacterSchema.index({ campaignId: 1, sessionId: 1 });
CharacterSchema.index({ characterType: 1 });
CharacterSchema.index({ name: 1 });

// Virtual for attribute modifiers
CharacterSchema.virtual('attributeModifiers').get(function () {
  const modifiers: { [key: string]: number } = {};
  Object.keys(this.attributes).forEach(attr => {
    const value = this.attributes[attr as keyof typeof this.attributes];
    modifiers[attr] = Math.floor((value - 10) / 2);
  });
  return modifiers;
});

// Virtual for proficiency bonus
CharacterSchema.virtual('proficiencyBonus').get(function () {
  return Math.floor((this.level - 1) / 4) + 2;
});

// Method to calculate skill modifier
CharacterSchema.methods['getSkillModifier'] = function (this: any, skillName: string): number {
  const skill = this.skills.get(skillName);
  if (!skill) return 0;

  const attribute = this['getSkillAttribute'](skillName);
  const attributeMod = this['attributeModifiers'][attribute];
  let modifier = attributeMod;

  if (skill.proficient) {
    modifier += this['proficiencyBonus'];
  }

  if (skill.expertise) {
    modifier += this['proficiencyBonus'];
  }

  return modifier;
};

// Helper method to get attribute for a skill
CharacterSchema.methods['getSkillAttribute'] = function (this: any, skillName: string): string {
  const skillAttributeMap: { [key: string]: string } = {
    acrobatics: 'dexterity',
    'animal handling': 'wisdom',
    arcana: 'intelligence',
    athletics: 'strength',
    deception: 'charisma',
    history: 'intelligence',
    insight: 'wisdom',
    intimidation: 'charisma',
    investigation: 'intelligence',
    medicine: 'wisdom',
    nature: 'intelligence',
    perception: 'wisdom',
    performance: 'charisma',
    persuasion: 'charisma',
    religion: 'intelligence',
    'sleight of hand': 'dexterity',
    stealth: 'dexterity',
    survival: 'wisdom',
  };

  return skillAttributeMap[skillName.toLowerCase()] || 'intelligence';
};

export default mongoose.model<ICharacter>('Character', CharacterSchema);
