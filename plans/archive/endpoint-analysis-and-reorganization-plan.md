# Endpoint Analysis and Reorganization Plan

## Executive Summary

After analyzing the current endpoint structure, I've identified **significant complexity and redundancy** across the backend routes. The current system has:

- **11 route files** with overlapping functionality
- **Multiple duplicate endpoints** serving similar purposes
- **Inconsistent naming conventions** and route structures
- **Mixed concerns** within single route files
- **Frontend API routes** that duplicate backend functionality

## Current Endpoint Inventory

### 1. Sessions Routes (`/api/sessions`)
**File:** `backend/src/routes/sessions.ts` (1211 lines)
**Status:** **OVERLY COMPLEX - NEEDS MAJOR REFACTORING**

#### Core Session Management (KEEP)
- `GET /approaching-inactivity` - Get sessions approaching inactivity threshold
- `GET /campaign/:campaignId` - Get all sessions for a campaign
- `GET /new` - Get session creation form state
- `POST /` - Create new session
- `GET /:sessionId` - Get session by ID
- `PUT /:sessionId/end` - End session
- `DELETE /:sessionId` - Delete session

#### Session Activity & Continuity (KEEP)
- `GET /active/list` - Get active sessions
- `GET /active/continuity` - Get active sessions for continuity
- `POST /:sessionId/activity` - Update session activity

#### Session Data (CONSOLIDATE)
- `GET /:sessionId/messages` - Get messages for session (DUPLICATE - appears twice!)
- `POST /:sessionId/messages` - Send message in session
- `POST /:sessionId/ai-response` - Get AI response for session
- `GET /:sessionId/game-state` - Get session game state
- `GET /:sessionId/state` - Get session state (DUPLICATE of game-state)

#### Session Metadata (CONSOLIDATE)
- `PUT /:sessionId/metadata` - Update session metadata
- `GET /:sessionId/participants` - Get session participants
- `POST /:sessionId/participants` - Add participant to session
- `DELETE /:sessionId/participants/:characterId` - Remove participant

#### Session Content (CONSOLIDATE)
- `GET /:sessionId/story-events` - Get session story events
- `POST /:sessionId/story-events` - Add story event to session
- `GET /:sessionId/notes` - Get session notes
- `PUT /:sessionId/notes` - Update session notes
- `GET /:sessionId/outcomes` - Get session outcomes
- `PUT /:sessionId/outcomes` - Update session outcomes

#### Advanced Features (KEEP)
- `GET /campaign/:campaignId/timeline` - Get campaign timeline
- `POST /search` - Search and filter sessions

#### Advanced Features (MARKED FOR DELETION)
- `POST /compare` - Compare two sessions
- `POST /transfer-character` - Transfer character between sessions
- `POST /:sessionId/tags` - Add tags to session
- `DELETE /:sessionId/tags` - Remove tags from session
- `POST /:sessionId/archive` - Archive session
- `POST /:sessionId/restore` - Restore archived session
- `POST /:sessionId/share` - Share session

#### Data Management (MARKED FOR DELETION)
- `GET /data-quality-report` - Get data quality report
- `GET /validate-integrity` - Validate data integrity
- `POST /migrate-data` - Migrate session data

### 2. Characters Routes (`/api/characters`)
**File:** `backend/src/routes/characters.ts` (720 lines)
**Status:** **WELL ORGANIZED - MINOR CLEANUP NEEDED**

#### Core Character Management (KEEP)
- `GET /` - Get characters by campaign (query parameter)
- `GET /campaign/:campaignId` - Get characters by campaign (path parameter)
- `GET /session/:sessionId` - Get characters by session
- `GET /:characterId` - Get character by ID
- `POST /human` - Create human character
- `POST /ai` - Create AI character
- `PUT /:characterId` - Update character
- `DELETE /:characterId` - Delete character

#### Character Operations (KEEP)
- `POST /:characterId/level-up` - Level up character
- `POST /:characterId/experience` - Add experience to character
- `POST /:characterId/inventory` - Update character inventory
- `POST /:characterId/attributes` - Update character attributes
- `POST /:characterId/skills` - Update character skills
- `POST /:characterId/spells` - Update character spells
- `POST /:characterId/equipment` - Update character equipment

### 3. Gameplay Routes (`/api/gameplay`)
**File:** `backend/src/routes/gameplay.ts` (1265 lines)
**Status:** **OVERLY COMPLEX - NEEDS REFACTORING**

#### Core Gameplay (KEEP)
- `POST /skill-check` - Perform skill check
- `POST /dice-roll` - Roll dice
- `POST /ai-response` - Get AI response for gameplay

#### Advanced Features (KEEP)
- `GET /context/:campaignId` - Get context for campaign (implemented)
- `GET /prompt-templates` - Get prompt templates (implemented)

#### Advanced Features (MARKED FOR DELETION)
- `POST /context/add` - Add context layer (not implemented)
- `POST /context/clear` - Clear context (not implemented)
- `POST /prompt/build` - Build prompt (not implemented)
- `POST /prompt/execute` - Execute prompt (not implemented)

### 4. Campaigns Routes (`/api/campaigns`)
**File:** `backend/src/routes/campaigns.ts` (369 lines)
**Status:** **WELL ORGANIZED - MINOR CLEANUP NEEDED**

#### Core Campaign Management (KEEP)
- `GET /` - Get all campaigns
- `GET /user/:userId` - Get campaigns by user
- `POST /` - Create new campaign
- `GET /:campaignId/stats` - Get campaign stats
- `GET /:campaignId/characters` - Get characters by campaign

### 5. Combat Routes (`/api/combat`)
**File:** `backend/src/routes/combat.ts` (278 lines)
**Status:** **WELL ORGANIZED - KEEP AS IS**

#### Combat Management (KEEP)
- `POST /encounters` - Create new combat encounter
- `GET /encounters/:encounterId` - Get combat encounter
- `PUT /encounters/:encounterId` - Update combat encounter
- `POST /encounters/:encounterId/start` - Start combat encounter
- `POST /encounters/:encounterId/end` - End combat encounter
- `POST /encounters/:encounterId/participants` - Add participant
- `DELETE /encounters/:encounterId/participants/:participantId` - Remove participant

### 6. Locations Routes (`/api/locations`)
**File:** `backend/src/routes/locations.ts` (415 lines)
**Status:** **WELL ORGANIZED - KEEP AS IS**

#### Location Management (KEEP)
- `GET /campaign/:campaignId` - Get locations by campaign
- `GET /session/:sessionId` - Get locations by session
- `GET /:locationId` - Get location by ID
- `POST /` - Create new location
- `PUT /:locationId` - Update location
- `DELETE /:locationId` - Delete location

### 7. Quests Routes (`/api/quests`)
**File:** `backend/src/routes/quests.ts` (317 lines)
**Status:** **WELL ORGANIZED - KEEP AS IS**

#### Quest Management (KEEP)
- `POST /generate` - Generate new quest
- `POST /campaign/:campaignId` - Add quest to campaign
- `PUT /campaign/:campaignId/quest/:questName/objective/:objectiveId` - Update quest objective
- `PUT /campaign/:campaignId/quest/:questName/complete` - Complete quest

### 8. AI Analytics Routes (`/api/ai-analytics`)
**File:** `backend/src/routes/ai-analytics.ts` (174 lines)
**Status:** **WELL ORGANIZED - KEEP AS IS**

#### Performance Monitoring (KEEP)
- `GET /test-gemini` - Test Gemini API connection
- `GET /performance/summary` - Get performance summary
- `GET /performance/model-comparison` - Get model comparison
- `GET /performance/metrics` - Get metrics by time range
- `GET /performance/metrics/:model` - Get metrics by model

### 9. Campaign Settings Routes (`/api/campaign-settings`)
**File:** `backend/src/routes/campaign-settings.ts` (248 lines)
**Status:** **WELL ORGANIZED - KEEP AS IS**

#### Settings Management (KEEP)
- `GET /:campaignId/settings` - Get campaign settings
- `PUT /:campaignId/settings` - Update campaign settings
- `PUT /:campaignId/settings/ai-behavior` - Update AI behavior settings
- `PUT /:campaignId/settings/rules` - Update campaign rules

### 10. Campaign Themes Routes (`/api/campaign-themes`)
**File:** `backend/src/routes/campaign-themes.ts` (257 lines)
**Status:** **WELL ORGANIZED - KEEP AS IS**

#### Theme Management (KEEP)
- `GET /` - Get all available campaign themes
- `GET /:themeId` - Get specific theme by ID
- `GET /genre/:genre` - Get themes by genre
- `GET /difficulty/:difficulty` - Get themes by difficulty
- `GET /levels/:minLevel/:maxLevel` - Get themes by level range

### 11. Character Development Routes (`/api/character-development`)
**File:** `backend/src/routes/character-development.ts` (208 lines)
**Status:** **WELL ORGANIZED - KEEP AS IS**

#### Development Features (KEEP)
- `GET /characters/:characterId/memories` - Get character memories
- `POST /characters/:characterId/memories` - Add character memory
- `GET /characters/:characterId/relationships` - Get character relationships
- `POST /characters/:characterId/relationships` - Add/update relationship
- `GET /characters/:characterId/knowledge` - Get character knowledge
- `POST /characters/:characterId/knowledge` - Add character knowledge

### 12. Frontend API Routes
**Status:** **DUPLICATE FUNCTIONALITY - CONSIDER REMOVAL**

The frontend has Next.js API routes that duplicate backend functionality:
- `frontend/app/api/campaigns/route.ts`
- `frontend/app/api/characters/route.ts`
- `frontend/app/api/sessions/route.ts`
- `frontend/app/api/locations/route.ts`
- `frontend/app/api/gameplay/route.ts`

## Identified Issues

### 1. **Duplicate Endpoints**
- `GET /:sessionId/messages` appears twice in sessions.ts
- `GET /:sessionId/state` and `GET /:sessionId/game-state` serve similar purposes
- Frontend and backend have duplicate route structures

### 2. **Route Ordering Problems**
- Specific routes must come before parameterized routes to avoid conflicts
- Complex route ordering logic in sessions.ts

### 3. **Mixed Concerns**
- Sessions.ts handles messages, AI responses, story events, and metadata
- Gameplay.ts mixes skill checks, context management, and prompt building

### 4. **Inconsistent Response Formats**
- Some endpoints return `{ success: true, data: ... }`
- Others return direct data or `{ message: ..., data: ... }`

### 5. **Unused/Placeholder Endpoints**
- Several endpoints in sessions.ts return placeholder responses
- Some advanced features may not be fully implemented

## Recommended Reorganization

### Phase 1: Immediate Cleanup (High Priority)

#### 1.1 Consolidate Sessions Routes
**New Structure:**
```
/api/sessions/
├── /core/                    # Basic session CRUD
├── /messages/                # Message handling
├── /ai/                      # AI interactions
├── /metadata/                # Session metadata
├── /content/                 # Story events, notes, outcomes
├── /participants/            # Participant management
└── /advanced/                # Advanced features (archive, share, etc.)
```

#### 1.2 Remove Duplicate and Unused Endpoints
- Remove duplicate `GET /:sessionId/messages`
- Consolidate `GET /:sessionId/state` and `GET /:sessionId/game-state`
- Remove placeholder endpoints that return empty data
- **Remove endpoints marked for deletion:**
  - `POST /compare` - Compare two sessions
  - `POST /transfer-character` - Transfer character between sessions
  - `POST /:sessionId/tags` - Add tags to session
  - `DELETE /:sessionId/tags` - Remove tags from session
  - `POST /:sessionId/archive` - Archive session
  - `POST /:sessionId/restore` - Restore archived session
  - `POST /:sessionId/share` - Share session
  - `GET /data-quality-report` - Get data quality report
  - `GET /validate-integrity` - Validate data integrity
  - `POST /migrate-data` - Migrate session data
  - `POST /context/add` - Add context layer (not implemented)
  - `POST /context/clear` - Clear context (not implemented)
  - `POST /prompt/build` - Build prompt (not implemented)
  - `POST /prompt/execute` - Execute prompt (not implemented)

#### 1.3 Standardize Response Formats
- Implement consistent response wrapper
- Add proper error handling across all endpoints

### Phase 2: Logical Grouping (Medium Priority)

#### 2.1 Create New Route Groups
```
/api/
├── /gameplay/                # Core gameplay mechanics
│   ├── /skill-checks/        # Skill check system
│   ├── /dice/                # Dice rolling
│   └── /ai/                  # AI gameplay responses
├── /sessions/                # Session management
│   ├── /core/                # Basic session operations
│   ├── /chat/                # Message handling
│   ├── /ai/                  # AI session features
│   └── /content/             # Story content
├── /characters/              # Character management
├── /campaigns/               # Campaign management
├── /combat/                  # Combat system
├── /locations/               # Location management
├── /quests/                  # Quest system
└── /analytics/               # Performance monitoring
```

#### 2.2 Consolidate Related Functionality
- Move AI-related endpoints to dedicated AI routes
- Group session content management together
- Consolidate metadata operations

### Phase 3: Frontend Integration (Low Priority)

#### 3.1 Evaluate Frontend API Routes
- Consider removing Next.js API routes if they only proxy to backend
- Implement proper error handling and caching at frontend level
- Use backend directly for server-side operations

## Implementation Priority

### High Priority (Week 1-2)
1. Remove duplicate endpoints in sessions.ts
2. Consolidate similar endpoints (state vs game-state)
3. Remove placeholder endpoints
4. Standardize response formats

### Medium Priority (Week 3-4)
1. Reorganize sessions.ts into logical groups
2. Create new route structure
3. Update route registration in app.ts
4. Update frontend API calls

### Low Priority (Week 5-6)
1. Frontend API route cleanup
2. Advanced feature evaluation
3. Performance optimization
4. Documentation updates

## Expected Benefits

1. **Reduced Complexity**: Fewer route files, clearer organization
2. **Better Maintainability**: Related functionality grouped together
3. **Eliminated Duplication**: No more duplicate endpoints
4. **Consistent API**: Standardized response formats and error handling
5. **Easier Testing**: Logical grouping makes testing more straightforward
6. **Better Developer Experience**: Clearer route structure for new developers

## Risk Assessment

### Low Risk
- Removing duplicate endpoints
- Standardizing response formats
- Consolidating similar functionality

### Medium Risk
- Reorganizing route structure
- Updating frontend API calls
- Route ordering changes

### High Risk
- Removing placeholder endpoints (may break frontend)
- Major route restructuring
- Frontend API route removal

## Regression Baseline Documentation

### **CRITICAL: Create Before Refactoring**

Before implementing any changes, we need to document the current behavior of all endpoints to prevent regressions.

#### **Recommended Approach**
1. **Create automated tests** for each endpoint's current behavior
2. **Document expected inputs/outputs** for each endpoint
3. **Capture current error handling** and response formats
4. **Test with real data** to understand edge cases

#### **Regression Testing Strategy**
1. **Unit Tests**: Test each endpoint in isolation
2. **Integration Tests**: Test endpoint interactions
3. **Frontend Integration Tests**: Ensure frontend still works
4. **Performance Baselines**: Document current response times

#### **Documentation Requirements**
- **Request/Response schemas** for each endpoint
- **Error codes and messages** currently returned
- **Authentication/authorization** requirements
- **Rate limiting** and validation rules
- **Database interactions** and side effects

### **Suggested Regression Testing Tools**
- **Postman/Insomnia**: Manual API testing
- **Jest/Supertest**: Automated backend testing
- **Playwright**: Frontend integration testing
- **Database snapshots**: Before/after data verification

### **Detailed Regression Documentation Template**

#### **For Each Endpoint, Document:**

**Basic Information**
- **Route**: `METHOD /path`
- **File Location**: `backend/src/routes/filename.ts:line_number`
- **Purpose**: What this endpoint does
- **Status**: KEEP/CONSOLIDATE/DELETE

**Request Details**
- **Method**: GET/POST/PUT/DELETE
- **URL Parameters**: `:paramName` and their types
- **Query Parameters**: `?param=value` and their types
- **Request Body**: JSON schema if applicable
- **Headers Required**: Authentication, content-type, etc.

**Response Details**
- **Success Response**: HTTP status + JSON structure
- **Error Responses**: All possible error codes and messages
- **Response Format**: Current response wrapper structure
- **Data Types**: Expected data types for each field

**Business Logic**
- **Validation Rules**: Input validation currently implemented
- **Database Operations**: What gets read/written/updated
- **Side Effects**: Other systems or data affected
- **Dependencies**: Services, models, or external APIs used

**Current Implementation Notes**
- **Working Status**: Fully implemented, partially implemented, placeholder
- **Known Issues**: Any current bugs or limitations
- **Performance**: Current response times or bottlenecks
- **Frontend Usage**: Which frontend components use this endpoint

**Example Documentation Entry:**
```
## GET /api/sessions/:sessionId/messages

**File**: backend/src/routes/sessions.ts:380-420
**Status**: CONSOLIDATE (duplicate endpoint)

**Request**:
- Method: GET
- URL Params: sessionId (ObjectId)
- Query Params: limit (number, default: 50), offset (number, default: 0)

**Response**:
- Success: 200 OK
- Body: { message: string, sessionId: string, messages: array, pagination: object }
- Error: 400 (invalid sessionId), 500 (server error)

**Business Logic**:
- Fetches messages from MongoDB using Message.getSessionMessages()
- Includes pagination with total count
- Filters out deleted messages

**Current Issues**:
- Duplicate endpoint (appears twice in sessions.ts)
- Inconsistent with other message endpoints
```

### **Regression Testing Checklist**

**Before Refactoring:**
- [ ] All endpoints documented with current behavior
- [ ] Automated tests created for each endpoint
- [ ] Frontend integration tests passing
- [ ] Performance baselines established
- [ ] Database schema documented

**During Refactoring:**
- [ ] Run full test suite after each change
- [ ] Verify frontend still works
- [ ] Check database integrity
- [ ] Monitor performance impact

**After Refactoring:**
- [ ] All tests pass
- [ ] Frontend functionality verified
- [ ] Performance maintained or improved
- [ ] Documentation updated
- [ ] No new errors in logs

## Next Steps

1. **Create regression baseline** (document current behavior)
2. **Set up automated testing** for all endpoints
3. **Review this plan** and identify any endpoints I may have missed
4. **Prioritize cleanup tasks** based on current development needs
5. **Start with Phase 1** (immediate cleanup) to reduce complexity
6. **Test thoroughly** after each phase to ensure no regressions
7. **Update documentation** to reflect new route structure

This reorganization will significantly simplify the endpoint management and make the codebase more maintainable for future development.
