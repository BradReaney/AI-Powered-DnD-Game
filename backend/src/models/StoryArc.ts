import mongoose, { Schema, Document, Types } from 'mongoose';

// Story Beat interface - represents a significant story moment
export interface IStoryBeat {
  id: string;
  title: string;
  description: string;
  type: 'setup' | 'development' | 'climax' | 'resolution' | 'twist' | 'character' | 'world';
  importance: 'minor' | 'moderate' | 'major' | 'critical';
  chapter: number;
  act: number;
  characters: Types.ObjectId[];
  location?: string;
  npcs: string[];
  consequences: string[];
  completed: boolean;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Character Milestone interface - tracks character development
export interface ICharacterMilestone {
  characterId: Types.ObjectId;
  type: 'level' | 'relationship' | 'story' | 'personal' | 'skill' | 'achievement';
  title: string;
  description: string;
  impact: 'minor' | 'moderate' | 'major' | 'critical';
  storyBeatId?: string;
  achievedAt: Date;
  metadata?: Record<string, any>;
}

// World State Change interface - tracks world state modifications
export interface IWorldStateChange {
  id: string;
  type: 'location' | 'faction' | 'threat' | 'event' | 'relationship' | 'discovery';
  title: string;
  description: string;
  impact: 'minor' | 'moderate' | 'major' | 'catastrophic';
  affectedElements: string[];
  storyBeatId?: string;
  characterIds: Types.ObjectId[];
  location?: string;
  permanent?: boolean;
  occurredAt: Date;
}

// Quest Progress interface - tracks quest progression within story
export interface IQuestProgress {
  questId: Types.ObjectId;
  name: string;
  type: 'setup' | 'development' | 'climax' | 'resolution';
  status: 'active' | 'completed' | 'failed' | 'abandoned';
  storyBeatId?: string;
  objectives: Array<{
    description: string;
    completed: boolean;
    completedAt?: Date;
  }>;
  storyImpact: 'minor' | 'moderate' | 'major' | 'critical';
  characterDevelopment: Types.ObjectId[];
  worldChanges: string[];
}

// Main Story Arc interface
export interface IStoryArc extends Document {
  campaignId: Types.ObjectId;
  theme: string;
  tone: 'light' | 'serious' | 'dark' | 'humorous' | 'mysterious';
  pacing: 'slow' | 'normal' | 'fast';
  storyPhase: 'setup' | 'development' | 'climax' | 'resolution';
  currentChapter: number;
  currentAct: number;
  totalChapters: number;
  storyBeats: IStoryBeat[];
  characterMilestones: ICharacterMilestone[];
  worldStateChanges: IWorldStateChange[];
  questProgress: IQuestProgress[];
  completedStoryBeats: number;

  // Methods
  addStoryBeat(_beatData: Omit<IStoryBeat, 'id' | 'createdAt' | 'updatedAt'>): string;
  completeStoryBeat(_beatId: string, _outcome?: string, _notes?: string): boolean;
  addCharacterMilestone(_milestone: ICharacterMilestone): void;
  addWorldStateChange(_change: Omit<IWorldStateChange, 'id'>): string;
  updateQuestProgress(_questId: Types.ObjectId, _updates: Partial<IQuestProgress>): boolean;
  advanceChapter(): boolean;
}

// Story Beat Schema
const StoryBeatSchema = new Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: {
    type: String,
    enum: ['setup', 'development', 'climax', 'resolution', 'twist', 'character', 'world'],
    required: true,
  },
  importance: {
    type: String,
    enum: ['minor', 'moderate', 'major', 'critical'],
    required: true,
  },
  chapter: { type: Number, required: true },
  act: { type: Number, required: true },
  characters: [{ type: Schema.Types.ObjectId, ref: 'Character' }],
  location: { type: String },
  npcs: [{ type: String }],
  consequences: [{ type: String }],
  completed: { type: Boolean, default: false },
  completedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Character Milestone Schema
const CharacterMilestoneSchema = new Schema({
  characterId: { type: Schema.Types.ObjectId, ref: 'Character', required: true },
  type: {
    type: String,
    enum: ['level', 'relationship', 'story', 'personal', 'skill', 'achievement'],
    required: true,
  },
  title: { type: String, required: true },
  description: { type: String, required: true },
  impact: {
    type: String,
    enum: ['minor', 'moderate', 'major', 'critical'],
    required: true,
  },
  storyBeatId: { type: String },
  achievedAt: { type: Date, default: Date.now },
  metadata: { type: Schema.Types.Mixed },
});

// World State Change Schema
const WorldStateChangeSchema = new Schema({
  id: { type: String, required: true },
  type: {
    type: String,
    enum: ['location', 'faction', 'threat', 'event', 'relationship', 'discovery'],
    required: true,
  },
  title: { type: String, required: true },
  description: { type: String, required: true },
  impact: {
    type: String,
    enum: ['minor', 'moderate', 'major', 'catastrophic'],
    required: true,
  },
  affectedElements: [{ type: String }],
  storyBeatId: { type: String },
  characterIds: [{ type: Schema.Types.ObjectId, ref: 'Character' }],
  location: { type: String },
  permanent: { type: Boolean, default: false },
  occurredAt: { type: Date, default: Date.now },
});

// Quest Progress Schema
const QuestProgressSchema = new Schema({
  questId: { type: Schema.Types.ObjectId, ref: 'Quest', required: true },
  name: { type: String, required: true },
  type: {
    type: String,
    enum: ['setup', 'development', 'climax', 'resolution'],
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'failed', 'abandoned'],
    default: 'active',
  },
  storyBeatId: { type: String },
  objectives: [
    {
      description: { type: String, required: true },
      completed: { type: Boolean, default: false },
      completedAt: { type: Date },
    },
  ],
  storyImpact: {
    type: String,
    enum: ['minor', 'moderate', 'major', 'critical'],
    required: true,
  },
  characterDevelopment: [{ type: Schema.Types.ObjectId, ref: 'Character' }],
  worldChanges: [{ type: String }],
});

// Main Story Arc Schema
const StoryArcSchema = new Schema(
  {
    campaignId: { type: Schema.Types.ObjectId, ref: 'Campaign', required: true, unique: true },
    theme: { type: String, required: true },
    tone: {
      type: String,
      enum: ['light', 'serious', 'dark', 'humorous', 'mysterious'],
      default: 'serious',
    },
    pacing: {
      type: String,
      enum: ['slow', 'normal', 'fast'],
      default: 'normal',
    },
    storyPhase: {
      type: String,
      enum: ['setup', 'development', 'climax', 'resolution'],
      default: 'setup',
    },
    currentChapter: { type: Number, default: 1 },
    currentAct: { type: Number, default: 1 },
    totalChapters: { type: Number, default: 10 },
    storyBeats: [StoryBeatSchema],
    characterMilestones: [CharacterMilestoneSchema],
    worldStateChanges: [WorldStateChangeSchema],
    questProgress: [QuestProgressSchema],
    completedStoryBeats: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

// Add methods to the schema
StoryArcSchema.methods.addStoryBeat = function (
  beatData: Omit<IStoryBeat, 'id' | 'createdAt' | 'updatedAt'>
): string {
  const beatId = `beat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const storyBeat: IStoryBeat = {
    ...beatData,
    id: beatId,
    completed: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  this.storyBeats.push(storyBeat);
  return beatId;
};

StoryArcSchema.methods.completeStoryBeat = function (
  beatId: string,
  outcome?: string,
  notes?: string
): boolean {
  const beat = this.storyBeats.find((b: IStoryBeat) => b.id === beatId);
  if (beat && !beat.completed) {
    beat.completed = true;
    beat.completedAt = new Date();
    beat.updatedAt = new Date();
    if (outcome) {
      beat.outcome = outcome;
    }
    if (notes) {
      beat.notes = notes;
    }
    this.completedStoryBeats = this.storyBeats.filter((b: IStoryBeat) => b.completed).length;
    return true;
  }
  return false;
};

StoryArcSchema.methods.addCharacterMilestone = function (milestone: ICharacterMilestone): void {
  this.characterMilestones.push(milestone);
};

StoryArcSchema.methods.addWorldStateChange = function (
  change: Omit<IWorldStateChange, 'id'>
): string {
  const changeId = `change_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const worldStateChange: IWorldStateChange = {
    ...change,
    id: changeId,
  };

  this.worldStateChanges.push(worldStateChange);
  return changeId;
};

StoryArcSchema.methods.updateQuestProgress = function (
  questId: Types.ObjectId,
  updates: Partial<IQuestProgress>
): boolean {
  const questIndex = this.questProgress.findIndex(
    (q: IQuestProgress) => q.questId.toString() === questId.toString()
  );

  if (questIndex !== -1) {
    Object.assign(this.questProgress[questIndex], updates);
    return true;
  }
  return false;
};

StoryArcSchema.methods.advanceChapter = function (): boolean {
  if (this.currentChapter < this.totalChapters) {
    this.currentChapter += 1;

    // Update story phase based on progress
    const progress = this.currentChapter / this.totalChapters;
    if (progress <= 0.25) {
      this.storyPhase = 'setup';
    } else if (progress <= 0.75) {
      this.storyPhase = 'development';
    } else if (progress <= 0.9) {
      this.storyPhase = 'climax';
    } else {
      this.storyPhase = 'resolution';
    }

    // Update act based on story phase
    if (this.storyPhase === 'setup') {
      this.currentAct = 1;
    } else if (this.storyPhase === 'development') {
      this.currentAct = 2;
    } else if (this.storyPhase === 'climax') {
      this.currentAct = 3;
    } else {
      this.currentAct = 4;
    }

    return true;
  }
  return false;
};

// Create and export the model
const StoryArc = mongoose.model<IStoryArc>('StoryArc', StoryArcSchema);

export { StoryArc };
export default StoryArc;
