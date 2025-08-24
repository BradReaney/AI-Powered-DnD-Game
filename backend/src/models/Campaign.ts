import mongoose, { Document, Schema } from 'mongoose';

export interface ICampaign extends Document {
  name: string;
  theme: string;
  description: string;
  status: 'active' | 'paused' | 'completed' | 'archived';

  // Campaign settings
  settings: {
    difficulty: 'easy' | 'medium' | 'hard' | 'deadly';
    maxLevel: number;
    startingLevel: number;
    experienceRate: 'slow' | 'normal' | 'fast';
    magicLevel: 'low' | 'medium' | 'high';
    technologyLevel: 'primitive' | 'medieval' | 'renaissance' | 'modern' | 'futuristic';

    // AI behavior customization
    aiBehavior: {
      creativity: 'low' | 'medium' | 'high';
      detailLevel: 'minimal' | 'moderate' | 'detailed';
      pacing: 'slow' | 'normal' | 'fast';
      combatStyle: 'tactical' | 'balanced' | 'narrative';
      roleplayDepth: 'shallow' | 'moderate' | 'deep';
    };

    // Campaign rules and house rules
    rules: {
      houseRules: string[];
      customMechanics: string[];
      variantRules: string[];
      restrictions: string[];
      bonuses: string[];
    };

    // Player management
    playerSettings: {
      maxPlayers: number;
      allowNewPlayers: boolean;
      playerPermissions: {
        canCreateCharacters: boolean;
        canModifyWorld: boolean;
        canManageSessions: boolean;
        canInvitePlayers: boolean;
      };
    };

    // Campaign customization
    customization: {
      allowCharacterRespec: boolean;
      allowRetconning: boolean;
      allowTimeTravel: boolean;
      allowParallelTimelines: boolean;
      savePoints: boolean;
    };
  };

  // World state
  worldState: {
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
      type:
      | 'guild'
      | 'noble house'
      | 'religious order'
      | 'mercenary company'
      | 'criminal syndicate'
      | 'other';
      alignment: string;
      influence: number; // 0-100
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

  // Campaign progress
  progress: {
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
      progress: number; // 0-100
    }>;
  };

  // Session management
  sessions: Array<{
    sessionId: mongoose.Types.ObjectId;
    sessionNumber: number;
    date: Date;
    duration: number; // in minutes
    summary: string;
    keyEvents: string[];
    experienceGained: number;
    itemsFound: string[];
    charactersPresent: mongoose.Types.ObjectId[];
  }>;

  // Character management
  characters: Array<{
    characterId: mongoose.Types.ObjectId;
    role: 'player' | 'dm' | 'npc';
    joinedAt: Date;
    isActive: boolean;
  }>;

  // AI context and story
  storyContext: {
    campaignSummary: string;
    currentScene: string;
    storyHistory: Array<{
      timestamp: Date;
      event: string;
      characters: mongoose.Types.ObjectId[];
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
      discoveredBy: mongoose.Types.ObjectId[];
      importance: 'common' | 'uncommon' | 'rare' | 'legendary';
    }>;
  };

  // Metadata
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  lastPlayed: Date;
  totalPlayTime: number; // in minutes
}

const CampaignSchema = new Schema<ICampaign>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    theme: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    status: {
      type: String,
      enum: ['active', 'paused', 'completed', 'archived'],
      default: 'active',
    },

    settings: {
      difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard', 'deadly'],
        default: 'medium',
      },
      maxLevel: {
        type: Number,
        min: 1,
        max: 20,
        default: 20,
      },
      startingLevel: {
        type: Number,
        min: 1,
        max: 20,
        default: 1,
      },
      experienceRate: {
        type: String,
        enum: ['slow', 'normal', 'fast'],
        default: 'normal',
      },
      magicLevel: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium',
      },
      technologyLevel: {
        type: String,
        enum: ['primitive', 'medieval', 'renaissance', 'modern', 'futuristic'],
        default: 'medieval',
      },

      // AI behavior customization
      aiBehavior: {
        creativity: {
          type: String,
          enum: ['low', 'medium', 'high'],
          default: 'medium',
        },
        detailLevel: {
          type: String,
          enum: ['minimal', 'moderate', 'detailed'],
          default: 'moderate',
        },
        pacing: {
          type: String,
          enum: ['slow', 'normal', 'fast'],
          default: 'normal',
        },
        combatStyle: {
          type: String,
          enum: ['tactical', 'balanced', 'narrative'],
          default: 'balanced',
        },
        roleplayDepth: {
          type: String,
          enum: ['shallow', 'moderate', 'deep'],
          default: 'moderate',
        },
      },

      // Campaign rules and house rules
      rules: {
        houseRules: [String],
        customMechanics: [String],
        variantRules: [String],
        restrictions: [String],
        bonuses: [String],
      },

      // Player management
      playerSettings: {
        maxPlayers: {
          type: Number,
          min: 1,
          max: 10,
          default: 6,
        },
        allowNewPlayers: {
          type: Boolean,
          default: true,
        },
        playerPermissions: {
          canCreateCharacters: {
            type: Boolean,
            default: true,
          },
          canModifyWorld: {
            type: Boolean,
            default: false,
          },
          canManageSessions: {
            type: Boolean,
            default: false,
          },
          canInvitePlayers: {
            type: Boolean,
            default: false,
          },
        },
      },

      // Campaign customization
      customization: {
        allowCharacterRespec: {
          type: Boolean,
          default: false,
        },
        allowRetconning: {
          type: Boolean,
          default: false,
        },
        allowTimeTravel: {
          type: Boolean,
          default: false,
        },
        allowParallelTimelines: {
          type: Boolean,
          default: false,
        },
        savePoints: {
          type: Boolean,
          default: false,
        },
      },
    },

    worldState: {
      currentLocation: {
        type: String,
        default: 'Starting Town',
      },
      knownLocations: [
        {
          name: String,
          type: {
            type: String,
            enum: ['city', 'town', 'village', 'dungeon', 'wilderness', 'other'],
          },
          description: String,
          discovered: {
            type: Boolean,
            default: false,
          },
          visited: {
            type: Boolean,
            default: false,
          },
        },
      ],
      factions: [
        {
          name: String,
          type: {
            type: String,
            enum: [
              'guild',
              'noble house',
              'religious order',
              'mercenary company',
              'criminal syndicate',
              'other',
            ],
          },
          alignment: String,
          influence: {
            type: Number,
            min: 0,
            max: 100,
            default: 50,
          },
          relationship: {
            type: String,
            enum: ['hostile', 'unfriendly', 'neutral', 'friendly', 'allied'],
            default: 'neutral',
          },
          description: String,
        },
      ],
      activeThreats: [
        {
          name: String,
          type: {
            type: String,
            enum: ['monster', 'organization', 'natural disaster', 'political', 'other'],
          },
          threatLevel: {
            type: String,
            enum: ['low', 'medium', 'high', 'critical'],
          },
          description: String,
          location: String,
          status: {
            type: String,
            enum: ['active', 'defeated', 'resolved'],
            default: 'active',
          },
        },
      ],
      worldEvents: [
        {
          title: String,
          description: String,
          impact: {
            type: String,
            enum: ['minor', 'moderate', 'major', 'catastrophic'],
          },
          resolved: {
            type: Boolean,
            default: false,
          },
          timestamp: {
            type: Date,
            default: Date.now,
          },
        },
      ],
    },

    progress: {
      currentChapter: {
        type: Number,
        min: 1,
        default: 1,
      },
      totalChapters: {
        type: Number,
        min: 1,
        default: 10,
      },
      completedQuests: [
        {
          name: String,
          description: String,
          completedAt: Date,
          experienceReward: Number,
          itemsRewarded: [String],
        },
      ],
      activeQuests: [
        {
          name: String,
          description: String,
          objectives: [
            {
              description: String,
              completed: Boolean,
            },
          ],
          difficulty: {
            type: String,
            enum: ['easy', 'medium', 'hard', 'deadly'],
          },
          experienceReward: Number,
          timeLimit: Date,
        },
      ],
      campaignGoals: [
        {
          description: String,
          completed: Boolean,
          progress: {
            type: Number,
            min: 0,
            max: 100,
            default: 0,
          },
        },
      ],
    },

    sessions: [
      {
        sessionId: {
          type: Schema.Types.ObjectId,
          ref: 'Session',
        },
        sessionNumber: Number,
        date: Date,
        duration: Number,
        summary: String,
        keyEvents: [String],
        experienceGained: Number,
        itemsFound: [String],
        charactersPresent: [
          {
            type: Schema.Types.ObjectId,
            ref: 'Character',
          },
        ],
      },
    ],

    characters: [
      {
        characterId: {
          type: Schema.Types.ObjectId,
          ref: 'Character',
        },
        role: {
          type: String,
          enum: ['player', 'dm', 'npc'],
          default: 'player',
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
        isActive: {
          type: Boolean,
          default: true,
        },
      },
    ],

    storyContext: {
      campaignSummary: {
        type: String,
        default: '',
      },
      currentScene: {
        type: String,
        default: '',
      },
      storyHistory: [
        {
          timestamp: {
            type: Date,
            default: Date.now,
          },
          event: String,
          characters: [
            {
              type: Schema.Types.ObjectId,
              ref: 'Character',
            },
          ],
          location: String,
          importance: {
            type: String,
            enum: ['minor', 'moderate', 'major', 'critical'],
            default: 'moderate',
          },
        },
      ],
      npcDatabase: [
        {
          name: String,
          role: String,
          description: String,
          personality: String,
          currentLocation: String,
          relationshipToParty: String,
          lastSeen: Date,
        },
      ],
      worldLore: [
        {
          category: String,
          title: String,
          content: String,
          discoveredBy: [
            {
              type: Schema.Types.ObjectId,
              ref: 'Character',
            },
          ],
          importance: {
            type: String,
            enum: ['common', 'uncommon', 'rare', 'legendary'],
            default: 'common',
          },
        },
      ],
    },

    createdBy: {
      type: String,
      required: true,
    },
    lastPlayed: {
      type: Date,
      default: Date.now,
    },
    totalPlayTime: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
CampaignSchema.index({ status: 1, createdBy: 1 });
CampaignSchema.index({ theme: 1 });
CampaignSchema.index({ 'characters.characterId': 1 });

// Virtual for campaign duration
CampaignSchema.virtual('duration').get(function () {
  if (this.sessions.length === 0) return 0;

  const firstSession = this.sessions.reduce((earliest, session) =>
    session.date < earliest.date ? session : earliest
  );

  const lastSession = this.sessions.reduce((latest, session) =>
    session.date > latest.date ? session : latest
  );

  return Math.floor((lastSession.date.getTime() - firstSession.date.getTime()) / (1000 * 60));
});

// Virtual for active character count
CampaignSchema.virtual('activeCharacterCount').get(function () {
  return this.characters.filter(char => char.isActive).length;
});

// Method to add session
CampaignSchema.methods['addSession'] = function (this: any, sessionData: any) {
  this.sessions.push(sessionData);
  this.lastPlayed = new Date();
  this.totalPlayTime += sessionData.duration || 0;
  return this.save();
};

// Method to update campaign progress
CampaignSchema.methods['updateProgress'] = function (
  this: any,
  chapter: number,
  quests: any[],
  goals: any[]
) {
  this.progress.currentChapter = chapter;
  this.progress.activeQuests = quests;
  this.progress.campaignGoals = goals;
  return this.save();
};

export default mongoose.model<ICampaign>('Campaign', CampaignSchema);
