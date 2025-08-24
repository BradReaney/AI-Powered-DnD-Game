import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage extends Document {
  sessionId: mongoose.Types.ObjectId;
  campaignId: mongoose.Types.ObjectId;
  type: 'player' | 'ai' | 'system' | 'combat' | 'skill-check';
  sender: string; // Character name or 'Dungeon Master' for AI
  characterId?: mongoose.Types.ObjectId; // For player messages
  content: string;
  timestamp: Date;
  metadata?: {
    aiResponse?: boolean;
    originalMessage?: string;
    skillCheck?: {
      skill: string;
      result: number;
      targetDC: number;
      success: boolean;
      critical: boolean;
    };
    combatAction?: {
      action: string;
      target: string;
      result: string;
      damage?: number;
    };
    location?: string;
    importance?: 'minor' | 'moderate' | 'major' | 'critical';
    tags?: string[];
  };
  reactions?: Array<{
    characterId: mongoose.Types.ObjectId;
    reaction: string; // emoji or text reaction
    timestamp: Date;
  }>;
  edited?: boolean;
  editedAt?: Date;
  deleted?: boolean;
  deletedAt?: Date;
}

// Interface for static methods
export interface IMessageModel extends mongoose.Model<IMessage> {
  getSessionMessages(
    _sessionId: string,
    _limit?: number,
    _offset?: number,
    _includeDeleted?: boolean
  ): Promise<IMessage[]>;
  getRecentContext(
    _sessionId: string,
    _limit?: number,
    _includeTypes?: string[]
  ): Promise<IMessage[]>;
}

const MessageSchema = new Schema<IMessage>(
  {
    sessionId: {
      type: Schema.Types.ObjectId,
      ref: 'Session',
      required: true,
      index: true,
    },
    campaignId: {
      type: Schema.Types.ObjectId,
      ref: 'Campaign',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['player', 'ai', 'system', 'combat', 'skill-check'],
      required: true,
      index: true,
    },
    sender: {
      type: String,
      required: true,
      trim: true,
    },
    characterId: {
      type: Schema.Types.ObjectId,
      ref: 'Character',
      index: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    metadata: {
      aiResponse: Boolean,
      originalMessage: String,
      skillCheck: {
        skill: String,
        result: Number,
        targetDC: Number,
        success: Boolean,
        critical: Boolean,
      },
      combatAction: {
        action: String,
        target: String,
        result: String,
        damage: Number,
      },
      location: String,
      importance: {
        type: String,
        enum: ['minor', 'moderate', 'major', 'critical'],
        default: 'moderate',
      },
      tags: [String],
    },
    reactions: [
      {
        characterId: {
          type: Schema.Types.ObjectId,
          ref: 'Character',
        },
        reaction: String,
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    edited: {
      type: Boolean,
      default: false,
    },
    editedAt: Date,
    deleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
MessageSchema.index({ sessionId: 1, timestamp: 1 });
MessageSchema.index({ campaignId: 1, timestamp: 1 });
MessageSchema.index({ type: 1, timestamp: 1 });
MessageSchema.index({ characterId: 1, timestamp: 1 });
MessageSchema.index({ 'metadata.importance': 1, timestamp: 1 });

// Virtual for message age
MessageSchema.virtual('age').get(function (_this: any) {
  return Date.now() - _this.timestamp.getTime();
});

// Method to mark message as edited
MessageSchema.methods.markAsEdited = function (_this: any) {
  _this.edited = true;
  _this.editedAt = new Date();
  return _this.save();
};

// Method to mark message as deleted
MessageSchema.methods.markAsDeleted = function (_this: any) {
  _this.deleted = true;
  _this.deletedAt = new Date();
  return _this.save();
};

// Method to add reaction
MessageSchema.methods.addReaction = function (this: any, characterId: string, reaction: string) {
  // Remove existing reaction from this character
  this.reactions = this.reactions.filter((r: any) => r.characterId.toString() !== characterId);

  // Add new reaction
  this.reactions.push({
    characterId,
    reaction,
    timestamp: new Date(),
  });

  return this.save();
};

// Static method to get messages for a session with pagination
MessageSchema.statics.getSessionMessages = function (
  sessionId: string,
  limit: number = 50,
  offset: number = 0,
  includeDeleted: boolean = false
) {
  const query: any = { sessionId, deleted: { $ne: true } };

  if (includeDeleted) {
    delete query.deleted;
  }

  return this.find(query)
    .sort({ timestamp: 1 })
    .skip(offset)
    .limit(limit)
    .populate('characterId', 'name race class level')
    .lean();
};

// Static method to get recent messages for context
MessageSchema.statics.getRecentContext = function (
  sessionId: string,
  limit: number = 20,
  includeTypes: string[] = ['player', 'ai', 'system']
) {
  return this.find({
    sessionId,
    type: { $in: includeTypes },
    deleted: { $ne: true },
  })
    .sort({ timestamp: 1 }) // Changed to ascending order for conversation context
    .limit(limit)
    .populate('characterId', 'name race class level')
    .lean();
};

export default mongoose.model<IMessage, IMessageModel>('Message', MessageSchema);
