import mongoose, { Document, Schema } from 'mongoose';

export interface IStoryEvent extends Document {
  campaignId: string;
  sessionId: string;
  eventType:
    | 'action'
    | 'consequence'
    | 'discovery'
    | 'character-development'
    | 'world-change'
    | 'skill-check'
    | 'combat'
    | 'social'
    | 'ai-response';
  title: string;
  description: string;
  timestamp: Date;
  participants: string[]; // Character IDs involved
  location: string;
  importance: number; // 1-10 scale
  consequences: string[];
  relatedEvents: string[]; // IDs of related story events
  characterChanges: {
    characterId: string;
    changes: string[];
    experienceGained?: number;
  }[];
  worldChanges: {
    type: 'location' | 'npc' | 'faction' | 'item' | 'quest';
    description: string;
    impact: string;
  }[];
  metadata: {
    skillChecks?: {
      skill: string;
      result: number;
      targetDC: number;
      success: boolean;
      critical: boolean;
    }[];
    combatRounds?: number;
    npcInteractions?: string[];
    itemsFound?: string[];
    questProgress?: {
      questId: string;
      progress: string;
      completed: boolean;
    };
    aiResponse?: boolean;
    originalMessage?: string;
    characterId?: string;
  };
  tags: string[];
  archived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const StoryEventSchema = new Schema<IStoryEvent>(
  {
    campaignId: {
      type: String,
      required: true,
      index: true,
    },
    sessionId: {
      type: String,
      required: true,
      index: true,
    },
    eventType: {
      type: String,
      enum: [
        'action',
        'consequence',
        'discovery',
        'character-development',
        'world-change',
        'skill-check',
        'combat',
        'social',
        'ai-response',
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
    },
    participants: [
      {
        type: String,
        required: true,
      },
    ],
    location: {
      type: String,
      required: true,
      maxlength: 200,
    },
    importance: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
      default: 5,
    },
    consequences: [
      {
        type: String,
        maxlength: 500,
      },
    ],
    relatedEvents: [
      {
        type: String,
      },
    ],
    characterChanges: [
      {
        characterId: {
          type: String,
          required: true,
        },
        changes: [
          {
            type: String,
            maxlength: 200,
          },
        ],
        experienceGained: {
          type: Number,
          min: 0,
        },
      },
    ],
    worldChanges: [
      {
        type: {
          type: String,
          enum: ['location', 'npc', 'faction', 'item', 'quest'],
          required: true,
        },
        description: {
          type: String,
          required: true,
          maxlength: 300,
        },
        impact: {
          type: String,
          required: true,
          maxlength: 500,
        },
      },
    ],
    metadata: {
      skillChecks: [
        {
          skill: {
            type: String,
            required: true,
          },
          result: {
            type: Number,
            required: true,
            min: 1,
            max: 20,
          },
          targetDC: {
            type: Number,
            required: true,
            min: 5,
            max: 30,
          },
          success: {
            type: Boolean,
            required: true,
          },
          critical: {
            type: Boolean,
            default: false,
          },
        },
      ],
      combatRounds: {
        type: Number,
        min: 0,
      },
      npcInteractions: [
        {
          type: String,
          maxlength: 200,
        },
      ],
      itemsFound: [
        {
          type: String,
          maxlength: 200,
        },
      ],
      questProgress: [
        {
          questId: {
            type: String,
            required: true,
          },
          progress: {
            type: String,
            required: true,
            maxlength: 300,
          },
          completed: {
            type: Boolean,
            default: false,
          },
        },
      ],
    },
    tags: [
      {
        type: String,
        maxlength: 50,
      },
    ],
    archived: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
StoryEventSchema.index({ campaignId: 1, timestamp: -1 });
StoryEventSchema.index({ campaignId: 1, eventType: 1 });
StoryEventSchema.index({ campaignId: 1, importance: -1 });
StoryEventSchema.index({ participants: 1 });
StoryEventSchema.index({ tags: 1 });

// Virtual for event summary
StoryEventSchema.virtual('summary').get(function () {
  return {
    id: this._id,
    type: this.eventType,
    title: this.title,
    timestamp: this.timestamp,
    importance: this.importance,
    participants: this.participants.length,
    hasConsequences: this.consequences.length > 0,
    hasWorldChanges: this.worldChanges.length > 0,
  };
});

// Method to add a consequence
StoryEventSchema.methods['addConsequence'] = function (this: any, consequence: string): void {
  if (consequence && !this['consequences'].includes(consequence)) {
    this['consequences'].push(consequence);
  }
};

// Method to add a world change
StoryEventSchema.methods['addWorldChange'] = function (
  this: any,
  type: 'location' | 'npc' | 'faction' | 'item' | 'quest',
  description: string,
  impact: string
): void {
  this['worldChanges'].push({
    type,
    description,
    impact,
  });
};

// Method to add a character change
StoryEventSchema.methods['addCharacterChange'] = function (
  this: any,
  characterId: string,
  change: string,
  experienceGained?: number
): void {
  const existingChange = this['characterChanges'].find((c: any) => c.characterId === characterId);

  if (existingChange) {
    existingChange.changes.push(change);
    if (experienceGained) {
      existingChange.experienceGained = (existingChange.experienceGained || 0) + experienceGained;
    }
  } else {
    this['characterChanges'].push({
      characterId,
      changes: [change],
      experienceGained,
    });
  }
};

// Method to add a skill check
StoryEventSchema.methods['addSkillCheck'] = function (
  this: any,
  skill: string,
  result: number,
  targetDC: number
): void {
  if (!this['metadata']['skillChecks']) {
    this['metadata']['skillChecks'] = [];
  }

  this['metadata']['skillChecks'].push({
    skill,
    result,
    targetDC,
    success: result >= targetDC,
    critical: result === 20 || result === 1,
  });
};

// Method to archive the event
StoryEventSchema.methods['archive'] = function (_this: any): void {
  _this['archived'] = true;
  _this['updatedAt'] = new Date();
};

// Static method to find events by campaign
StoryEventSchema.statics['findByCampaign'] = function (
  campaignId: string,
  options: {
    limit?: number;
    offset?: number;
    eventTypes?: string[];
    minImportance?: number;
    includeArchived?: boolean;
  } = {}
) {
  const { limit = 50, offset = 0, eventTypes, minImportance, includeArchived = false } = options;

  const query: any = { campaignId };

  if (eventTypes && eventTypes.length > 0) {
    query.eventType = { $in: eventTypes };
  }

  if (minImportance) {
    query.importance = { $gte: minImportance };
  }

  if (!includeArchived) {
    query.archived = false;
  }

  return this.find(query).sort({ timestamp: -1, importance: -1 }).skip(offset).limit(limit);
};

// Static method to find related events
StoryEventSchema.statics['findRelated'] = function (
  eventId: string,
  campaignId: string,
  limit: number = 10
) {
  return this.find({
    campaignId,
    relatedEvents: eventId,
    archived: false,
  })
    .sort({ timestamp: -1 })
    .limit(limit);
};

// Static method to get event timeline
StoryEventSchema.statics['getTimeline'] = function (
  campaignId: string,
  options: {
    startDate?: Date;
    endDate?: Date;
    eventTypes?: string[];
    participants?: string[];
  } = {}
) {
  const { startDate, endDate, eventTypes, participants } = options;

  const query: any = { campaignId, archived: false };

  if (startDate || endDate) {
    query.timestamp = {};
    if (startDate) query.timestamp.$gte = startDate;
    if (endDate) query.timestamp.$lte = endDate;
  }

  if (eventTypes && eventTypes.length > 0) {
    query.eventType = { $in: eventTypes };
  }

  if (participants && participants.length > 0) {
    query.participants = { $in: participants };
  }

  return this.find(query)
    .sort({ timestamp: 1 })
    .select('title description timestamp eventType importance participants location');
};

// Static method to get event statistics
StoryEventSchema.statics['getStats'] = function (campaignId: string) {
  return this.aggregate([
    { $match: { campaignId, archived: false } },
    {
      $group: {
        _id: null,
        totalEvents: { $sum: 1 },
        eventTypes: { $addToSet: '$eventType' },
        avgImportance: { $avg: '$importance' },
        totalParticipants: { $sum: { $size: '$participants' } },
        totalConsequences: { $sum: { $size: '$consequences' } },
        totalWorldChanges: { $sum: { $size: '$worldChanges' } },
      },
    },
    {
      $project: {
        _id: 0,
        totalEvents: 1,
        eventTypes: 1,
        avgImportance: { $round: ['$avgImportance', 2] },
        totalParticipants: 1,
        totalConsequences: 1,
        totalWorldChanges: 1,
      },
    },
  ]);
};

const StoryEvent = mongoose.model<IStoryEvent>('StoryEvent', StoryEventSchema);

export default StoryEvent;
