import { Server as SocketIOServer } from 'socket.io';
import logger from './LoggerService';
import { Session } from '../models';
import GameEngineService from './GameEngineService';

export interface SessionMetadata {
  name: string;
  dm: string;
  location: string;
  weather: string;
  timeOfDay: string;
  startTime: Date;
  endTime?: Date;
  participants: string[];
  tags: string[];
  difficulty: 'easy' | 'medium' | 'hard' | 'deadly';
  sessionType: 'combat' | 'roleplay' | 'exploration' | 'mixed';
  notes?: string;
}

export interface SessionAnalytics {
  sessionId: string;
  duration: number;
  participantCount: number;
  storyEventsCount: number;
  combatRounds: number;
  skillChecksCount: number;
  aiResponsesCount: number;
  averageResponseTime: number;
  playerEngagement: number;
  difficultyRating: number;
  completionRate: number;
}

export interface SessionComparison {
  session1: SessionAnalytics;
  session2: SessionAnalytics;
  differences: {
    duration: number;
    participantCount: number;
    storyEventsCount: number;
    combatRounds: number;
    skillChecksCount: number;
    aiResponsesCount: number;
    averageResponseTime: number;
    playerEngagement: number;
    difficultyRating: number;
    completionRate: number;
  };
  similarities: string[];
  recommendations: string[];
}

export class SessionService {
  private static instance: SessionService;
  private gameEngineService: GameEngineService | null = null;
  private io: SocketIOServer | null = null;

  private constructor() {}

  public static getInstance(): SessionService {
    if (!SessionService.instance) {
      SessionService.instance = new SessionService();
    }
    return SessionService.instance;
  }

  public setGameEngineService(gameEngineService: GameEngineService): void {
    this.gameEngineService = gameEngineService;
  }

  public setSocketIO(io: SocketIOServer): void {
    this.io = io;
  }

  // Session comparison tools
  public async compareSessions(session1Id: string, session2Id: string): Promise<SessionComparison> {
    try {
      const session1 = await this.getSessionAnalytics(session1Id);
      const session2 = await this.getSessionAnalytics(session2Id);

      if (!session1 || !session2) {
        throw new Error('One or both sessions not found');
      }

      const differences = {
        duration: Math.abs(session1.duration - session2.duration),
        participantCount: Math.abs(session1.participantCount - session2.participantCount),
        storyEventsCount: Math.abs(session1.storyEventsCount - session2.storyEventsCount),
        combatRounds: Math.abs(session1.combatRounds - session2.combatRounds),
        skillChecksCount: Math.abs(session1.skillChecksCount - session2.skillChecksCount),
        aiResponsesCount: Math.abs(session1.aiResponsesCount - session2.aiResponsesCount),
        averageResponseTime: Math.abs(session1.averageResponseTime - session2.averageResponseTime),
        playerEngagement: Math.abs(session1.playerEngagement - session2.playerEngagement),
        difficultyRating: Math.abs(session1.difficultyRating - session2.difficultyRating),
        completionRate: Math.abs(session1.completionRate - session2.completionRate),
      };

      const similarities: string[] = [];
      if (Math.abs(session1.difficultyRating - session2.difficultyRating) < 0.5) {
        similarities.push('Similar difficulty level');
      }
      if (Math.abs(session1.participantCount - session2.participantCount) <= 1) {
        similarities.push('Similar group size');
      }
      if (Math.abs(session1.duration - session2.duration) < 30) {
        similarities.push('Similar session duration');
      }

      const recommendations: string[] = [];
      if (session1.completionRate > session2.completionRate) {
        recommendations.push(
          'Session 1 had better completion rate - consider applying its strategies to Session 2'
        );
      }
      if (session1.playerEngagement > session2.playerEngagement) {
        recommendations.push(
          'Session 1 had higher player engagement - analyze what made it more engaging'
        );
      }

      return {
        session1,
        session2,
        differences,
        similarities,
        recommendations,
      };
    } catch (error) {
      logger.error('Error comparing sessions:', error);
      throw error;
    }
  }

  // Cross-session character transfers
  public async transferCharacterToSession(
    characterId: string,
    fromSessionId: string,
    toSessionId: string
  ): Promise<boolean> {
    try {
      // Get character from source session
      const sourceSession = await Session.findById(fromSessionId);
      if (!sourceSession) {
        throw new Error('Source session not found');
      }

      // Check if character exists in source session
      const characterInSource = sourceSession.gameState.activeCharacters.find(
        c => c.toString() === characterId
      );
      if (!characterInSource) {
        throw new Error('Character not found in source session');
      }

      // Get target session
      const targetSession = await Session.findById(toSessionId);
      if (!targetSession) {
        throw new Error('Target session not found');
      }

      // Check if character already exists in target session
      const characterInTarget = targetSession.gameState.activeCharacters.find(
        c => c.toString() === characterId
      );
      if (characterInTarget) {
        throw new Error('Character already exists in target session');
      }

      // Transfer character
      await Session.findByIdAndUpdate(fromSessionId, {
        $pull: { 'gameState.activeCharacters': characterId },
      });

      await Session.findByIdAndUpdate(toSessionId, {
        $push: { 'gameState.activeCharacters': characterId },
      });

      logger.info(
        `Character ${characterId} transferred from session ${fromSessionId} to ${toSessionId}`
      );
      return true;
    } catch (error) {
      logger.error('Error transferring character:', error);
      throw error;
    }
  }

  // Campaign timeline system
  public async getCampaignTimeline(campaignId: string): Promise<any[]> {
    try {
      const sessions = await Session.find({ campaignId }).sort({ startTime: 1 }).lean();

      const timeline = sessions.map(session => ({
        id: session._id,
        type: 'session',
        title: session.name,
        date: session.metadata.startTime,
        description: `Session: ${session.name}`,
        participants: session.metadata.players.map(p => p.characterId.toString() || 'Unknown'),
        metadata: {
          location: session.metadata.location,
          weather: session.metadata.weather,
          timeOfDay: session.metadata.timeOfDay,
          difficulty: 'medium', // Default value since not stored in model
          sessionType: 'mixed', // Default value since not stored in model
        },
      }));

      // Add story events to timeline
      const storyEvents = await this.getCampaignStoryEvents(campaignId);
      timeline.push(
        ...storyEvents.map(event => ({
          id: event._id,
          type: 'story_event',
          title: event.title,
          date: event.timestamp,
          description: event.description,
          participants: event.participants || [],
          metadata: {
            location: event.location || 'Unknown',
            weather: 'Unknown',
            timeOfDay: 'afternoon' as const, // Use valid union type
            difficulty: 'Unknown',
            sessionType: 'Unknown',
            eventType: event.type,
            consequences: event.consequences || [],
          },
        }))
      );

      // Sort by date
      timeline.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      return timeline;
    } catch (error) {
      logger.error('Error getting campaign timeline:', error);
      throw error;
    }
  }

  // Session analytics
  public async getSessionAnalytics(sessionId: string): Promise<SessionAnalytics | null> {
    try {
      const session = await Session.findById(sessionId);
      if (!session) {
        return null;
      }

      // Calculate analytics based on session data
      const duration = session.metadata.endTime
        ? (new Date(session.metadata.endTime).getTime() -
            new Date(session.metadata.startTime).getTime()) /
          (1000 * 60) // minutes
        : 0;

      const storyEventsCount = session.storyEvents?.length || 0;
      const combatRounds = session.gameState.combatState.round || 0;
      const skillChecksCount =
        session.storyEvents?.filter(event => event.type === 'skill_check').length || 0;
      const aiResponsesCount =
        session.storyEvents?.filter(event => event.type === 'ai-response').length || 0;

      // Calculate average response time (placeholder - would need actual timing data)
      const averageResponseTime = 2.5; // seconds

      // Calculate player engagement (placeholder - would need actual engagement metrics)
      const playerEngagement = 0.8; // 0-1 scale

      // Calculate difficulty rating (placeholder - would need actual difficulty data)
      const difficultyRating = 0.6; // 0-1 scale

      // Calculate completion rate (placeholder - would need actual completion data)
      const completionRate = 0.9; // 0-1 scale

      return {
        sessionId,
        duration,
        participantCount: session.metadata.players.length,
        storyEventsCount,
        combatRounds,
        skillChecksCount,
        aiResponsesCount,
        averageResponseTime,
        playerEngagement,
        difficultyRating,
        completionRate,
      };
    } catch (error) {
      logger.error('Error getting session analytics:', error);
      throw error;
    }
  }

  // Session search and filtering
  public async searchSessions(filters: {
    campaignId?: string;
    dm?: string;
    tags?: string[];
    difficulty?: string[];
    sessionType?: string[];
    dateRange?: { start: Date; end: Date };
    participantCount?: { min: number; max: number };
    searchTerm?: string;
  }): Promise<any[]> {
    try {
      const query: any = {};

      if (filters.campaignId) {
        query.campaignId = filters.campaignId;
      }

      if (filters.dm) {
        query['metadata.dm'] = { $regex: filters.dm, $options: 'i' };
      }

      if (filters.tags && filters.tags.length > 0) {
        query.tags = { $in: filters.tags };
      }

      if (filters.difficulty && filters.difficulty.length > 0) {
        query['metadata.difficulty'] = { $in: filters.difficulty };
      }

      if (filters.sessionType && filters.sessionType.length > 0) {
        query['metadata.sessionType'] = { $in: filters.sessionType };
      }

      if (filters.dateRange) {
        query['metadata.startTime'] = {
          $gte: filters.dateRange.start,
          $lte: filters.dateRange.end,
        };
      }

      if (filters.participantCount) {
        query['metadata.players.0'] = { $exists: true }; // Ensure players exist
        // Note: MongoDB doesn't support count queries directly, would need aggregation
      }

      if (filters.searchTerm) {
        query.$or = [
          { name: { $regex: filters.searchTerm, $options: 'i' } },
          { 'notes.dmNotes': { $regex: filters.searchTerm, $options: 'i' } },
          { 'metadata.location': { $regex: filters.searchTerm, $options: 'i' } },
        ];
      }

      const sessions = await Session.find(query).sort({ startTime: -1 }).lean();

      return sessions;
    } catch (error) {
      logger.error('Error searching sessions:', error);
      throw error;
    }
  }

  // Session tagging
  public async addSessionTags(sessionId: string, tags: string[]): Promise<void> {
    try {
      await Session.findByIdAndUpdate(sessionId, {
        $addToSet: { tags: { $each: tags } },
      });
      logger.info(`Added tags ${tags.join(', ')} to session ${sessionId}`);
    } catch (error) {
      logger.error('Error adding session tags:', error);
      throw error;
    }
  }

  public async removeSessionTags(sessionId: string, tags: string[]): Promise<void> {
    try {
      await Session.findByIdAndUpdate(sessionId, {
        $pull: { tags: { $in: tags } },
      });
      logger.info(`Removed tags ${tags.join(', ')} from session ${sessionId}`);
    } catch (error) {
      logger.error('Error removing session tags:', error);
      throw error;
    }
  }

  // Advanced archiving
  public async archiveSession(sessionId: string, archiveReason: string): Promise<void> {
    try {
      const session = await Session.findById(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      // Create archive record
      // eslint-disable-next-line no-unused-vars
      const _archiveData = {
        sessionId: session._id,
        campaignId: session.campaignId,
        archivedAt: new Date(),
        archivedBy: 'system', // Would be user ID in real implementation
        archiveReason,
        originalData: session.toObject(),
        analytics: await this.getSessionAnalytics(sessionId),
      };

      // Store archive (this would typically go to a separate collection)
      // For now, we'll mark the session as archived using the status field
      await Session.findByIdAndUpdate(sessionId, {
        status: 'archived',
        $set: {
          'metadata.archivedAt': new Date(),
          'metadata.archiveReason': archiveReason,
        },
      });

      logger.info(`Archived session ${sessionId}: ${archiveReason}`);
    } catch (error) {
      logger.error('Error archiving session:', error);
      throw error;
    }
  }

  public async restoreSession(sessionId: string): Promise<void> {
    try {
      const session = await Session.findById(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      if (session.status !== 'archived') {
        throw new Error('Session is not archived');
      }

      await Session.findByIdAndUpdate(sessionId, {
        status: 'active',
        $unset: { 'metadata.archivedAt': 1, 'metadata.archiveReason': 1 },
      });

      logger.info(`Restored archived session ${sessionId}`);
    } catch (error) {
      logger.error('Error restoring session:', error);
      throw error;
    }
  }

  // Session sharing features
  public async shareSession(
    sessionId: string,
    shareWith: string[],
    permissions: 'read' | 'write' | 'admin'
  ): Promise<void> {
    try {
      const session = await Session.findById(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      // Add sharing permissions
      const sharingData = shareWith.map(userId => ({
        userId,
        permissions,
        sharedAt: new Date(),
      }));

      await Session.findByIdAndUpdate(sessionId, {
        $addToSet: { sharedWith: { $each: sharingData } },
      });

      logger.info(`Shared session ${sessionId} with ${shareWith.length} users`);
    } catch (error) {
      logger.error('Error sharing session:', error);
      throw error;
    }
  }

  // Data migration and cleanup methods
  public async migrateSessionData(): Promise<{ updated: number; errors: number }> {
    try {
      logger.info('Starting session data migration...');

      let updated = 0;
      let errors = 0;

      // Find sessions with incomplete or missing data
      const sessionsToUpdate = await Session.find({
        $or: [
          { 'metadata.dm': { $exists: false } },
          { 'metadata.dm': null },
          { 'metadata.dm': '' },
          { 'metadata.dm': 'Unknown' },
          { 'metadata.location': { $exists: false } },
          { 'metadata.location': null },
          { 'metadata.location': '' },
          { 'metadata.location': 'Unknown' },
          { 'metadata.weather': { $exists: false } },
          { 'metadata.weather': null },
          { 'metadata.weather': '' },
          { 'metadata.timeOfDay': { $exists: false } },
          { 'metadata.timeOfDay': null },
          { 'metadata.timeOfDay': '' },
        ],
      });

      logger.info(`Found ${sessionsToUpdate.length} sessions requiring data migration`);

      for (const session of sessionsToUpdate) {
        try {
          let needsUpdate = false;
          const updates: any = {};

          // Fix DM field
          if (
            !session.metadata.dm ||
            session.metadata.dm === 'Unknown' ||
            session.metadata.dm === ''
          ) {
            updates['metadata.dm'] = session.createdBy || 'Game Master';
            needsUpdate = true;
          }

          // Fix location field
          if (
            !session.metadata.location ||
            session.metadata.location === 'Unknown' ||
            session.metadata.location === ''
          ) {
            updates['metadata.location'] = 'Starting Location';
            needsUpdate = true;
          }

          // Fix weather field
          if (
            !session.metadata.weather ||
            session.metadata.weather === 'Unknown' ||
            session.metadata.weather === ''
          ) {
            updates['metadata.weather'] = 'Clear';
            needsUpdate = true;
          }

          // Fix timeOfDay field
          if (
            !session.metadata.timeOfDay ||
            !['dawn', 'morning', 'noon', 'afternoon', 'dusk', 'night', 'midnight'].includes(
              session.metadata.timeOfDay
            )
          ) {
            updates['metadata.timeOfDay'] = 'morning';
            needsUpdate = true;
          }

          // Fix startTime if missing
          if (!session.metadata.startTime) {
            updates['metadata.startTime'] = session.createdAt || new Date();
            needsUpdate = true;
          }

          // Fix session name if missing or too short
          if (!session.name || session.name.trim().length < 3) {
            const defaultName = `Session ${session.sessionNumber}`;
            if (session.metadata.location && session.metadata.location !== 'Starting Location') {
              updates.name = `Session ${session.sessionNumber} - ${session.metadata.location}`;
            } else {
              updates.name = defaultName;
            }
            needsUpdate = true;
          }

          if (needsUpdate) {
            await Session.findByIdAndUpdate(session._id, { $set: updates });
            updated++;
            logger.info(`Updated session ${session._id} with missing data`);
          }
        } catch (error) {
          errors++;
          logger.error(`Error updating session ${session._id}:`, error);
        }
      }

      logger.info(`Session data migration completed. Updated: ${updated}, Errors: ${errors}`);
      return { updated, errors };
    } catch (error) {
      logger.error('Error during session data migration:', error);
      throw error;
    }
  }

  public async validateSessionDataIntegrity(): Promise<{
    total: number;
    valid: number;
    invalid: number;
    issues: Array<{ sessionId: string; issues: string[] }>;
  }> {
    try {
      const allSessions = await Session.find({});
      const results = {
        total: allSessions.length,
        valid: 0,
        invalid: 0,
        issues: [] as Array<{ sessionId: string; issues: string[] }>,
      };

      for (const session of allSessions) {
        const issues: string[] = [];

        // Check required fields
        if (!session.name || session.name.trim().length < 3) {
          issues.push('Session name is missing or too short (min 3 characters)');
        }

        if (!session.metadata.dm || session.metadata.dm.trim().length < 2) {
          issues.push('DM name is missing or too short (min 2 characters)');
        }

        if (!session.metadata.location || session.metadata.location.trim().length < 2) {
          issues.push('Location is missing or too short (min 2 characters)');
        }

        if (!session.metadata.weather || session.metadata.weather.trim().length < 2) {
          issues.push('Weather is missing or too short (min 2 characters)');
        }

        if (!session.metadata.timeOfDay) {
          issues.push('Time of day is missing');
        }

        if (!session.metadata.startTime) {
          issues.push('Start time is missing');
        }

        // Check data consistency
        if (session.metadata.endTime && session.metadata.startTime) {
          if (session.metadata.endTime <= session.metadata.startTime) {
            issues.push('End time must be after start time');
          }
        }

        if (session.metadata.duration < 0) {
          issues.push('Duration cannot be negative');
        }

        if (issues.length > 0) {
          results.invalid++;
          results.issues.push({
            sessionId: session._id.toString(),
            issues,
          });
        } else {
          results.valid++;
        }
      }

      return results;
    } catch (error) {
      logger.error('Error validating session data integrity:', error);
      throw error;
    }
  }

  public async getSessionDataQualityReport(): Promise<{
    totalSessions: number;
    completeData: number;
    incompleteData: number;
    dataQualityScore: number;
    commonIssues: Array<{ issue: string; count: number }>;
    recommendations: string[];
  }> {
    try {
      const integrityReport = await this.validateSessionDataIntegrity();

      // Analyze common issues
      const issueCounts: { [key: string]: number } = {};
      integrityReport.issues.forEach(({ issues }) => {
        issues.forEach(issue => {
          issueCounts[issue] = (issueCounts[issue] || 0) + 1;
        });
      });

      const commonIssues = Object.entries(issueCounts)
        .map(([issue, count]) => ({ issue, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      const dataQualityScore = Math.round((integrityReport.valid / integrityReport.total) * 100);

      const recommendations = [];
      if (dataQualityScore < 90) {
        recommendations.push('Run data migration to fix incomplete session data');
      }
      if (commonIssues.some(issue => issue.issue.includes('name'))) {
        recommendations.push('Review and update session naming conventions');
      }
      if (commonIssues.some(issue => issue.issue.includes('DM'))) {
        recommendations.push('Ensure all sessions have valid DM information');
      }
      if (commonIssues.some(issue => issue.issue.includes('location'))) {
        recommendations.push('Update session locations with descriptive names');
      }

      return {
        totalSessions: integrityReport.total,
        completeData: integrityReport.valid,
        incompleteData: integrityReport.invalid,
        dataQualityScore,
        commonIssues,
        recommendations,
      };
    } catch (error) {
      logger.error('Error generating session data quality report:', error);
      throw error;
    }
  }

  // Helper method to get campaign story events
  private async getCampaignStoryEvents(_campaignId: string): Promise<any[]> {
    // This would typically query a StoryEvent collection
    // For now, return empty array
    return [];
  }

  public async deleteSession(sessionId: string): Promise<void> {
    try {
      const session = await Session.findById(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      // Import required models for cascading delete
      const { Character, Location, Message, StoryEvent } = require('../models');

      // Delete all related data
      await Promise.all([
        // Delete all characters in this session
        Character.deleteMany({ sessionId }),

        // Delete all locations in this session
        Location.deleteMany({ sessionId }),

        // Delete all messages in this session
        Message.deleteMany({ sessionId }),

        // Delete all story events in this session
        StoryEvent.deleteMany({ sessionId }),

        // Finally delete the session itself
        Session.findByIdAndDelete(sessionId),
      ]);

      logger.info(`Deleted session: ${session.name} and all related data`);
    } catch (error) {
      logger.error('Error deleting session:', error);
      throw error;
    }
  }
}

export default SessionService;
