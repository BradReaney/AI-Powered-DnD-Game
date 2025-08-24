# Multi-Session Management System

## Overview
The multi-session system allows users to run multiple D&D campaigns simultaneously, switch between them seamlessly, and create new campaigns with various themes or random scenarios.

## Core Features

### 1. Session Management
- **Multiple Active Sessions**: Run unlimited concurrent campaigns
- **Session Switching**: Seamlessly jump between different stories
- **Session Persistence**: All campaigns auto-save progress
- **Session Overview**: Track progress across all adventures

### 2. Campaign Creation Options

#### Theme-Based Campaigns
Choose from 15+ predefined themes:
- **Classic Fantasy**: Traditional D&D adventures
- **Dark Fantasy**: Gritty, morally complex stories
- **Horror**: Supernatural terror and psychological threats
- **Mystery**: Investigation-focused adventures
- **Political Intrigue**: Court politics and espionage
- **And 10+ more themes**

#### Random Scenario Generation
- AI creates unique adventures on demand
- Combines random elements from different themes
- Ensures fresh, unpredictable storylines
- Maintains D&D authenticity and balance

#### Custom Scenarios
- User-provided opening scenarios
- AI builds upon custom premises
- Flexible starting points for unique campaigns

### 3. Web Interface

#### Campaign Selection Interface
The web interface provides intuitive campaign management through visual components:

**Campaign Selection Page:**
- **Two main options**: Load existing campaign or start new one
- **Existing campaigns**: Visual cards showing campaign name, theme, last played date, and character count
- **New campaign**: Theme selection dropdown + custom scenario text input
- **Quick actions**: Archive, duplicate, or delete campaigns

**Campaign Creation Flow:**
1. **Theme Selection**: Choose from 15+ predefined themes or "Random" option
2. **Custom Scenario**: Optional text area for custom opening scenarios
3. **Character Setup**: Add human and AI characters to the party
4. **Campaign Preview**: Review settings before starting
5. **Launch**: Begin the adventure with AI-generated opening scene

**Session Management Dashboard:**
- **Active Sessions**: Visual grid of all running campaigns
- **Quick Switch**: One-click switching between campaigns
- **Session Status**: Real-time indicators of campaign progress
- **Search & Filter**: Find campaigns by theme, date, or character names
- **Bulk Actions**: Archive multiple completed campaigns

#### Session Information Commands
```bash
# Detailed session info
dnd-game session-info campaign_1_dragon_heist

# Session history and timeline
dnd-game session-history campaign_1_dragon_heist

# Compare sessions
dnd-game compare-sessions campaign_1_dragon_heist campaign_2_dark_woods
```

## Technical Implementation

### Data Models

#### GameSession Model
```typescript
interface GameSession {
    id: string;
    campaignName: string;
    theme: CampaignTheme;
    openingScenario: string;
    sessionNumber: number;
    lastPlayed: Date;
    characters: Character[];
    npcs: NPC[];
    storyEvents: StoryEvent[];
    worldState: WorldState;
    campaignStatus: CampaignStatus;
    isArchived: boolean;
    tags: string[];
}

#### CampaignTheme Enum
```typescript
enum CampaignTheme {
    CLASSIC_FANTASY = "Classic Fantasy",
    DARK_FANTASY = "Dark Fantasy",
    HIGH_FANTASY = "High Fantasy",
    URBAN_FANTASY = "Urban Fantasy",
    STEAMPUNK = "Steampunk",
    HORROR = "Horror",
    MYSTERY = "Mystery",
    POLITICAL_INTRIGUE = "Political Intrigue",
    EXPLORATION = "Exploration & Discovery",
    WAR_CAMPAIGN = "War Campaign",
    PLANAR_ADVENTURE = "Planar Adventure",
    UNDERDARK = "Underdark",
    SEAFARING = "Seafaring Adventure",
    DESERT_NOMADS = "Desert Nomads",
    ARCTIC_SURVIVAL = "Arctic Survival",
    CUSTOM = "Custom",
    RANDOM = "Random"
}

### Core Classes

#### MultiSessionManager
Handles all session operations:
- Session creation, switching, archiving
- Campaign theme management
- Session persistence and loading
- Cross-session operations

#### ScenarioGenerator
Generates themed and random scenarios:
- Theme-based scenario templates
- Random element combination
- Scenario consistency checking
- AI-enhanced scenario generation

### Database System

#### MongoDB Collections Structure
```
dnd-game database
├── sessions/                      # GameSession documents
├── characters/                    # Character documents
├── storyEvents/                   # StoryEvent documents
├── worldStates/                   # WorldState documents
├── npcs/                          # NPC documents
├── campaigns/                     # Campaign metadata
└── templates/                     # Campaign templates
```

#### Session Metadata
```json
{
  "id": "campaign_1_dragon_heist",
  "campaign_name": "Waterdeep Mysteries",
  "theme": "Mystery",
  "created_date": "2024-01-15T10:30:00Z",
  "last_played": "2024-01-20T15:45:00Z",
  "session_number": 3,
  "character_count": 1,
  "total_playtime": "8h 30m",
  "tags": ["urban", "investigation", "waterdeep"],
  "is_archived": false
}
```

## User Experience Flow

### Creating a New Campaign
1. User runs `dnd-game new-campaign "Campaign Name"`
2. System prompts for theme selection or random generation
3. AI generates opening scenario based on selection
4. System creates session directory and initial data files
5. Campaign begins with generated scenario

### Switching Sessions
1. User runs `dnd-game switch-session <session_id>`
2. System saves current session state
3. System loads target session data
4. AI generates resume context from session history
5. User continues from where they left off

### Session Overview
1. User runs `dnd-game list-sessions`
2. System displays all sessions with key information
3. User can see which session is currently active
4. Quick access to switch or get more details

## Advanced Features

### Session Analytics
- Track playtime per session
- Monitor character progression
- Analyze story event patterns
- Generate session summaries

### Cross-Session Features
- Character transfers between compatible campaigns
- Shared NPC database across sessions
- Campaign timeline synchronization
- Session comparison tools

### Session Templates
- Save successful campaign setups as templates
- Quick-start options for common campaign types
- Community template sharing (future feature)
- Template customization and modification

## Benefits

### For Players
- **Variety**: Experience different campaign styles simultaneously
- **Flexibility**: Switch between campaigns based on mood
- **Organization**: Keep multiple stories organized and accessible
- **Experimentation**: Try new themes without abandoning current campaigns

### For the AI System
- **Context Isolation**: Each session maintains separate context
- **Theme Consistency**: AI adapts to campaign theme and tone
- **Improved Continuity**: Dedicated context per campaign
- **Scalability**: System handles multiple concurrent narratives

This multi-session system transforms the app from a single-campaign tool into a comprehensive D&D campaign management platform, allowing users to explore multiple worlds and stories simultaneously while maintaining the quality and continuity of each individual campaign.
