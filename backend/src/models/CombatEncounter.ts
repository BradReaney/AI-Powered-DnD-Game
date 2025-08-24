import mongoose, { Document, Schema } from 'mongoose';

export interface ICombatEncounter extends Document {
    id: string;
    campaignId: string;
    sessionId: string;
    name: string;
    description: string;
    location: string;
    difficulty: 'easy' | 'medium' | 'hard' | 'deadly';
    participants: Array<{
        id: string;
        name: string;
        type: 'character' | 'npc' | 'enemy';
        initiative: number;
        initiativeModifier: number;
        currentHP: number;
        maxHP: number;
        armorClass: number;
        status: 'active' | 'unconscious' | 'dead' | 'fleeing';
        conditions: string[];
        position: {
            x: number;
            y: number;
            z?: number;
        };
        actions: {
            action: boolean;
            bonusAction: boolean;
            reaction: boolean;
            movement: number;
        };
    }>;
    rounds: Array<{
        roundNumber: number;
        currentTurn: number;
        participants: Array<{
            id: string;
            name: string;
            type: 'character' | 'npc' | 'enemy';
            initiative: number;
            initiativeModifier: number;
            currentHP: number;
            maxHP: number;
            armorClass: number;
            status: 'active' | 'unconscious' | 'dead' | 'fleeing';
            conditions: string[];
            position: {
                x: number;
                y: number;
                z?: number;
            };
            actions: {
                action: boolean;
                bonusAction: boolean;
                reaction: boolean;
                movement: number;
            };
        }>;
        turnOrder: string[];
        actions: Array<{
            id: string;
            roundNumber: number;
            turnNumber: number;
            actorId: string;
            targetId?: string;
            actionType: 'attack' | 'spell' | 'move' | 'dash' | 'dodge' | 'help' | 'hide' | 'ready' | 'search' | 'use-object';
            description: string;
            attackRoll?: number;
            attackModifier?: number;
            damageRoll?: number;
            damageType?: string;
            success: boolean;
            critical: boolean;
            consequences: string[];
            timestamp: Date;
        }>;
        environmentalEffects: string[];
        roundStartTime: Date;
        roundEndTime?: Date;
    }>;
    currentRound: number;
    currentTurn: number;
    status: 'preparing' | 'active' | 'paused' | 'completed';
    startTime: Date;
    endTime?: Date;
    environmentalFactors: string[];
    victoryConditions: string[];
    defeatConditions: string[];
    createdAt: Date;
    updatedAt: Date;
}

const CombatEncounterSchema = new Schema<ICombatEncounter>(
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
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        location: {
            type: String,
            required: true,
        },
        difficulty: {
            type: String,
            enum: ['easy', 'medium', 'hard', 'deadly'],
            default: 'medium',
        },
        participants: [{
            id: String,
            name: String,
            type: {
                type: String,
                enum: ['character', 'npc', 'enemy'],
            },
            initiative: Number,
            initiativeModifier: Number,
            currentHP: Number,
            maxHP: Number,
            armorClass: Number,
            status: {
                type: String,
                enum: ['active', 'unconscious', 'dead', 'fleeing'],
                default: 'active',
            },
            conditions: [String],
            position: {
                x: Number,
                y: Number,
                z: Number,
            },
            actions: {
                action: { type: Boolean, default: true },
                bonusAction: { type: Boolean, default: true },
                reaction: { type: Boolean, default: true },
                movement: { type: Number, default: 0 },
            },
        }],
        rounds: [{
            roundNumber: Number,
            currentTurn: Number,
            participants: [{
                id: String,
                name: String,
                type: {
                    type: String,
                    enum: ['character', 'npc', 'enemy'],
                },
                initiative: Number,
                initiativeModifier: Number,
                currentHP: Number,
                maxHP: Number,
                armorClass: Number,
                status: {
                    type: String,
                    enum: ['active', 'unconscious', 'dead', 'fleeing'],
                    default: 'active',
                },
                conditions: [String],
                position: {
                    x: Number,
                    y: Number,
                    z: Number,
                },
                actions: {
                    action: { type: Boolean, default: true },
                    bonusAction: { type: Boolean, default: true },
                    reaction: { type: Boolean, default: true },
                    movement: { type: Number, default: 0 },
                },
            }],
            turnOrder: [String],
            actions: [{
                id: String,
                roundNumber: Number,
                turnNumber: Number,
                actorId: String,
                targetId: String,
                actionType: {
                    type: String,
                    enum: ['attack', 'spell', 'move', 'dash', 'dodge', 'help', 'hide', 'ready', 'search', 'use-object'],
                },
                description: String,
                attackRoll: Number,
                attackModifier: Number,
                damageRoll: Number,
                damageType: String,
                success: Boolean,
                critical: Boolean,
                consequences: [String],
                timestamp: Date,
            }],
            environmentalEffects: [String],
            roundStartTime: Date,
            roundEndTime: Date,
        }],
        currentRound: {
            type: Number,
            default: 0,
        },
        currentTurn: {
            type: Number,
            default: 0,
        },
        status: {
            type: String,
            enum: ['preparing', 'active', 'paused', 'completed'],
            default: 'preparing',
        },
        startTime: {
            type: Date,
            default: Date.now,
        },
        endTime: Date,
        environmentalFactors: [String],
        victoryConditions: [String],
        defeatConditions: [String],
    },
    {
        timestamps: true,
        collection: 'combat_encounters',
    }
);

// Indexes for better query performance
CombatEncounterSchema.index({ campaignId: 1, sessionId: 1 });
CombatEncounterSchema.index({ status: 1 });
CombatEncounterSchema.index({ createdAt: -1 });

export const CombatEncounter = mongoose.model<ICombatEncounter>('CombatEncounter', CombatEncounterSchema);
export default CombatEncounter;
