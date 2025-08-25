import mongoose, { Document, Schema } from 'mongoose';

export interface ISession extends Document {
  _id: string; // Override Document's _id to be string instead of ObjectId
  campaignId: mongoose.Types.ObjectId;
  sessionNumber: number;
  name: string;
  status: 'active' | 'paused' | 'completed' | 'archived';

  // Session metadata
  metadata: {
    startTime: Date;
    endTime?: Date;
    duration: number; // in minutes
    players: Array<{
      playerId: string;
      characterId: mongoose.Types.ObjectId;
      joinedAt: Date;
      leftAt?: Date;
    }>;
    dm: string;
    location: string;
    weather: string;
    timeOfDay: 'dawn' | 'morning' | 'noon' | 'afternoon' | 'dusk' | 'night' | 'midnight';
  };

  // Game state
  gameState: {
    currentScene: string;
    sceneDescription: string;
    activeCharacters: mongoose.Types.ObjectId[];
    currentTurn: number;
    initiativeOrder: Array<{
      characterId: mongoose.Types.ObjectId;
      initiative: number;
      hasActed: boolean;
    }>;
    combatState: {
      isActive: boolean;
      round: number;
      currentCharacter: mongoose.Types.ObjectId | null;
      conditions: Array<{
        characterId: mongoose.Types.ObjectId;
        condition: string;
        duration: number;
        source: string;
      }>;
    };
    worldState: {
      currentLocation: string;
      discoveredLocations: string[];
      activeEffects: Array<{
        name: string;
        description: string;
        duration: number;
        affectedCharacters: mongoose.Types.ObjectId[];
        source: string;
      }>;
    };
  };

  // Story events and progression
  storyEvents: Array<{
    timestamp: Date;
    type:
    | 'action'
    | 'dialogue'
    | 'combat'
    | 'exploration'
    | 'skill_check'
    | 'story'
    | 'other'
    | 'ai-response';
    title: string;
    description: string;
    participants: mongoose.Types.ObjectId[];
    location: string;
    consequences: Array<{
      type: 'character' | 'world' | 'relationship' | 'quest' | 'other';
      description: string;
      impact: 'minor' | 'moderate' | 'major' | 'critical';
      resolved: boolean;
    }>;
    metadata: {
      skillChecks?: Array<{
        skill: string;
        result: number;
        target: number;
        success: boolean;
        critical: boolean;
      }>;
      combatActions?: Array<{
        action: string;
        target: string;
        result: string;
        damage?: number;
      }>;
      items?: Array<{
        name: string;
        action: 'found' | 'used' | 'lost' | 'gained' | 'other';
        quantity: number;
      }>;
      aiResponse?: boolean;
      originalMessage?: string;
      characterId?: string;
    };
  }>;

  // AI context and memory
  aiContext: {
    sessionSummary: string;
    keyDecisions: string[];
    characterDevelopment: Array<{
      characterId: mongoose.Types.ObjectId;
      changes: string[];
      reasons: string[];
    }>;
    worldChanges: Array<{
      type: 'location' | 'faction' | 'npc' | 'quest' | 'other';
      description: string;
      impact: string;
    }>;
    nextSessionHooks: string[];
    aiNotes: string;
  };

  // Session outcomes
  outcomes: {
    experienceGained: number;
    itemsFound: Array<{
      name: string;
      description: string;
      rarity: 'common' | 'uncommon' | 'rare' | 'very rare' | 'legendary';
      quantity: number;
      foundBy: mongoose.Types.ObjectId;
    }>;
    questsStarted: Array<{
      name: string;
      description: string;
      objectives: string[];
      difficulty: 'easy' | 'medium' | 'hard' | 'deadly';
    }>;
    questsCompleted: Array<{
      name: string;
      description: string;
      experienceReward: number;
      itemsRewarded: string[];
    }>;
    relationshipsChanged: Array<{
      character1: mongoose.Types.ObjectId;
      character2: mongoose.Types.ObjectId;
      change: string;
      newStatus: string;
    }>;
  };

  // Session notes and feedback
  notes: {
    dmNotes: string;
    playerFeedback: Array<{
      playerId: string;
      rating: number; // 1-5
      comments: string;
      timestamp: Date;
    }>;
    highlights: string[];
    areasForImprovement: string[];
    nextSessionIdeas: string[];
  };

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

const SessionSchema = new Schema<ISession>(
  {
    _id: {
      type: String, // Allow string IDs (UUIDs) instead of ObjectIds
      required: true,
      index: true,
    },
    campaignId: {
      type: Schema.Types.ObjectId,
      ref: 'Campaign',
      required: true,
      index: true,
    },
    sessionNumber: {
      type: Number,
      required: true,
      min: 1,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Session name is required'],
      trim: true,
      minlength: [3, 'Session name must be at least 3 characters'],
      maxlength: [100, 'Session name cannot exceed 100 characters'],
      validate: {
        validator: function (v: string) {
          return v.trim().length > 0;
        },
        message: 'Session name cannot be empty or only whitespace',
      },
    },
    status: {
      type: String,
      enum: {
        values: ['active', 'paused', 'completed', 'archived'],
        message: 'Status must be one of: active, paused, completed, archived',
      },
      default: 'active',
      index: true,
    },

    metadata: {
      startTime: {
        type: Date,
        required: [true, 'Session start time is required'],
        default: Date.now,
        validate: {
          validator: function (v: Date) {
            return v instanceof Date && !isNaN(v.getTime());
          },
          message: 'Start time must be a valid date',
        },
      },
      endTime: {
        type: Date,
        validate: {
          validator: function (v: Date) {
            if (!v) return true; // Optional field
            return v instanceof Date && !isNaN(v.getTime());
          },
          message: 'End time must be a valid date',
        },
      },
      duration: {
        type: Number,
        default: 0,
        min: [0, 'Duration cannot be negative'],
        validate: {
          validator: function (v: number) {
            if (this.metadata?.endTime && this.metadata?.startTime) {
              const calculated = Math.floor(
                (this.metadata.endTime.getTime() - this.metadata.startTime.getTime()) / (1000 * 60)
              );
              return v >= calculated;
            }
            return true;
          },
          message: 'Duration must be accurate based on start and end times',
        },
      },
      players: [
        {
          playerId: {
            type: String,
            required: [true, 'Player ID is required'],
            trim: true,
            minlength: [1, 'Player ID cannot be empty'],
          },
          characterId: {
            type: Schema.Types.ObjectId,
            ref: 'Character',
            required: [true, 'Character ID is required'],
            validate: {
              validator: function (v: any) {
                return v && v.toString().match(/^[0-9a-fA-F]{24}$/);
              },
              message: 'Character ID must be a valid ObjectId',
            },
          },
          joinedAt: {
            type: Date,
            default: Date.now,
            validate: {
              validator: function (v: Date) {
                return v instanceof Date && !isNaN(v.getTime());
              },
              message: 'Join time must be a valid date',
            },
          },
          leftAt: {
            type: Date,
            validate: {
              validator: function (v: Date) {
                if (!v) return true; // Optional field
                return v instanceof Date && !isNaN(v.getTime());
              },
              message: 'Leave time must be a valid date',
            },
          },
        },
      ],
      dm: {
        type: String,
        required: [true, 'Dungeon Master name is required'],
        trim: true,
        minlength: [2, 'DM name must be at least 2 characters'],
        maxlength: [50, 'DM name cannot exceed 50 characters'],
        validate: {
          validator: function (v: string) {
            return v.trim().length > 0;
          },
          message: 'DM name cannot be empty or only whitespace',
        },
      },
      location: {
        type: String,
        required: [true, 'Session location is required'],
        trim: true,
        minlength: [2, 'Location must be at least 2 characters'],
        maxlength: [100, 'Location cannot exceed 100 characters'],
        default: 'Starting Location',
        validate: {
          validator: function (v: string) {
            return v.trim().length > 0;
          },
          message: 'Location cannot be empty or only whitespace',
        },
      },
      weather: {
        type: String,
        required: [true, 'Weather is required'],
        trim: true,
        minlength: [2, 'Weather must be at least 2 characters'],
        maxlength: [50, 'Weather cannot exceed 50 characters'],
        default: 'Clear',
        validate: {
          validator: function (v: string) {
            return v.trim().length > 0;
          },
          message: 'Weather cannot be empty or only whitespace',
        },
      },
      timeOfDay: {
        type: String,
        required: [true, 'Time of day is required'],
        enum: {
          values: ['dawn', 'morning', 'noon', 'afternoon', 'dusk', 'night', 'midnight'],
          message:
            'Time of day must be one of: dawn, morning, noon, afternoon, dusk, night, midnight',
        },
        default: 'morning',
      },
    },

    gameState: {
      currentScene: {
        type: String,
        default: 'Session Start',
      },
      sceneDescription: {
        type: String,
        default: '',
      },
      activeCharacters: [
        {
          type: Schema.Types.ObjectId,
          ref: 'Character',
        },
      ],
      currentTurn: {
        type: Number,
        default: 1,
      },
      initiativeOrder: [
        {
          characterId: {
            type: Schema.Types.ObjectId,
            ref: 'Character',
          },
          initiative: Number,
          hasActed: {
            type: Boolean,
            default: false,
          },
        },
      ],
      combatState: {
        isActive: {
          type: Boolean,
          default: false,
        },
        round: {
          type: Number,
          default: 0,
        },
        currentCharacter: {
          type: Schema.Types.ObjectId,
          ref: 'Character',
        },
        conditions: [
          {
            characterId: {
              type: Schema.Types.ObjectId,
              ref: 'Character',
            },
            condition: String,
            duration: Number,
            source: String,
          },
        ],
      },
      worldState: {
        currentLocation: {
          type: String,
          default: '',
        },
        discoveredLocations: [String],
        activeEffects: [
          {
            name: String,
            description: String,
            duration: Number,
            affectedCharacters: [
              {
                type: Schema.Types.ObjectId,
                ref: 'Character',
              },
            ],
            source: String,
          },
        ],
      },
    },

    storyEvents: [
      {
        timestamp: {
          type: Date,
          default: Date.now,
        },
        type: {
          type: String,
          enum: [
            'action',
            'dialogue',
            'combat',
            'exploration',
            'skill_check',
            'story',
            'other',
            'ai-response',
          ],
        },
        title: String,
        description: String,
        participants: [
          {
            type: Schema.Types.ObjectId,
            ref: 'Character',
          },
        ],
        location: String,
        consequences: [
          {
            type: {
              type: String,
              enum: ['character', 'world', 'relationship', 'quest', 'other'],
            },
            description: String,
            impact: {
              type: String,
              enum: ['minor', 'moderate', 'major', 'critical'],
            },
            resolved: {
              type: Boolean,
              default: false,
            },
          },
        ],
        metadata: {
          skillChecks: [
            {
              skill: String,
              result: Number,
              target: Number,
              success: Boolean,
              critical: Boolean,
            },
          ],
          combatActions: [
            {
              action: String,
              target: String,
              result: String,
              damage: Number,
            },
          ],
          items: [
            {
              name: String,
              action: {
                type: String,
                enum: ['found', 'used', 'lost', 'gained', 'other'],
              },
              quantity: Number,
            },
          ],
        },
      },
    ],

    aiContext: {
      sessionSummary: {
        type: String,
        default: '',
      },
      keyDecisions: [String],
      characterDevelopment: [
        {
          characterId: {
            type: Schema.Types.ObjectId,
            ref: 'Character',
          },
          changes: [String],
          reasons: [String],
        },
      ],
      worldChanges: [
        {
          type: {
            type: String,
            enum: ['location', 'faction', 'npc', 'quest', 'other'],
          },
          description: String,
          impact: String,
        },
      ],
      nextSessionHooks: [String],
      aiNotes: String,
    },

    outcomes: {
      experienceGained: {
        type: Number,
        default: 0,
      },
      itemsFound: [
        {
          name: String,
          description: String,
          rarity: {
            type: String,
            enum: ['common', 'uncommon', 'rare', 'very rare', 'legendary'],
          },
          quantity: Number,
          foundBy: {
            type: Schema.Types.ObjectId,
            ref: 'Character',
          },
        },
      ],
      questsStarted: [
        {
          name: String,
          description: String,
          objectives: [String],
          difficulty: {
            type: String,
            enum: ['easy', 'medium', 'hard', 'deadly'],
          },
        },
      ],
      questsCompleted: [
        {
          name: String,
          description: String,
          experienceReward: Number,
          itemsRewarded: [String],
        },
      ],
      relationshipsChanged: [
        {
          character1: {
            type: Schema.Types.ObjectId,
            ref: 'Character',
          },
          character2: {
            type: Schema.Types.ObjectId,
            ref: 'Character',
          },
          change: String,
          newStatus: String,
        },
      ],
    },

    notes: {
      dmNotes: String,
      playerFeedback: [
        {
          playerId: String,
          rating: {
            type: Number,
            min: 1,
            max: 5,
          },
          comments: String,
          timestamp: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      highlights: [String],
      areasForImprovement: [String],
      nextSessionIdeas: [String],
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
SessionSchema.index({ campaignId: 1, sessionNumber: 1 });
SessionSchema.index({ status: 1, createdAt: 1 });
SessionSchema.index({ 'metadata.players.characterId': 1 });

// Virtual for session duration
SessionSchema.virtual('calculatedDuration').get(function () {
  if (this.metadata.endTime && this.metadata.startTime) {
    return Math.floor(
      (this.metadata.endTime.getTime() - this.metadata.startTime.getTime()) / (1000 * 60)
    );
  }
  return this.metadata.duration;
});

// Method to end session
SessionSchema.methods['endSession'] = function (this: any, endTime: Date, summary: string) {
  this.metadata.endTime = endTime;
  this.metadata.duration = this['calculatedDuration'];
  this.status = 'completed';
  this.aiContext.sessionSummary = summary;
  return this.save();
};

// Method to add story event
SessionSchema.methods['addStoryEvent'] = function (this: any, eventData: any) {
  this.storyEvents.push(eventData);
  return this.save();
};

// Method to update game state
SessionSchema.methods['updateGameState'] = function (this: any, stateData: any) {
  Object.assign(this.gameState, stateData);
  return this.save();
};

export default mongoose.model<ISession>('Session', SessionSchema);
