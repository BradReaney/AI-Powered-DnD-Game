# Regression Baseline: Sessions Routes

**File**: `backend/src/routes/sessions.ts` (1211 lines)
**Status**: OVERLY COMPLEX - NEEDS MAJOR REFACTORING
**Last Updated**: Before refactoring

## Endpoint Inventory & Current Behavior

### **Core Session Management (KEEP)**

#### `GET /api/sessions/approaching-inactivity`
- **File Location**: `backend/src/routes/sessions.ts:32-50`
- **Purpose**: Get sessions approaching inactivity threshold
- **Status**: KEEP
- **Request**: 
  - Method: GET
  - Query Params: `threshold` (number, default: 45 minutes)
- **Response**: 
  - Success: 200 OK
  - Body: `{ message: string, sessions: array, thresholdMinutes: number, count: number }`
- **Business Logic**: Calls `sessionService.getSessionsApproachingInactivity(thresholdMinutes)`
- **Dependencies**: SessionService
- **Current Issues**: None identified

#### `GET /api/sessions/campaign/:campaignId`
- **File Location**: `backend/src/routes/sessions.ts:55-75`
- **Purpose**: Get all sessions for a campaign
- **Status**: KEEP
- **Request**:
  - Method: GET
  - URL Params: `campaignId` (ObjectId)
- **Response**:
  - Success: 200 OK
  - Body: `{ message: string, campaignId: string, sessions: array }`
- **Business Logic**: Calls `sessionService.searchSessions({ campaignId })`
- **Dependencies**: SessionService
- **Current Issues**: None identified

#### `GET /api/sessions/new`
- **File Location**: `backend/src/routes/sessions.ts:77-170`
- **Purpose**: Get session creation form state with validation rules
- **Status**: KEEP
- **Request**: Method: GET
- **Response**:
  - Success: 200 OK
  - Body: Complete form state object with validation rules, tips, and available options
- **Business Logic**: Returns hardcoded form configuration (no database calls)
- **Dependencies**: None
- **Current Issues**: Large hardcoded response (93 lines of configuration)

#### `POST /api/sessions/`
- **File Location**: `backend/src/routes/sessions.ts:172-280`
- **Purpose**: Create new session
- **Status**: KEEP
- **Request**:
  - Method: POST
  - Body: `{ campaignId, name, dm, location?, weather?, timeOfDay? }`
- **Response**:
  - Success: 201 Created
  - Body: `{ message: string, session: object }`
- **Business Logic**: 
  - Validates required fields and data types
  - Calls `gameEngineService.createSession(campaignId, sessionConfig)`
- **Dependencies**: GameEngineService
- **Current Issues**: Complex validation logic (108 lines)

#### `GET /api/sessions/:sessionId`
- **File Location**: `backend/src/routes/sessions.ts:300-320`
- **Purpose**: Get session by ID with analytics
- **Status**: KEEP
- **Request**:
  - Method: GET
  - URL Params: `sessionId` (ObjectId)
- **Response**:
  - Success: 200 OK
  - Body: `{ message: string, sessionId: string, session: object }`
- **Business Logic**: Calls `sessionService.getSessionAnalytics(sessionId)`
- **Dependencies**: SessionService
- **Current Issues**: None identified

#### `PUT /api/sessions/:sessionId/end`
- **File Location**: `backend/src/routes/sessions.ts:322-340`
- **Purpose**: End session with summary
- **Status**: KEEP
- **Request**:
  - Method: PUT
  - URL Params: `sessionId` (ObjectId)
  - Body: `{ summary: string }`
- **Response**:
  - Success: 200 OK
  - Body: `{ message: string }`
- **Business Logic**: Calls `gameEngineService.endSession(sessionId, summary)`
- **Dependencies**: GameEngineService
- **Current Issues**: None identified

#### `DELETE /api/sessions/:sessionId`
- **File Location**: `backend/src/routes/sessions.ts:1180-1200`
- **Purpose**: Delete session (hard delete)
- **Status**: KEEP
- **Request**:
  - Method: DELETE
  - URL Params: `sessionId` (ObjectId)
- **Response**:
  - Success: 200 OK
  - Body: `{ message: string }`
- **Business Logic**: Calls `sessionService.deleteSession(sessionId)`
- **Dependencies**: SessionService
- **Current Issues**: None identified

### **Session Activity & Continuity (KEEP)**

#### `GET /api/sessions/active/list`
- **File Location**: `backend/src/routes/sessions.ts:172-185`
- **Purpose**: Get active sessions
- **Status**: KEEP
- **Request**: Method: GET
- **Response**:
  - Success: 200 OK
  - Body: `{ activeSessions: array }`
- **Business Logic**: Calls `gameEngineService.getActiveSessions()`
- **Dependencies**: GameEngineService
- **Current Issues**: None identified

#### `GET /api/sessions/active/continuity`
- **File Location**: `backend/src/routes/sessions.ts:187-250`
- **Purpose**: Get active sessions for continuity based on recent message activity
- **Status**: KEEP
- **Request**:
  - Method: GET
  - Query Params: `campaignId`, `characterId`
- **Response**:
  - Success: 200 OK
  - Body: `{ activeSessions: array, message: string }`
- **Business Logic**: 
  - Finds sessions with recent messages (within 24 hours)
  - Complex logic for session continuity (63 lines)
- **Dependencies**: Session model, Message model, mongoose
- **Current Issues**: Complex implementation with multiple database queries

#### `POST /api/sessions/:sessionId/activity`
- **File Location**: `backend/src/routes/sessions.ts:1200-1220`
- **Purpose**: Update session activity timestamp
- **Status**: KEEP
- **Request**:
  - Method: POST
  - URL Params: `sessionId` (ObjectId)
- **Response**:
  - Success: 200 OK
  - Body: `{ message: string, sessionId: string, timestamp: Date }`
- **Business Logic**: Calls `sessionService.updateSessionActivity(sessionId)`
- **Dependencies**: SessionService
- **Current Issues**: None identified

### **Session Data (CONSOLIDATE)**

#### `GET /api/sessions/:sessionId/messages` - DUPLICATE #1
- **File Location**: `backend/src/routes/sessions.ts:322-360`
- **Purpose**: Get messages for session
- **Status**: CONSOLIDATE (DUPLICATE - appears twice!)
- **Request**:
  - Method: GET
  - URL Params: `sessionId` (ObjectId)
  - Query Params: `limit` (default: 50), `offset` (default: 0)
- **Response**:
  - Success: 200 OK
  - Body: `{ message: string, sessionId: string, messages: array, pagination: object }`
- **Business Logic**: 
  - Calls `Message.getSessionMessages(sessionId, limit, offset, false)`
  - Gets total count for pagination
- **Dependencies**: Message model
- **Current Issues**: **DUPLICATE ENDPOINT** - appears again at line 920

#### `GET /api/sessions/:sessionId/messages` - DUPLICATE #2
- **File Location**: `backend/src/routes/sessions.ts:920-960`
- **Purpose**: Get chat history for session
- **Status**: CONSOLIDATE (DUPLICATE - appears twice!)
- **Request**: Same as above
- **Response**: Same as above
- **Business Logic**: Same as above
- **Dependencies**: Same as above
- **Current Issues**: **DUPLICATE ENDPOINT** - identical to the one at line 322

#### `POST /api/sessions/:sessionId/messages`
- **File Location**: `backend/src/routes/sessions.ts:800-860`
- **Purpose**: Send message in session
- **Status**: KEEP
- **Request**:
  - Method: POST
  - URL Params: `sessionId` (ObjectId)
  - Body: `{ content: string, characterId: string, campaignId: string }`
- **Response**:
  - Success: 201 Created
  - Body: Message object with metadata
- **Business Logic**: 
  - Creates new Message document
  - Saves to MongoDB
- **Dependencies**: Message model, Character model
- **Current Issues**: None identified

#### `POST /api/sessions/:sessionId/ai-response`
- **File Location**: `backend/src/routes/sessions.ts:862-920`
- **Purpose**: Get AI response for session
- **Status**: KEEP
- **Request**:
  - Method: POST
  - URL Params: `sessionId` (ObjectId)
  - Body: `{ message: string, characterId: string, campaignId: string }`
- **Response**:
  - Success: 201 Created
  - Body: AI message object with metadata
- **Business Logic**: 
  - Calls `gameEngineService.getAIResponse(sessionId, message, characterId)`
  - Creates and saves AI message
- **Dependencies**: GameEngineService, Message model
- **Current Issues**: None identified

#### `GET /api/sessions/:sessionId/game-state`
- **File Location**: `backend/src/routes/sessions.ts:560-580`
- **Purpose**: Get session game state
- **Status**: CONSOLIDATE (similar to /state endpoint)
- **Request**:
  - Method: GET
  - URL Params: `sessionId` (ObjectId)
- **Response**:
  - Success: 200 OK
  - Body: Game state object
- **Business Logic**: Calls `gameEngineService.getSessionGameState(sessionId)`
- **Dependencies**: GameEngineService
- **Current Issues**: Similar functionality to `/state` endpoint

#### `GET /api/sessions/:sessionId/state`
- **File Location**: `backend/src/routes/sessions.ts:980-1000`
- **Purpose**: Get session state
- **Status**: CONSOLIDATE (similar to /game-state endpoint)
- **Request**:
  - Method: GET
  - URL Params: `sessionId` (ObjectId)
- **Response**:
  - Success: 200 OK
  - Body: Session state object
- **Business Logic**: Calls `gameEngineService.getSessionState(sessionId)`
- **Dependencies**: GameEngineService
- **Current Issues**: Similar functionality to `/game-state` endpoint

### **Session Metadata (CONSOLIDATE)**

#### `PUT /api/sessions/:sessionId/metadata`
- **File Location**: `backend/src/routes/sessions.ts:700-720`
- **Purpose**: Update session metadata
- **Status**: CONSOLIDATE
- **Request**:
  - Method: PUT
  - URL Params: `sessionId` (ObjectId)
  - Body: Update data object
- **Response**:
  - Success: 200 OK
  - Body: `{ message: string, sessionId: string, updates: object }`
- **Business Logic**: **PLACEHOLDER IMPLEMENTATION** - returns mock response
- **Dependencies**: None (not implemented)
- **Current Issues**: Not actually implemented - just returns placeholder

#### `GET /api/sessions/:sessionId/participants`
- **File Location**: `backend/src/routes/sessions.ts:720-740`
- **Purpose**: Get session participants
- **Status**: CONSOLIDATE
- **Request**:
  - Method: GET
  - URL Params: `sessionId` (ObjectId)
- **Response**:
  - Success: 200 OK
  - Body: `{ message: string, sessionId: string, participants: array }`
- **Business Logic**: **PLACEHOLDER IMPLEMENTATION** - returns empty array
- **Dependencies**: None (not implemented)
- **Current Issues**: Not actually implemented - just returns placeholder

#### `POST /api/sessions/:sessionId/participants`
- **File Location**: `backend/src/routes/sessions.ts:740-760`
- **Purpose**: Add participant to session
- **Status**: CONSOLIDATE
- **Request**:
  - Method: POST
  - URL Params: `sessionId` (ObjectId)
  - Body: `{ characterId: string, playerId: string }`
- **Response**:
  - Success: 201 Created
  - Body: `{ message: string, sessionId: string, characterId: string, playerId: string }`
- **Business Logic**: **PLACEHOLDER IMPLEMENTATION** - returns mock response
- **Dependencies**: None (not implemented)
- **Current Issues**: Not actually implemented - just returns placeholder

#### `DELETE /api/sessions/:sessionId/participants/:characterId`
- **File Location**: `backend/src/routes/sessions.ts:760-780`
- **Purpose**: Remove participant from session
- **Status**: CONSOLIDATE
- **Request**:
  - Method: DELETE
  - URL Params: `sessionId` (ObjectId), `characterId` (ObjectId)
- **Response**:
  - Success: 200 OK
  - Body: `{ message: string, sessionId: string, characterId: string }`
- **Business Logic**: **PLACEHOLDER IMPLEMENTATION** - returns mock response
- **Dependencies**: None (not implemented)
- **Current Issues**: Not actually implemented - just returns placeholder

### **Session Content (CONSOLIDATE)**

#### `GET /api/sessions/:sessionId/story-events`
- **File Location**: `backend/src/routes/sessions.ts:640-660`
- **Purpose**: Get session story events
- **Status**: CONSOLIDATE
- **Request**:
  - Method: GET
  - URL Params: `sessionId` (ObjectId)
- **Response**:
  - Success: 200 OK
  - Body: `{ message: string, sessionId: string, events: array }`
- **Business Logic**: **PLACEHOLDER IMPLEMENTATION** - returns empty array
- **Dependencies**: None (not implemented)
- **Current Issues**: Not actually implemented - just returns placeholder

#### `POST /api/sessions/:sessionId/story-events`
- **File Location**: `backend/src/routes/sessions.ts:600-640`
- **Purpose**: Add story event to session
- **Status**: KEEP
- **Request**:
  - Method: POST
  - URL Params: `sessionId` (ObjectId)
  - Body: `{ title: string, description: string, type: string }`
- **Response**:
  - Success: 201 Created
  - Body: `{ message: string }`
- **Business Logic**: 
  - Validates event type
  - Calls `gameEngineService.addStoryEvent(sessionId, eventData)`
- **Dependencies**: GameEngineService
- **Current Issues**: None identified

#### `GET /api/sessions/:sessionId/notes`
- **File Location**: `backend/src/routes/sessions.ts:780-800`
- **Purpose**: Get session notes
- **Status**: CONSOLIDATE
- **Request**:
  - Method: GET
  - URL Params: `sessionId` (ObjectId)
- **Response**:
  - Success: 200 OK
  - Body: `{ message: string, sessionId: string, notes: object }`
- **Business Logic**: **PLACEHOLDER IMPLEMENTATION** - returns mock notes structure
- **Dependencies**: None (not implemented)
- **Current Issues**: Not actually implemented - just returns placeholder

#### `PUT /api/sessions/:sessionId/notes`
- **File Location**: `backend/src/routes/sessions.ts:800-820`
- **Purpose**: Update session notes
- **Status**: CONSOLIDATE
- **Request**:
  - Method: PUT
  - URL Params: `sessionId` (ObjectId)
  - Body: Notes data object
- **Response**:
  - Success: 200 OK
  - Body: `{ message: string, sessionId: string, notes: object }`
- **Business Logic**: **PLACEHOLDER IMPLEMENTATION** - returns mock response
- **Dependencies**: None (not implemented)
- **Current Issues**: Not actually implemented - just returns placeholder

#### `GET /api/sessions/:sessionId/outcomes`
- **File Location**: `backend/src/routes/sessions.ts:820-840`
- **Purpose**: Get session outcomes
- **Status**: CONSOLIDATE
- **Request**:
  - Method: GET
  - URL Params: `sessionId` (ObjectId)
- **Response**:
  - Success: 200 OK
  - Body: `{ message: string, sessionId: string, outcomes: object }`
- **Business Logic**: **PLACEHOLDER IMPLEMENTATION** - returns mock outcomes structure
- **Dependencies**: None (not implemented)
- **Current Issues**: Not actually implemented - just returns placeholder

#### `PUT /api/sessions/:sessionId/outcomes`
- **File Location**: `backend/src/routes/sessions.ts:840-860`
- **Purpose**: Update session outcomes
- **Status**: CONSOLIDATE
- **Request**:
  - Method: PUT
  - URL Params: `sessionId` (ObjectId)
  - Body: Outcomes data object
- **Response**:
  - Success: 200 OK
  - Body: `{ message: string, sessionId: string, outcomes: object }`
- **Business Logic**: **PLACEHOLDER IMPLEMENTATION** - returns mock response
- **Dependencies**: None (not implemented)
- **Current Issues**: Not actually implemented - just returns placeholder

### **Advanced Features (KEEP)**

#### `GET /api/sessions/campaign/:campaignId/timeline`
- **File Location**: `backend/src/routes/sessions.ts:1000-1020`
- **Purpose**: Get campaign timeline
- **Status**: KEEP
- **Request**:
  - Method: GET
  - URL Params: `campaignId` (ObjectId)
- **Response**:
  - Success: 200 OK
  - Body: `{ timeline: object }`
- **Business Logic**: Calls `sessionService.getCampaignTimeline(campaignId)`
- **Dependencies**: SessionService
- **Current Issues**: None identified

#### `POST /api/sessions/search`
- **File Location**: `backend/src/routes/sessions.ts:1020-1040`
- **Purpose**: Search and filter sessions
- **Status**: KEEP
- **Request**:
  - Method: POST
  - Body: Filters object
- **Response**:
  - Success: 200 OK
  - Body: `{ sessions: array, count: number }`
- **Business Logic**: Calls `sessionService.searchSessions(filters)`
- **Dependencies**: SessionService
- **Current Issues**: None identified

### **Advanced Features (MARKED FOR DELETION)**

#### `POST /api/sessions/compare`
- **File Location**: `backend/src/routes/sessions.ts:1040-1060`
- **Purpose**: Compare two sessions
- **Status**: MARKED FOR DELETION
- **Request**:
  - Method: POST
  - Body: `{ session1Id: string, session2Id: string }`
- **Response**:
  - Success: 200 OK
  - Body: Comparison object
- **Business Logic**: Calls `sessionService.compareSessions(session1Id, session2Id)`
- **Dependencies**: SessionService
- **Current Issues**: Marked for deletion per user request

#### `POST /api/sessions/transfer-character`
- **File Location**: `backend/src/routes/sessions.ts:1060-1080`
- **Purpose**: Transfer character between sessions
- **Status**: MARKED FOR DELETION
- **Request**:
  - Method: POST
  - Body: `{ characterId: string, fromSessionId: string, toSessionId: string }`
- **Response**:
  - Success: 200 OK
  - Body: `{ success: boolean, message: string }`
- **Business Logic**: Calls `sessionService.transferCharacterToSession(characterId, fromSessionId, toSessionId)`
- **Dependencies**: SessionService
- **Current Issues**: Marked for deletion per user request

#### `POST /api/sessions/:sessionId/tags`
- **File Location**: `backend/src/routes/sessions.ts:1080-1100`
- **Purpose**: Add tags to session
- **Status**: MARKED FOR DELETION
- **Request**:
  - Method: POST
  - URL Params: `sessionId` (ObjectId)
  - Body: `{ tags: array }`
- **Response**:
  - Success: 200 OK
  - Body: `{ message: string }`
- **Business Logic**: Calls `sessionService.addSessionTags(sessionId, tags)`
- **Dependencies**: SessionService
- **Current Issues**: Marked for deletion per user request

#### `DELETE /api/sessions/:sessionId/tags`
- **File Location**: `backend/src/routes/sessions.ts:1100-1120`
- **Purpose**: Remove tags from session
- **Status**: MARKED FOR DELETION
- **Request**:
  - Method: DELETE
  - URL Params: `sessionId` (ObjectId)
  - Body: `{ tags: array }`
- **Response**:
  - Success: 200 OK
  - Body: `{ message: string }`
- **Business Logic**: Calls `sessionService.removeSessionTags(sessionId, tags)`
- **Dependencies**: SessionService
- **Current Issues**: Marked for deletion per user request

#### `POST /api/sessions/:sessionId/archive`
- **File Location**: `backend/src/routes/sessions.ts:1120-1140`
- **Purpose**: Archive session
- **Status**: MARKED FOR DELETION
- **Request**:
  - Method: POST
  - URL Params: `sessionId` (ObjectId)
  - Body: `{ archiveReason: string }`
- **Response**:
  - Success: 200 OK
  - Body: `{ message: string }`
- **Business Logic**: Calls `sessionService.archiveSession(sessionId, archiveReason)`
- **Dependencies**: SessionService
- **Current Issues**: Marked for deletion per user request

#### `POST /api/sessions/:sessionId/restore`
- **File Location**: `backend/src/routes/sessions.ts:1140-1160`
- **Purpose**: Restore archived session
- **Status**: MARKED FOR DELETION
- **Request**:
  - Method: POST
  - URL Params: `sessionId` (ObjectId)
- **Response**:
  - Success: 200 OK
  - Body: `{ message: string }`
- **Business Logic**: Calls `sessionService.restoreSession(sessionId)`
- **Dependencies**: SessionService
- **Current Issues**: Marked for deletion per user request

#### `POST /api/sessions/:sessionId/share`
- **File Location**: `backend/src/routes/sessions.ts:1160-1180`
- **Purpose**: Share session
- **Status**: MARKED FOR DELETION
- **Request**:
  - Method: POST
  - URL Params: `sessionId` (ObjectId)
  - Body: `{ shareWith: array, permissions: object }`
- **Response**:
  - Success: 200 OK
  - Body: `{ message: string }`
- **Business Logic**: Calls `sessionService.shareSession(sessionId, shareWith, permissions)`
- **Dependencies**: SessionService
- **Current Issues**: Marked for deletion per user request

### **Data Management (MARKED FOR DELETION)**

#### `GET /api/sessions/data-quality-report`
- **File Location**: `backend/src/routes/sessions.ts:280-300`
- **Purpose**: Get data quality report
- **Status**: MARKED FOR DELETION
- **Request**: Method: GET
- **Response**:
  - Success: 200 OK
  - Body: `{ message: string, report: object }`
- **Business Logic**: Calls `sessionService.getSessionDataQualityReport()`
- **Dependencies**: SessionService
- **Current Issues**: Marked for deletion per user request

#### `GET /api/sessions/validate-integrity`
- **File Location**: `backend/src/routes/sessions.ts:300-320`
- **Purpose**: Validate data integrity
- **Status**: MARKED FOR DELETION
- **Request**: Method: GET
- **Response**:
  - Success: 200 OK
  - Body: `{ message: string, integrityReport: object }`
- **Business Logic**: Calls `sessionService.validateSessionDataIntegrity()`
- **Dependencies**: SessionService
- **Current Issues**: Marked for deletion per user request

#### `POST /api/sessions/migrate-data`
- **File Location**: `backend/src/routes/sessions.ts:1180-1200`
- **Purpose**: Migrate session data
- **Status**: MARKED FOR DELETION
- **Request**: Method: POST
- **Response**:
  - Success: 200 OK
  - Body: `{ message: string, result: object }`
- **Business Logic**: Calls `sessionService.migrateSessionData()`
- **Dependencies**: SessionService
- **Current Issues**: Marked for deletion per user request

## Summary

### **Total Endpoints**: 35
- **KEEP**: 15 endpoints (core functionality)
- **CONSOLIDATE**: 8 endpoints (duplicates, placeholders, similar functionality)
- **DELETE**: 12 endpoints (marked for deletion)

### **Critical Issues Identified**
1. **Duplicate endpoints**: `GET /:sessionId/messages` appears twice
2. **Similar functionality**: `GET /:sessionId/state` vs `GET /:sessionId/game-state`
3. **Placeholder implementations**: 6 endpoints return mock data
4. **Route ordering complexity**: Specific routes must come before parameterized routes

### **Next Steps**
1. **Create tests** for all KEEP endpoints
2. **Document expected behavior** for CONSOLIDATE endpoints
3. **Remove DELETE endpoints** safely
4. **Consolidate duplicate/similar endpoints**
5. **Implement placeholder endpoints** or remove them
