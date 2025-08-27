import mongoose, { Document, Schema } from 'mongoose';

// Interface for static methods
export interface ILocationModel extends mongoose.Model<ILocation> {
  getCampaignLocations(
    _campaignId: string,
    _limit?: number,
    _offset?: number
  ): Promise<ILocation[]>;
  getSessionLocations(_sessionId: string, _limit?: number, _offset?: number): Promise<ILocation[]>;
}

// Interface for instance methods
export interface ILocationMethods {
  markAsVisited(_characterName: string): Promise<ILocation>;
  addOccupant(_characterName: string): Promise<ILocation>;
  removeOccupant(_characterName: string): Promise<ILocation>;
}

// Combined interface
export interface ILocation extends Document, ILocationMethods {
  name: string;
  description: string;
  type:
    | 'settlement'
    | 'dungeon'
    | 'wilderness'
    | 'landmark'
    | 'shop'
    | 'tavern'
    | 'temple'
    | 'castle'
    | 'other';
  campaignId: mongoose.Types.ObjectId;
  sessionId?: string; // Changed from ObjectId to string to support UUIDs

  // Location details
  coordinates?: {
    x: number;
    y: number;
    region: string;
  };

  // Discovery information
  discoveredBy: string[]; // Character names who discovered this location
  discoveredAt: Date;
  lastVisited: Date;
  visitCount: number;

  // Location state
  isExplored: boolean;
  isSafe: boolean;
  currentOccupants?: string[]; // Characters currently at this location

  // Environmental details
  climate?: string;
  terrain?: string;
  lighting?: string;
  weather?: string;

  // Resources and points of interest
  resources?: string[];
  pointsOfInterest?: Array<{
    name: string;
    description: string;
    type: string;
    isExplored: boolean;
  }>;

  // Connections to other locations
  connectedLocations?: Array<{
    locationId: mongoose.Types.ObjectId;
    name: string;
    distance: number;
    travelTime: string;
    routeType: 'road' | 'path' | 'river' | 'teleport' | 'other';
  }>;

  // Metadata
  importance: 'minor' | 'moderate' | 'major' | 'critical';
  tags: string[];
  notes?: string;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

const LocationSchema = new Schema<ILocation>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: [
        'settlement',
        'dungeon',
        'wilderness',
        'landmark',
        'shop',
        'tavern',
        'temple',
        'castle',
        'other',
      ],
      required: true,
      default: 'other',
    },
    campaignId: {
      type: Schema.Types.ObjectId,
      ref: 'Campaign',
      required: true,
      index: true,
    },
    sessionId: {
      type: String, // Changed from ObjectId to String to support UUIDs
      ref: 'Session',
      required: false,
      index: true,
    },

    coordinates: {
      x: Number,
      y: Number,
      region: String,
    },

    discoveredBy: [
      {
        type: String,
        trim: true,
      },
    ],
    discoveredAt: {
      type: Date,
      default: Date.now,
    },
    lastVisited: {
      type: Date,
      default: Date.now,
    },
    visitCount: {
      type: Number,
      default: 1,
      min: 0,
    },

    isExplored: {
      type: Boolean,
      default: false,
    },
    isSafe: {
      type: Boolean,
      default: true,
    },
    currentOccupants: [
      {
        type: String,
        trim: true,
      },
    ],

    climate: String,
    terrain: String,
    lighting: String,
    weather: String,

    resources: [String],
    pointsOfInterest: [
      {
        name: { type: String, required: true },
        description: { type: String, required: true },
        type: { type: String, required: true },
        isExplored: { type: Boolean, default: false },
      },
    ],

    connectedLocations: [
      {
        locationId: {
          type: Schema.Types.ObjectId,
          ref: 'Location',
        },
        name: String,
        distance: Number,
        travelTime: String,
        routeType: {
          type: String,
          enum: ['road', 'path', 'river', 'teleport', 'other'],
          default: 'other',
        },
      },
    ],

    importance: {
      type: String,
      enum: ['minor', 'moderate', 'major', 'critical'],
      default: 'moderate',
    },
    tags: [String],
    notes: String,

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
LocationSchema.index({ campaignId: 1, sessionId: 1 });
LocationSchema.index({ name: 1 });
LocationSchema.index({ type: 1 });
LocationSchema.index({ discoveredAt: 1 });
LocationSchema.index({ lastVisited: 1 });
LocationSchema.index({ importance: 1 });

// Virtual for location age
LocationSchema.virtual('age').get(function () {
  return Date.now() - this.discoveredAt.getTime();
});

// Method to mark location as visited
LocationSchema.methods.markAsVisited = function (this: any, characterName: string) {
  this.lastVisited = new Date();
  this.visitCount += 1;

  // Add to discoveredBy if not already there
  if (!this.discoveredBy.includes(characterName)) {
    this.discoveredBy.push(characterName);
  }

  return this.save();
};

// Method to add occupant
LocationSchema.methods.addOccupant = function (this: any, characterName: string) {
  if (!this.currentOccupants.includes(characterName)) {
    this.currentOccupants.push(characterName);
  }
  return this.save();
};

// Method to remove occupant
LocationSchema.methods.removeOccupant = function (this: any, characterName: string) {
  this.currentOccupants = this.currentOccupants.filter(name => name !== characterName);
  return this.save();
};

// Static method to get locations for a campaign
LocationSchema.statics.getCampaignLocations = function (
  campaignId: string,
  limit: number = 50,
  offset: number = 0
) {
  return this.find({ campaignId, deleted: { $ne: true } })
    .sort({ lastVisited: -1 })
    .skip(offset)
    .limit(limit)
    .lean();
};

// Static method to get locations for a session
LocationSchema.statics.getSessionLocations = function (
  sessionId: string,
  limit: number = 50,
  offset: number = 0
) {
  return this.find({ sessionId, deleted: { $ne: true } })
    .sort({ lastVisited: -1 })
    .skip(offset)
    .limit(limit)
    .lean();
};

export default mongoose.model<ILocation, ILocationModel>('Location', LocationSchema);
