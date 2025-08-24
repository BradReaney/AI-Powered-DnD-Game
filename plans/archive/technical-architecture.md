# Technical Architecture - Web UI Version

## System Overview

The AI-powered D&D game is built as a **web-based**, modular, event-driven system with a focus on maintaining story continuity and character consistency across multiple play sessions. The system uses a Node.js/Express backend with React frontend, supporting both human and AI characters in mixed parties.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    Frontend Layer (React + TypeScript)          │
│                                                                 │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│ │CampaignSel  │ │CharCreator  │ │GameInterface│ │ChatInterface│ │
│ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│ │CharSheet    │ │CampaignOv   │ │CommonUI     │ │Responsive   │ │
│ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                │
                                │ HTTP/WebSocket
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Backend Layer (Node.js/Express)             │
│                                                                 │
│ ┌─────────────┐ ┌─────────────────┐ ┌─────────────────────────┐ │
│ │   API Layer │ │   Game Layer    │ │       AI Layer          │ │
│ │             │ │                 │ │                         │ │
│ │┌───────────┐│ │┌───────────────┐│ │┌───────────────────────┐│ │
│ ││Campaigns  ││ ││ GameEngine    ││ ││   GeminiClient        ││ │
│ │└───────────┘│ │└───────────────┘│ │└───────────────────────┘│ │
│ │┌───────────┐│ │┌───────────────┐│ │┌───────────────────────┐│ │
│ ││Characters ││ ││ GameState     ││ ││   ContextManager      ││ │
│ │└───────────┘│ │└───────────────┘│ │└───────────────────────┘│ │
│ │┌───────────┐│ │┌───────────────┐│ │┌───────────────────────┐│ │
│ ││Gameplay   ││ ││SessionManager ││ ││   PromptService       ││ │
│ │└───────────┘│ │└───────────────┘│ │└───────────────────────┘│ │
│ │┌───────────┐│ │┌───────────────┐│ │┌───────────────────────┐│ │
│ ││Sessions   ││ ││CharService    ││ ││   ScenarioGenerator   ││ │
│ │└───────────┘│ │└───────────────┘│ │└───────────────────────┘│ │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Data Layer                                  │
│                                                                 │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│ │ Characters  │ │ StoryEvents │ │ GameSessions│ │ WorldState  │
│ │ (Human+AI)  │ │             │ │             │ │             │
│ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│ │ StorageMgr │ │ Serializers │ │ Validators  │ │ BackupMgr   │
│ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. Frontend Layer (`frontend/src/`)

#### Campaign Selection Component
```typescript
// frontend/src/components/CampaignSelector.tsx
import React, { useState, useEffect } from 'react';
import { Campaign, CampaignTheme } from '../types/campaign';

interface CampaignSelectorProps {
  onCampaignSelect: (campaign: Campaign) => void;
  onNewCampaign: () => void;
}

export const CampaignSelector: React.FC<CampaignSelectorProps> = ({
  onCampaignSelect,
  onNewCampaign
}) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      const response = await fetch('/api/campaigns');
      const data = await response.json();
      setCampaigns(data);
    } catch (error) {
      console.error('Failed to load campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="campaign-selector">
      <h1>Welcome to AI-Powered D&D</h1>
      
      <div className="campaign-options">
        <button onClick={onNewCampaign} className="new-campaign-btn">
          Start New Campaign
        </button>
        
        {campaigns.length > 0 && (
          <div className="existing-campaigns">
            <h2>Load Existing Campaign</h2>
            {campaigns.map(campaign => (
              <div key={campaign.id} className="campaign-card">
                <h3>{campaign.name}</h3>
                <p>{campaign.theme}</p>
                <p>Last played: {campaign.lastPlayed}</p>
                <button onClick={() => onCampaignSelect(campaign)}>
                  Load Campaign
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
```

#### Character Creation Wizard
```typescript
// frontend/src/components/CharacterCreator.tsx
import React, { useState } from 'react';
import { Character, CharacterType } from '../types/character';

interface CharacterCreatorProps {
  onCharacterCreated: (character: Character) => void;
}

export const CharacterCreator: React.FC<CharacterCreatorProps> = ({
  onCharacterCreated
}) => {
  const [characterType, setCharacterType] = useState<CharacterType>('human');
  const [step, setStep] = useState(1);
  const [character, setCharacter] = useState<Partial<Character>>({});

  const handleTypeSelection = (type: CharacterType) => {
    setCharacterType(type);
    if (type === 'ai') {
      generateAICharacter();
    } else {
      setStep(2);
    }
  };

  const generateAICharacter = async () => {
    try {
      const response = await fetch('/api/characters/generate-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ characterType: 'ai' })
      });
      const aiCharacter = await response.json();
      onCharacterCreated(aiCharacter);
    } catch (error) {
      console.error('Failed to generate AI character:', error);
    }
  };

  return (
    <div className="character-creator">
      <h2>Create Your Character</h2>
      
      {step === 1 && (
        <div className="character-type-selection">
          <h3>Choose Character Type</h3>
          <button onClick={() => handleTypeSelection('human')}>
            Human Character
          </button>
          <button onClick={() => handleTypeSelection('ai')}>
            AI Character
          </button>
        </div>
      )}

      {step === 2 && characterType === 'human' && (
        <div className="human-character-wizard">
          <HumanCharacterWizard 
            character={character}
            onCharacterUpdate={setCharacter}
            onComplete={onCharacterCreated}
          />
        </div>
      )}
    </div>
  );
};
```

### 2. Game Layer (`backend/services/`)

#### Game Engine
```python
# backend/services/game_engine.py
from typing import List, Optional
from .game_state import GameState
from .session_manager import GameSession
from .context_manager import ContextManager

class GameEngine:
    def __init__(self, context_manager: ContextManager):
        self.context_manager = context_manager
        self.current_session: Optional[GameSession] = None
        self.game_state: Optional[GameState] = None
    
    def start_new_session(self, character_ids: List[str]) -> str:
        """Start a new game session with specified characters"""
        session = GameSession.create_new(character_ids)
        self.current_session = session
        self.game_state = GameState.initialize(session)
        return session.session_id
    
    def process_player_action(self, action: str) -> str:
        """Process a player action and return AI response"""
        # Build context for AI
        context = self.context_manager.build_context_for_action(
            action, self.game_state
        )
        
        # Get AI response
        ai_response = self.context_manager.get_ai_response(context)
        
        # Update game state
        self._update_game_state(action, ai_response)
        
        return ai_response
    
    def _update_game_state(self, action: str, ai_response: str):
        """Update game state based on action and AI response"""
        # Create story event
        event = StoryEvent.create_from_action(action, ai_response)
        
        # Update game state
        self.game_state.add_event(event)
        
        # Update context manager
        self.context_manager.update_context_after_action(event)
```

#### Game State
```python
# backend/services/game_state.py
from typing import List, Dict, Any
from ..models.story import StoryEvent
from ..models.character import Character
from ..models.world import WorldState

class GameState:
    def __init__(self, session_id: str):
        self.session_id = session_id
        self.current_scene: str = ""
        self.active_characters: List[Character] = []
        self.story_events: List[StoryEvent] = []
        self.world_state: WorldState = WorldState()
        self.turn_number: int = 0
    
    def add_event(self, event: StoryEvent):
        """Add a new story event to the game state"""
        self.story_events.append(event)
        self.turn_number += 1
        
        # Update world state based on event
        self.world_state.update_from_event(event)
    
    def get_current_context(self) -> Dict[str, Any]:
        """Get current game context for AI"""
        return {
            "current_scene": self.current_scene,
            "active_characters": [c.to_dict() for c in self.active_characters],
            "recent_events": [e.to_dict() for e in self.story_events[-10:]],
            "world_state": self.world_state.to_dict(),
            "turn_number": self.turn_number
        }
```

### 3. AI Layer (`backend/services/`)

#### Context Manager
```python
# backend/services/context_manager.py
from typing import Dict, Any, List
from ..models.story import StoryEvent
from ..models.character import Character
from .prompts import PromptBuilder

class ContextManager:
    def __init__(self, max_context_tokens: int = 8000):
        self.max_context_tokens = max_context_tokens
        self.prompt_builder = PromptBuilder()
        self.story_summarizer = StorySummarizer()
    
    def build_context_for_action(self, action: str, game_state: GameState) -> str:
        """Build optimized context for AI action processing"""
        
        # Get current game context
        current_context = game_state.get_current_context()
        
        # Build layered context
        context_layers = {
            "campaign_summary": self._get_campaign_summary(game_state),
            "session_summary": self._get_session_summary(game_state),
            "current_scene": current_context["current_scene"],
            "active_characters": self._format_characters(current_context["active_characters"]),
            "recent_events": self._format_recent_events(current_context["recent_events"]),
            "world_state": current_context["world_state"],
            "player_action": action
        }
        
        # Build and optimize prompt
        prompt = self.prompt_builder.build_action_prompt(context_layers)
        
        # Ensure context fits within token limits
        if self._estimate_tokens(prompt) > self.max_context_tokens:
            prompt = self._compress_context(prompt)
        
        return prompt
    
    def _get_campaign_summary(self, game_state: GameState) -> str:
        """Get compressed campaign summary"""
        return self.story_summarizer.generate_campaign_summary(
            game_state.story_events
        )
    
    def _get_session_summary(self, game_state: GameState) -> str:
        """Get current session summary"""
        return self.story_summarizer.generate_session_summary(
            game_state.story_events
        )
    
    def _compress_context(self, context: str) -> str:
        """Compress context to fit within token limits"""
        # Implementation of context compression algorithm
        pass
```

#### Gemini Client
```python
# backend/services/gemini_client.py
import google.generativeai as genai
from typing import Optional
import os

class GeminiClient:
    def __init__(self, api_key: Optional[str] = None):
        api_key = api_key or os.getenv('GEMINI_API_KEY')
        if not api_key:
            raise ValueError("Gemini API key is required")
        
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-pro')
    
    def generate_response(self, prompt: str) -> str:
        """Generate AI response using Gemini"""
        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            # Handle API errors gracefully
            return f"Error generating response: {str(e)}"
    
    def generate_response_with_context(self, context: str, user_input: str) -> str:
        """Generate response with conversation context"""
        full_prompt = f"{context}\n\nPlayer: {user_input}\n\nDM:"
        return self.generate_response(full_prompt)
```

### 4. Data Models (`backend/models/`)

#### Character Model
```python
# backend/models/character.py
from pydantic import BaseModel, Field
from typing import Dict, List, Optional
from enum import Enum

class CharacterType(str, Enum):
    HUMAN = "human"
    AI = "ai"

class CharacterClass(str, Enum):
    FIGHTER = "fighter"
    WIZARD = "wizard"
    ROGUE = "rogue"
    CLERIC = "cleric"
    RANGER = "ranger"
    BARD = "bard"

class Character(BaseModel):
    id: str = Field(..., description="Unique character identifier")
    name: str = Field(..., description="Character name")
    character_type: CharacterType = Field(..., description="Whether character is human or AI")
    race: str = Field(..., description="Character race")
    character_class: CharacterClass = Field(..., description="Character class")
    archetype: str = Field(default="", description="Character archetype/subclass")
    background: str = Field(default="", description="Character background")
    
    # Stats
    level: int = Field(default=1, description="Character level")
    hit_points: int = Field(..., description="Current hit points")
    max_hit_points: int = Field(..., description="Maximum hit points")
    armor_class: int = Field(..., description="Armor class")
    
    # Attributes
    strength: int = Field(..., description="Strength score")
    dexterity: int = Field(..., description="Dexterity score")
    constitution: int = Field(..., description="Constitution score")
    intelligence: int = Field(..., description="Intelligence score")
    wisdom: int = Field(..., description="Wisdom score")
    charisma: int = Field(..., description="Charisma score")
    
    # Additional info
    personality_traits: List[str] = Field(default_factory=list, description="Personality traits")
    abilities: Dict[str, str] = Field(default_factory=dict, description="Special abilities and proficiencies")
    inventory: List[str] = Field(default_factory=list, description="Inventory items")
    experience: int = Field(default=0, description="Experience points")
    notes: str = Field(default="", description="Additional character notes")
    
    # AI-specific fields
    ai_personality: Optional[str] = Field(default=None, description="AI personality description for AI characters")
    ai_goals: Optional[List[str]] = Field(default_factory=list, description="AI character goals and motivations")
    ai_voice: Optional[str] = Field(default=None, description="AI character's unique voice and speaking style")
    
    def to_dict(self) -> Dict:
        """Convert character to dictionary for context building"""
        return {
            "id": self.id,
            "name": self.name,
            "character_type": self.character_type,
            "race": self.race,
            "class": self.character_class,
            "archetype": self.archetype,
            "background": self.background,
            "level": self.level,
            "stats": {
                "hp": self.hit_points,
                "max_hp": self.max_hit_points,
                "ac": self.armor_class,
                "str": self.strength,
                "dex": self.dexterity,
                "con": self.constitution,
                "int": self.intelligence,
                "wis": self.wisdom,
                "cha": self.charisma
            },
            "personality_traits": self.personality_traits,
            "abilities": self.abilities,
            "notes": self.notes,
            "ai_personality": self.ai_personality,
            "ai_goals": self.ai_goals,
            "ai_voice": self.ai_voice
        }
```

#### NPC Model (Allies & Enemies)
```python
# backend/models/npc.py
from pydantic import BaseModel, Field
from typing import Dict, List, Optional
from enum import Enum

class NPCRelationship(str, Enum):
    ALLY = "ally"
    ENEMY = "enemy"
    NEUTRAL = "neutral"
    MENTOR = "mentor"
    CONTACT = "contact"

class NPC(BaseModel):
    id: str = Field(..., description="Unique NPC identifier")
    name: str = Field(..., description="NPC name")
    relationship: NPCRelationship = Field(..., description="Relationship to player")
    npc_type: str = Field(..., description="Type of NPC (ranger, fighter, mentor, etc.)")
    specializations: List[str] = Field(default_factory=list, description="NPC specializations")
    current_location: str = Field(default="", description="Current location")
    status: str = Field(default="", description="Current status (alive, captured, defeated, etc.)")
    notes: str = Field(default="", description="Additional NPC information")
    
    # For enemies
    threat_level: Optional[str] = Field(default=None, description="Threat level assessment")
    last_known_activity: Optional[str] = Field(default=None, description="Last known activity")
    
    def to_dict(self) -> Dict:
        """Convert NPC to dictionary for context building"""
        return {
            "id": self.id,
            "name": self.name,
            "relationship": self.relationship,
            "type": self.npc_type,
            "specializations": self.specializations,
            "location": self.current_location,
            "status": self.status,
            "notes": self.notes,
            "threat_level": self.threat_level,
            "last_known_activity": self.last_known_activity
        }
```

#### Item Model
```python
# backend/models/item.py
from pydantic import BaseModel, Field
from typing import Dict, List, Optional
from enum import Enum

class ItemType(str, Enum):
    WEAPON = "weapon"
    ARMOR = "armor"
    MAGICAL = "magical"
    DOCUMENT = "document"
    LOOT = "loot"
    TOOL = "tool"
    CONSUMABLE = "consumable"

class Item(BaseModel):
    id: str = Field(..., description="Unique item identifier")
    name: str = Field(..., description="Item name")
    item_type: ItemType = Field(..., description="Type of item")
    description: str = Field(..., description="Item description")
    magical_properties: List[str] = Field(default_factory=list, description="Magical properties")
    location_found: str = Field(default="", description="Where the item was found")
    current_owner: Optional[str] = Field(default=None, description="Current owner ID")
    notes: str = Field(default="", description="Additional item notes")
    
    # For magical items
    spell_effects: List[str] = Field(default_factory=list, description="Spell effects")
    ritual_requirements: List[str] = Field(default_factory=list, description="Ritual requirements")
    
    def to_dict(self) -> Dict:
        """Convert item to dictionary for context building"""
        return {
            "id": self.id,
            "name": self.name,
            "type": self.item_type,
            "description": self.description,
            "magical_properties": self.magical_properties,
            "location_found": self.location_found,
            "current_owner": self.current_owner,
            "notes": self.notes,
            "spell_effects": self.spell_effects,
            "ritual_requirements": self.ritual_requirements
        }
```

#### Skill Check Model
```python
# backend/models/skill_check.py
from pydantic import BaseModel, Field
from typing import Dict, List, Optional
from enum import Enum
from datetime import datetime

class CheckResult(str, Enum):
    CRITICAL_SUCCESS = "critical_success"
    SUCCESS = "success"
    PARTIAL_SUCCESS = "partial_success"
    FAILURE = "failure"
    CRITICAL_FAILURE = "critical_failure"

class SkillCheck(BaseModel):
    id: str = Field(..., description="Unique skill check identifier")
    timestamp: datetime = Field(default_factory=datetime.now)
    description: str = Field(..., description="What the character was attempting")
    
    # Skills and attributes used
    primary_skill: str = Field(..., description="Primary skill used")
    secondary_skill: Optional[str] = Field(default=None, description="Secondary skill if applicable")
    attribute: str = Field(..., description="Attribute used (Strength, Dexterity, etc.)")
    
    # Roll results
    roll_result: int = Field(..., description="Actual roll result")
    target_dc: Optional[int] = Field(default=None, description="Target difficulty class")
    check_result: CheckResult = Field(..., description="Result of the check")
    
    # Consequences and outcomes
    consequences: str = Field(..., description="What happened as a result")
    character_development: Optional[str] = Field(default=None, description="Character development notes")
    world_impact: Optional[str] = Field(default=None, description="Impact on the world/story")
    
    # Metadata
    session_id: str = Field(..., description="Session where check occurred")
    turn_number: int = Field(..., description="Game turn when check occurred")
    
    def to_dict(self) -> Dict:
        """Convert skill check to dictionary for context building"""
        return {
            "id": self.id,
            "description": self.description,
            "skills": {
                "primary": self.primary_skill,
                "secondary": self.secondary_skill,
                "attribute": self.attribute
            },
            "roll": {
                "result": self.roll_result,
                "target_dc": self.target_dc,
                "outcome": self.check_result
            },
            "consequences": self.consequences,
            "character_development": self.character_development,
            "world_impact": self.world_impact,
            "turn": self.turn_number
        }
```

#### Campaign Status Model
```python
# backend/models/campaign.py
from pydantic import BaseModel, Field
from typing import Dict, List, Optional
from datetime import datetime

class CampaignStatus(BaseModel):
    id: str = Field(..., description="Unique status identifier")
    timestamp: datetime = Field(default_factory=datetime.now)
    
    # Current position
    current_location: str = Field(..., description="Current location")
    location_description: str = Field(..., description="Description of current position")
    
    # Active characters and NPCs
    active_characters: List[str] = Field(default_factory=list, description="Active character IDs")
    present_npcs: List[str] = Field(default_factory=list, description="Present NPC IDs")
    
    # Current objectives
    current_mission: str = Field(default="", description="Current mission objective")
    immediate_goals: List[str] = Field(default_factory=list, description="Immediate goals")
    long_term_goals: List[str] = Field(default_factory=list, description="Long-term campaign goals")
    
    # World state
    known_locations: List[str] = Field(default_factory=list, description="Known locations")
    active_threats: List[str] = Field(default_factory=list, description="Active threats")
    completed_objectives: List[str] = Field(default_factory=list, description="Completed objectives")
    
    # Game master notes
    campaign_rules: List[str] = Field(default_factory=list, description="Campaign-specific rules")
    future_notes: List[str] = Field(default_factory=list, description="Notes for future sessions")
    plot_hooks: List[str] = Field(default_factory=list, description="Available plot hooks")
    
    def to_dict(self) -> Dict:
        """Convert campaign status to dictionary for context building"""
        return {
            "current_position": {
                "location": self.current_location,
                "description": self.location_description
            },
            "active_participants": {
                "characters": self.active_characters,
                "npcs": self.present_npcs
            },
            "objectives": {
                "current_mission": self.current_mission,
                "immediate_goals": self.immediate_goals,
                "long_term_goals": self.long_term_goals
            },
            "world_state": {
                "known_locations": self.known_locations,
                "active_threats": self.active_threats,
                "completed_objectives": self.completed_objectives
            },
            "gm_notes": {
                "campaign_rules": self.campaign_rules,
                "future_notes": self.future_notes,
                "plot_hooks": self.plot_hooks
            }
        }
```

#### Story Event Model
```python
# src/models/story.py
from pydantic import BaseModel, Field
from typing import Dict, List, Optional
from datetime import datetime
from enum import Enum

class EventType(str, Enum):
    DIALOGUE = "dialogue"
    COMBAT = "combat"
    EXPLORATION = "exploration"
    QUEST = "quest"
    CHARACTER_DEVELOPMENT = "character_development"
    WORLD_EVENT = "world_event"
    SKILL_CHECK = "skill_check"
    NPC_INTERACTION = "npc_interaction"
    ITEM_DISCOVERY = "item_discovery"
    LOCATION_DISCOVERY = "location_discovery"

class StoryEvent(BaseModel):
    id: str = Field(..., description="Unique event identifier")
    timestamp: datetime = Field(default_factory=datetime.now)
    event_type: EventType = Field(..., description="Type of story event")
    
    # Event details
    title: str = Field(..., description="Brief event title")
    description: str = Field(..., description="Detailed event description")
    participants: List[str] = Field(default_factory=list, description="Character and NPC IDs involved")
    location: str = Field(default="", description="Location where event occurred")
    
    # Consequences and changes
    consequences: List[str] = Field(default_factory=list, description="Event consequences")
    character_changes: Dict[str, Dict] = Field(default_factory=dict, description="Character state changes")
    world_changes: Dict[str, Any] = Field(default_factory=dict, description="World state changes")
    
    # Related elements
    related_skill_checks: List[str] = Field(default_factory=list, description="Related skill check IDs")
    discovered_items: List[str] = Field(default_factory=list, description="Items discovered in this event")
    new_locations: List[str] = Field(default_factory=list, description="New locations discovered")
    
    # Metadata
    turn_number: int = Field(..., description="Game turn when event occurred")
    session_id: str = Field(..., description="Session where event occurred")
    importance_level: str = Field(default="normal", description="Importance level (minor, normal, major, critical)")
    
    @classmethod
    def create_from_action(cls, action: str, ai_response: str, 
                          game_state: GameState) -> 'StoryEvent':
        """Create story event from player action and AI response"""
        return cls(
            id=f"event_{datetime.now().timestamp()}",
            title=f"Action: {action[:50]}...",
            event_type=cls._classify_event(action),
            description=f"Player: {action}\nDM: {ai_response}",
            participants=game_state.active_characters,
            location=game_state.current_scene,
            turn_number=game_state.turn_number,
            session_id=game_state.session_id
        )
    
    @staticmethod
    def _classify_event(action: str) -> EventType:
        """Classify event type based on player action"""
        action_lower = action.lower()
        if any(word in action_lower for word in ['attack', 'fight', 'combat']):
            return EventType.COMBAT
        elif any(word in action_lower for word in ['explore', 'search', 'investigate']):
            return EventType.EXPLORATION
        elif any(word in action_lower for word in ['talk', 'say', 'ask']):
            return EventType.DIALOGUE
        elif any(word in action_lower for word in ['find', 'discover', 'loot']):
            return EventType.ITEM_DISCOVERY
        else:
            return EventType.EXPLORATION
```

### 5. Database Layer (`backend/services/`)

#### Database Service
```typescript
// backend/services/DatabaseService.ts
import mongoose, { Connection, Document } from 'mongoose';
import { Character } from '../models/Character';
import { GameSession } from '../models/Session';

export class DatabaseService {
    private connection: Connection | null = null;
    
    async connect(): Promise<void> {
        try {
            const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/dnd-game';
            await mongoose.connect(mongoUri);
            this.connection = mongoose.connection;
            console.log('Connected to MongoDB');
        } catch (error) {
            console.error('MongoDB connection error:', error);
            throw error;
        }
    }
    
    async saveCharacter(character: Character): Promise<boolean> {
        try {
            await character.save();
            return true;
        } catch (error) {
            console.error('Error saving character:', error);
            return false;
        }
    }
    
    async loadCharacter(characterId: string): Promise<Character | null> {
        try {
            return await Character.findById(characterId);
        } catch (error) {
            console.error('Error loading character:', error);
            return null;
        }
    }
    
    async saveSession(session: GameSession): Promise<boolean> {
        try {
            await session.save();
            return true;
        } catch (error) {
            console.error('Error saving session:', error);
            return false;
        }
    }
    
    async loadSession(sessionId: string): Promise<GameSession | null> {
        try {
            return await GameSession.findById(sessionId);
        } catch (error) {
            console.error('Error loading session:', error);
            return false;
        }
    }
    
    async disconnect(): Promise<void> {
        if (this.connection) {
            await mongoose.disconnect();
            this.connection = null;
        }
    }
}

## Game Mechanics & Rules

### 1. Authentic D&D Campaign Flow

#### Multi-Session Management System
```python
# backend/services/session_manager.py
from typing import List, Optional, Dict
from ..models.session import GameSession, CampaignTheme
from ..models.encounter import Encounter, EncounterType
from ..ai.scenario_generator import ScenarioGenerator

class MultiSessionManager:
    def __init__(self):
        self.active_sessions: Dict[str, GameSession] = {}
        self.current_session_id: Optional[str] = None
        self.scenario_generator = ScenarioGenerator()
    
    def list_sessions(self) -> List[Dict]:
        """List all available sessions"""
        sessions = []
        for session_id, session in self.active_sessions.items():
            sessions.append({
                'id': session_id,
                'name': session.campaign_name,
                'theme': session.theme.value,
                'last_played': session.last_played,
                'character_count': len(session.characters),
                'session_count': session.session_number,
                'is_active': session_id == self.current_session_id
            })
        return sorted(sessions, key=lambda x: x['last_played'], reverse=True)
    
    def create_new_campaign(self, campaign_name: str, theme: Optional[CampaignTheme] = None, 
                           custom_scenario: Optional[str] = None) -> str:
        """Create a new campaign with theme selection or random generation"""
        session_id = f"campaign_{len(self.active_sessions) + 1}_{campaign_name.lower().replace(' ', '_')}"
        
        if custom_scenario:
            # Use provided scenario
            scenario = custom_scenario
            selected_theme = CampaignTheme.CUSTOM
        elif theme:
            # Generate scenario based on selected theme
            scenario = self.scenario_generator.generate_themed_scenario(theme)
            selected_theme = theme
        else:
            # Generate completely random scenario
            scenario, selected_theme = self.scenario_generator.generate_random_scenario()
        
        # Create new session
        new_session = GameSession(
            id=session_id,
            campaign_name=campaign_name,
            theme=selected_theme,
            opening_scenario=scenario,
            session_number=1
        )
        
        self.active_sessions[session_id] = new_session
        self.current_session_id = session_id
        
        return f"Created new campaign: {campaign_name}\nTheme: {selected_theme.value}\n\n{scenario}\n\nWhat would you like to do?"
    
    def switch_session(self, session_id: str) -> str:
        """Switch to a different active session"""
        if session_id not in self.active_sessions:
            return f"Session '{session_id}' not found. Use 'list-sessions' to see available sessions."
        
        old_session = self.current_session_id
        self.current_session_id = session_id
        current_session = self.active_sessions[session_id]
        
        # Generate context for resuming session
        resume_context = self._generate_resume_context(current_session)
        
        return f"Switched from '{old_session}' to '{session_id}'\n\n{resume_context}"
    
    def get_current_session(self) -> Optional[GameSession]:
        """Get the currently active session"""
        if self.current_session_id:
            return self.active_sessions.get(self.current_session_id)
        return None
    
    def start_session(self, session_id: str) -> str:
        """Start a new D&D session with proper opening"""
        # Generate recap of previous session
        recap = self._generate_session_recap()
        
        # Set initial scene
        opening_scene = self._set_opening_scene()
        
        # Initialize session state
        self.current_session = GameSession(
            id=session_id,
            opening_recap=recap,
            current_scene=opening_scene
        )
        
        return f"{recap}\n\n{opening_scene}\n\nWhat would you like to do?"
    
    def _generate_session_recap(self) -> str:
        """Generate recap of previous session events"""
        # Implementation for session recap
        pass
    
    def manage_encounter(self, encounter_type: EncounterType) -> str:
        """Handle different types of D&D encounters"""
        if encounter_type == EncounterType.COMBAT:
            return self._handle_combat_encounter()
        elif encounter_type == EncounterType.SOCIAL:
            return self._handle_social_encounter()
        elif encounter_type == EncounterType.EXPLORATION:
            return self._handle_exploration_encounter()
        elif encounter_type == EncounterType.PUZZLE:
            return self._handle_puzzle_encounter()
```

#### Initiative and Combat System
```python
# backend/services/combat_service.py
from typing import List, Dict
from ..models.character import Character
from ..models.combat import Initiative, CombatRound

class CombatManager:
    def __init__(self):
        self.initiative_order: List[Initiative] = []
        self.current_round = 1
        self.current_turn = 0
    
    def roll_initiative(self, participants: List[Character]) -> List[Initiative]:
        """Handle D&D 5e initiative system"""
        initiatives = []
        for participant in participants:
            # Roll d20 + Dex modifier
            roll = self._roll_d20()
            dex_mod = participant.get_dexterity_modifier()
            total = roll + dex_mod
            
            initiatives.append(Initiative(
                character=participant,
                roll=roll,
                modifier=dex_mod,
                total=total
            ))
        
        # Sort by total (highest first)
        self.initiative_order = sorted(initiatives, key=lambda x: x.total, reverse=True)
        return self.initiative_order
    
    def process_combat_turn(self, action: str) -> str:
        """Process a single combat turn with D&D 5e rules"""
        current_character = self.initiative_order[self.current_turn].character
        
        # Process action (Move, Action, Bonus Action, Reaction)
        result = self._process_combat_action(action, current_character)
        
        # Advance to next turn
        self._advance_turn()
        
        return result
```

#### Campaign Themes and Scenario Generation
```python
# src/models/session.py
from enum import Enum
from typing import List, Optional
from datetime import datetime

class CampaignTheme(Enum):
    CLASSIC_FANTASY = "Classic Fantasy"
    DARK_FANTASY = "Dark Fantasy"
    HIGH_FANTASY = "High Fantasy"
    URBAN_FANTASY = "Urban Fantasy"
    STEAMPUNK = "Steampunk"
    HORROR = "Horror"
    MYSTERY = "Mystery"
    POLITICAL_INTRIGUE = "Political Intrigue"
    EXPLORATION = "Exploration & Discovery"
    WAR_CAMPAIGN = "War Campaign"
    PLANAR_ADVENTURE = "Planar Adventure"
    UNDERDARK = "Underdark"
    SEAFARING = "Seafaring Adventure"
    DESERT_NOMADS = "Desert Nomads"
    ARCTIC_SURVIVAL = "Arctic Survival"
    CUSTOM = "Custom"
    RANDOM = "Random"

# backend/services/scenario_generator.py
from typing import Tuple, Dict, List
from ..models.session import CampaignTheme
import random

class ScenarioGenerator:
    def __init__(self):
        self.theme_templates = {
            CampaignTheme.CLASSIC_FANTASY: {
                "settings": ["medieval kingdom", "ancient forest", "mountain stronghold", "coastal village"],
                "threats": ["dragon", "orc warband", "dark wizard", "undead plague"],
                "hooks": ["rescue mission", "ancient artifact", "political alliance", "mysterious disappearance"],
                "tone": "heroic and adventurous"
            },
            CampaignTheme.DARK_FANTASY: {
                "settings": ["cursed lands", "plague-ridden city", "haunted manor", "war-torn battlefield"],
                "threats": ["demon cult", "vampire lord", "corrupted noble", "eldritch horror"],
                "hooks": ["dark prophecy", "cursed bloodline", "forbidden knowledge", "moral dilemma"],
                "tone": "gritty and morally complex"
            },
            CampaignTheme.MYSTERY: {
                "settings": ["fog-shrouded town", "grand estate", "bustling port city", "remote monastery"],
                "threats": ["serial killer", "conspiracy", "shapeshifter", "secret society"],
                "hooks": ["murder investigation", "missing person", "stolen artifact", "coded message"],
                "tone": "investigative and suspenseful"
            },
            CampaignTheme.HORROR: {
                "settings": ["abandoned asylum", "cursed village", "ancient catacombs", "isolated mansion"],
                "threats": ["cosmic horror", "vengeful spirit", "mad scientist", "flesh-eating disease"],
                "hooks": ["survival horror", "psychological terror", "body horror", "cosmic revelation"],
                "tone": "terrifying and atmospheric"
            },
            CampaignTheme.POLITICAL_INTRIGUE: {
                "settings": ["royal court", "merchant guild", "diplomatic summit", "noble houses"],
                "threats": ["assassination plot", "succession crisis", "trade war", "foreign invasion"],
                "hooks": ["court intrigue", "diplomatic mission", "espionage", "power struggle"],
                "tone": "sophisticated and strategic"
            }
        }
    
    def generate_themed_scenario(self, theme: CampaignTheme) -> str:
        """Generate a scenario based on selected theme"""
        if theme not in self.theme_templates:
            return self.generate_random_scenario()[0]
        
        template = self.theme_templates[theme]
        setting = random.choice(template["settings"])
        threat = random.choice(template["threats"])
        hook = random.choice(template["hooks"])
        tone = template["tone"]
        
        scenario = f"""
**Campaign Theme: {theme.value}**

**Setting:** You find yourselves in {setting}, where the atmosphere is {tone}.

**The Situation:** A {threat} threatens the peace of this land. The locals speak in hushed tones about recent events, and there's a palpable sense of unease in the air.

**Your Hook:** You've been drawn into this situation through {hook}. Whether by choice, circumstance, or fate, you now stand at the threshold of adventure.

**Current Scene:** You are gathered at the local tavern as evening falls. The common room is unusually quiet, with patrons speaking in whispers. The barkeep keeps glancing nervously at the door, and you notice several locals have weapons within easy reach.

What do you do?
        """
        
        return scenario.strip()
    
    def generate_random_scenario(self) -> Tuple[str, CampaignTheme]:
        """Generate a completely random scenario"""
        # Pick a random theme (excluding CUSTOM and RANDOM)
        available_themes = [theme for theme in CampaignTheme if theme not in [CampaignTheme.CUSTOM, CampaignTheme.RANDOM]]
        selected_theme = random.choice(available_themes)
        
        scenario = self.generate_themed_scenario(selected_theme)
        return scenario, selected_theme
    
    def get_theme_descriptions(self) -> Dict[CampaignTheme, str]:
        """Get descriptions for each campaign theme"""
        return {
            CampaignTheme.CLASSIC_FANTASY: "Traditional D&D with heroes, dragons, and magic in a medieval setting",
            CampaignTheme.DARK_FANTASY: "Gritty, morally complex adventures in a harsh, unforgiving world",
            CampaignTheme.HIGH_FANTASY: "Epic adventures with powerful magic, ancient evils, and world-shaking events",
            CampaignTheme.URBAN_FANTASY: "Magic and monsters in a modern city setting",
            CampaignTheme.STEAMPUNK: "Victorian-era technology meets magic and adventure",
            CampaignTheme.HORROR: "Terrifying encounters with supernatural and psychological threats",
            CampaignTheme.MYSTERY: "Investigation-focused adventures with puzzles and secrets to uncover",
            CampaignTheme.POLITICAL_INTRIGUE: "Court politics, espionage, and diplomatic maneuvering",
            CampaignTheme.EXPLORATION: "Discovering new lands, ancient ruins, and hidden secrets",
            CampaignTheme.WAR_CAMPAIGN: "Military conflicts, battlefield tactics, and wartime heroics",
            CampaignTheme.PLANAR_ADVENTURE: "Travel between different planes of existence",
            CampaignTheme.UNDERDARK: "Adventures in the dangerous underground realm",
            CampaignTheme.SEAFARING: "Naval adventures, pirates, and ocean exploration",
            CampaignTheme.DESERT_NOMADS: "Survival and adventure in harsh desert environments",
            CampaignTheme.ARCTIC_SURVIVAL: "Endurance and exploration in frozen wastelands",
            CampaignTheme.RANDOM: "Let the AI surprise you with a randomly generated scenario"
        }
```

### 2. Event-Driven Game Flow

#### Game Loop Structure
```python
# backend/services/game_mechanics.py
from typing import List, Optional
from ..models.story import StoryEvent
from ..models.skill_check import SkillCheck
from ..models.character import Character

class GameMechanics:
    def __init__(self):
        self.current_turn = 0
        self.action_queue = []
    
    def process_event(self, event: StoryEvent, game_state: GameState) -> str:
        """Process a story event and generate next action prompt"""
        
        # Update game state with event
        game_state.add_event(event)
        
        # Generate AI response describing what happened
        ai_response = self._generate_event_response(event)
        
        # Create next action prompt
        next_action_prompt = self._create_next_action_prompt(event, game_state)
        
        return f"{ai_response}\n\n{next_action_prompt}"
    
    def _create_next_action_prompt(self, event: StoryEvent, game_state: GameState) -> str:
        """Create a prompt asking what the player wants to do next"""
        
        # Analyze the event to suggest logical next actions
        suggested_actions = self._suggest_next_actions(event, game_state)
        
        # Get current scene context
        scene_context = game_state.get_current_scene_context()
        
        prompt = f"""
{scene_context}

What would you like to do next? You could:
{suggested_actions}

Or describe any other action you'd like to take.
"""
        return prompt.strip()
    
    def _suggest_next_actions(self, event: StoryEvent, game_state: GameState) -> str:
        """Suggest logical next actions based on the current event"""
        
        suggestions = []
        
        if event.event_type == EventType.COMBAT:
            suggestions.extend([
                "• Continue fighting or attempt to flee",
                "• Use a special ability or spell",
                "• Try to negotiate or surrender",
                "• Search the area for loot or clues"
            ])
        elif event.event_type == EventType.DIALOGUE:
            suggestions.extend([
                "• Ask follow-up questions",
                "• Request more information",
                "• Make a deal or agreement",
                "• End the conversation and move on"
            ])
        elif event.event_type == EventType.EXPLORATION:
            suggestions.extend([
                "• Search the area more thoroughly",
                "• Move to a different location",
                "• Interact with objects or NPCs",
                "• Rest or prepare for what's ahead"
            ])
        elif event.event_type == EventType.ITEM_DISCOVERY:
            suggestions.extend([
                "• Examine the item more closely",
                "• Try to use or activate the item",
                "• Store it safely in your inventory",
                "• Ask companions about the item"
            ])
        
        # Add general suggestions
        suggestions.extend([
            "• Check your character status and abilities",
            "• Consult with your allies",
            "• Review your current objectives"
        ])
        
        return "\n".join(suggestions)
```

#### Turn Management
```python
class TurnManager:
    def __init__(self):
        self.current_turn = 0
        self.turn_order = []
        self.active_participants = []
    
    def start_new_turn(self, game_state: GameState):
        """Start a new game turn"""
        self.current_turn += 1
        
        # Determine turn order based on initiative or story flow
        self.turn_order = self._determine_turn_order(game_state)
        
        # Set active participant
        self.active_participants = self._get_active_participants(game_state)
        
        return self.current_turn
    
    def _determine_turn_order(self, game_state: GameState) -> List[str]:
        """Determine the order of actions for this turn"""
        # In story mode, this is usually player -> AI response -> next turn
        # In combat, this would use initiative rolls
        return ["player", "ai_response"]
    
    def _get_active_participants(self, game_state: GameState) -> List[str]:
        """Get who can act during this turn"""
        return game_state.active_characters + game_state.present_npcs
```

### 2. Skill Check System

#### D20 Roll Integration
```python
# backend/services/skill_check_service.py
import random
from typing import Dict, Optional, Tuple
from ..models.character import Character
from ..models.skill_check import SkillCheck, CheckResult

class SkillCheckSystem:
    def __init__(self):
        self.skill_modifiers = {
            "acrobatics": "dexterity",
            "animal_handling": "wisdom",
            "arcana": "intelligence",
            "athletics": "strength",
            "deception": "charisma",
            "history": "intelligence",
            "insight": "wisdom",
            "intimidation": "charisma",
            "investigation": "intelligence",
            "medicine": "wisdom",
            "nature": "intelligence",
            "perception": "wisdom",
            "performance": "charisma",
            "persuasion": "charisma",
            "religion": "intelligence",
            "sleight_of_hand": "dexterity",
            "stealth": "dexterity",
            "survival": "wisdom"
        }
    
    def process_skill_check(self, 
                          character: Character,
                          skill_name: str,
                          user_roll: int,
                          target_dc: Optional[int] = None,
                          advantage: bool = False,
                          disadvantage: bool = False) -> SkillCheck:
        """Process a skill check with user-provided D20 roll"""
        
        # Calculate modifiers
        attribute_modifier = self._calculate_attribute_modifier(character, skill_name)
        proficiency_bonus = self._calculate_proficiency_bonus(character, skill_name)
        other_modifiers = self._get_other_modifiers(character, skill_name)
        
        # Calculate total modifier
        total_modifier = attribute_modifier + proficiency_bonus + other_modifiers
        
        # Apply advantage/disadvantage if specified
        if advantage or disadvantage:
            user_roll = self._apply_advantage_disadvantage(user_roll, advantage, disadvantage)
        
        # Calculate final result
        final_result = user_roll + total_modifier
        
        # Determine outcome
        check_result = self._determine_check_result(final_result, target_dc)
        
        # Create skill check record
        skill_check = SkillCheck(
            id=f"check_{random.randint(1000, 9999)}",
            description=f"{skill_name.title()} check",
            primary_skill=skill_name,
            attribute=self.skill_modifiers.get(skill_name, "intelligence"),
            roll_result=user_roll,
            target_dc=target_dc,
            check_result=check_result,
            consequences=self._generate_consequences(check_result, skill_name),
            session_id=character.session_id,
            turn_number=character.current_turn
        )
        
        return skill_check
    
    def _calculate_attribute_modifier(self, character: Character, skill_name: str) -> int:
        """Calculate the attribute modifier for a skill"""
        attribute_name = self.skill_modifiers.get(skill_name, "intelligence")
        attribute_value = getattr(character, attribute_name)
        
        # D&D 5e modifier calculation: (score - 10) // 2
        return (attribute_value - 10) // 2
    
    def _calculate_proficiency_bonus(self, character: Character, skill_name: str) -> int:
        """Calculate proficiency bonus for a skill"""
        # Check if character is proficient in this skill
        if skill_name in character.abilities.get("proficiencies", []):
            # D&D 5e proficiency bonus: 2 + (level - 1) // 4
            return 2 + (character.level - 1) // 4
        return 0
    
    def _get_other_modifiers(self, character: Character, skill_name: str) -> int:
        """Get other modifiers (magical items, spells, etc.)"""
        total_modifier = 0
        
        # Check for magical item bonuses
        for item in character.inventory:
            if hasattr(item, 'skill_bonuses') and skill_name in item.skill_bonuses:
                total_modifier += item.skill_bonuses[skill_name]
        
        # Check for spell effects
        if hasattr(character, 'active_spells'):
            for spell in character.active_spells:
                if hasattr(spell, 'skill_bonuses') and skill_name in spell.skill_bonuses:
                    total_modifier += spell.skill_bonuses[skill_name]
        
        return total_modifier
    
    def _apply_advantage_disadvantage(self, roll: int, advantage: bool, disadvantage: bool) -> int:
        """Apply advantage or disadvantage to a roll"""
        if advantage and not disadvantage:
            # Roll a second D20 and take the higher
            second_roll = random.randint(1, 20)
            return max(roll, second_roll)
        elif disadvantage and not advantage:
            # Roll a second D20 and take the lower
            second_roll = random.randint(1, 20)
            return min(roll, second_roll)
        else:
            # No advantage or disadvantage, or both (cancel out)
            return roll
    
    def _determine_check_result(self, final_result: int, target_dc: Optional[int]) -> CheckResult:
        """Determine the result of a skill check"""
        if target_dc is None:
            # If no DC specified, use general guidelines
            if final_result >= 25:
                return CheckResult.CRITICAL_SUCCESS
            elif final_result >= 20:
                return CheckResult.SUCCESS
            elif final_result >= 15:
                return CheckResult.PARTIAL_SUCCESS
            elif final_result >= 10:
                return CheckResult.FAILURE
            else:
                return CheckResult.CRITICAL_FAILURE
        else:
            # Use specified DC
            if final_result >= target_dc + 10:
                return CheckResult.CRITICAL_SUCCESS
            elif final_result >= target_dc:
                return CheckResult.SUCCESS
            elif final_result >= target_dc - 5:
                return CheckResult.PARTIAL_SUCCESS
            elif final_result >= target_dc - 10:
                return CheckResult.FAILURE
            else:
                return CheckResult.CRITICAL_FAILURE
    
    def _generate_consequences(self, check_result: CheckResult, skill_name: str) -> str:
        """Generate consequences based on check result"""
        if check_result == CheckResult.CRITICAL_SUCCESS:
            return f"Exceptional {skill_name} success with significant benefits"
        elif check_result == CheckResult.SUCCESS:
            return f"Successful {skill_name} check with intended outcome"
        elif check_result == CheckResult.PARTIAL_SUCCESS:
            return f"Partial {skill_name} success with some benefits"
        elif check_result == CheckResult.FAILURE:
            return f"Failed {skill_check} check with consequences"
        else:  # CRITICAL_FAILURE
            return f"Critical {skill_name} failure with significant consequences"
```

#### Skill Check Integration in Game Flow
```python
class GameEngine:
    def __init__(self, context_manager: ContextManager, skill_system: SkillCheckSystem):
        self.context_manager = context_manager
        self.skill_system = skill_system
        self.turn_manager = TurnManager()
        self.current_session: Optional[GameSession] = None
        self.game_state: Optional[GameState] = None
    
    def process_player_action(self, action: str, skill_check_data: Optional[Dict] = None) -> str:
        """Process a player action and handle skill checks if needed"""
        
        # Check if action requires a skill check
        if skill_check_data:
            skill_check = self._process_skill_check(action, skill_check_data)
            # Update game state with skill check result
            self.game_state.add_skill_check(skill_check)
        
        # Build context for AI
        context = self.context_manager.build_context_for_action(
            action, self.game_state, self.game_state.campaign_status
        )
        
        # Get AI response
        ai_response = self.context_manager.get_ai_response(context)
        
        # Create story event
        event = StoryEvent.create_from_action(action, ai_response, self.game_state)
        
        # Process the event and get next action prompt
        full_response = self.turn_manager.process_event(event, self.game_state)
        
        # Update game state
        self._update_game_state(action, ai_response, skill_check_data)
        
        return full_response
    
    def _process_skill_check(self, action: str, skill_check_data: Dict) -> SkillCheck:
        """Process a skill check based on player action"""
        character = self.game_state.get_active_character()
        skill_name = skill_check_data["skill"]
        user_roll = skill_check_data["roll"]
        target_dc = skill_check_data.get("target_dc")
        advantage = skill_check_data.get("advantage", False)
        disadvantage = skill_check_data.get("disadvantage", False)
        
        return self.skill_system.process_skill_check(
            character, skill_name, user_roll, target_dc, advantage, disadvantage
        )
```

### 3. Web Interface for Skill Checks

#### Skill Check Interface Component
```typescript
// frontend/src/components/SkillCheckInterface.tsx
import React, { useState } from 'react';

interface SkillCheckData {
  skill: string;
  roll: number;
  targetDC?: number;
  advantage?: boolean;
  disadvantage?: boolean;
  action: string;
}

interface SkillCheckInterfaceProps {
  onSubmit: (data: SkillCheckData) => void;
  onCancel: () => void;
}

export const SkillCheckInterface: React.FC<SkillCheckInterfaceProps> = ({
  onSubmit,
  onCancel
}) => {
  const [skill, setSkill] = useState('');
  const [roll, setRoll] = useState('');
  const [targetDC, setTargetDC] = useState('');
  const [advantage, setAdvantage] = useState(false);
  const [disadvantage, setDisadvantage] = useState(false);
  const [action, setAction] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const rollNum = parseInt(roll);
    if (rollNum < 1 || rollNum > 20) {
      alert('Roll must be between 1 and 20');
      return;
    }

    onSubmit({
      skill: skill.toLowerCase(),
      roll: rollNum,
      targetDC: targetDC ? parseInt(targetDC) : undefined,
      advantage,
      disadvantage,
      action
    });
  };

  return (
    <div className="skill-check-modal">
      <h3>Skill Check</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Skill:</label>
          <select value={skill} onChange={(e) => setSkill(e.target.value)} required>
            <option value="">Select a skill</option>
            <option value="acrobatics">Acrobatics</option>
            <option value="athletics">Athletics</option>
            <option value="deception">Deception</option>
            <option value="insight">Insight</option>
            <option value="intimidation">Intimidation</option>
            <option value="investigation">Investigation</option>
            <option value="perception">Perception</option>
            <option value="persuasion">Persuasion</option>
            <option value="stealth">Stealth</option>
            <option value="survival">Survival</option>
          </select>
        </div>

        <div className="form-group">
          <label>Your D20 Roll:</label>
          <input
            type="number"
            min="1"
            max="20"
            value={roll}
            onChange={(e) => setRoll(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Target DC (optional):</label>
          <input
            type="number"
            min="1"
            value={targetDC}
            onChange={(e) => setTargetDC(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={advantage}
              onChange={(e) => setAdvantage(e.target.checked)}
            />
            Advantage
          </label>
          <label>
            <input
              type="checkbox"
              checked={disadvantage}
              onChange={(e) => setDisadvantage(e.target.checked)}
            />
            Disadvantage
          </label>
        </div>

        <div className="form-group">
          <label>What are you attempting?</label>
          <textarea
            value={action}
            onChange={(e) => setAction(e.target.value)}
            required
            placeholder="Describe what you're trying to do..."
          />
        </div>

        <div className="form-actions">
          <button type="button" onClick={onCancel}>Cancel</button>
          <button type="submit">Submit Skill Check</button>
        </div>
      </form>
    </div>
  );
};
```

#### Skill Check Results Display
```typescript
// frontend/src/components/SkillCheckResult.tsx
import React from 'react';
import { SkillCheck, CheckResult } from '../types/skillCheck';
import { Character } from '../types/character';

interface SkillCheckResultProps {
  skillCheck: SkillCheck;
  character: Character;
}

export const SkillCheckResult: React.FC<SkillCheckResultProps> = ({
  skillCheck,
  character
}) => {
  const attributeModifier = Math.floor((character[skillCheck.attribute] - 10) / 2);
  const proficiencyBonus = character.abilities.proficiencies?.includes(skillCheck.primary_skill) 
    ? 2 + Math.floor((character.level - 1) / 4) 
    : 0;
  const totalResult = skillCheck.roll_result + attributeModifier + proficiencyBonus;

  const getResultColor = (result: CheckResult) => {
    switch (result) {
      case CheckResult.CRITICAL_SUCCESS:
        return 'text-green-600 bg-green-100';
      case CheckResult.SUCCESS:
        return 'text-green-500 bg-green-50';
      case CheckResult.PARTIAL_SUCCESS:
        return 'text-yellow-500 bg-yellow-50';
      case CheckResult.FAILURE:
        return 'text-red-500 bg-red-50';
      case CheckResult.CRITICAL_FAILURE:
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-500 bg-gray-50';
    }
  };

  return (
    <div className={`skill-check-result p-4 rounded-lg border ${getResultColor(skillCheck.check_result)}`}>
      <h4 className="font-bold text-lg mb-2">
        Skill Check: {skillCheck.primary_skill.charAt(0).toUpperCase() + skillCheck.primary_skill.slice(1)}
      </h4>
      
      <div className="grid grid-cols-2 gap-4 mb-3">
        <div>
          <span className="font-semibold">D20 Roll:</span> {skillCheck.roll_result}
        </div>
        <div>
          <span className="font-semibold">Attribute Modifier:</span> {attributeModifier >= 0 ? '+' : ''}{attributeModifier}
        </div>
        <div>
          <span className="font-semibold">Proficiency Bonus:</span> +{proficiencyBonus}
        </div>
        <div>
          <span className="font-semibold">Total Result:</span> {totalResult}
        </div>
      </div>
      
      <div className="mb-2">
        <span className="font-semibold">Outcome:</span> {skillCheck.check_result.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
      </div>
      
      <div>
        <span className="font-semibold">Consequences:</span> {skillCheck.consequences}
      </div>
    </div>
  );
};
```

## Web Interface Components

### 1. Frontend Architecture (`frontend/src/`)

#### Campaign Selection Component
```typescript
// frontend/src/components/CampaignSelector.tsx
import React, { useState, useEffect } from 'react';
import { Campaign, CampaignTheme } from '../types/campaign';

interface CampaignSelectorProps {
  onCampaignSelect: (campaign: Campaign) => void;
  onNewCampaign: () => void;
}

export const CampaignSelector: React.FC<CampaignSelectorProps> = ({
  onCampaignSelect,
  onNewCampaign
}) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      const response = await fetch('/api/campaigns');
      const data = await response.json();
      setCampaigns(data);
    } catch (error) {
      console.error('Failed to load campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="campaign-selector">
      <h1>Welcome to AI-Powered D&D</h1>
      
      <div className="campaign-options">
        <button onClick={onNewCampaign} className="new-campaign-btn">
          Start New Campaign
        </button>
        
        {campaigns.length > 0 && (
          <div className="existing-campaigns">
            <h2>Load Existing Campaign</h2>
            {campaigns.map(campaign => (
              <div key={campaign.id} className="campaign-card">
                <h3>{campaign.name}</h3>
                <p>{campaign.theme}</p>
                <p>Last played: {campaign.lastPlayed}</p>
                <button onClick={() => onCampaignSelect(campaign)}>
                  Load Campaign
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
```

#### Character Creation Wizard
```typescript
// frontend/src/components/CharacterCreator.tsx
import React, { useState } from 'react';
import { Character, CharacterType } from '../types/character';

interface CharacterCreatorProps {
  onCharacterCreated: (character: Character) => void;
}

export const CharacterCreator: React.FC<CharacterCreatorProps> = ({
  onCharacterCreated
}) => {
  const [characterType, setCharacterType] = useState<CharacterType>('human');
  const [step, setStep] = useState(1);
  const [character, setCharacter] = useState<Partial<Character>>({});

  const handleTypeSelection = (type: CharacterType) => {
    setCharacterType(type);
    if (type === 'ai') {
      // AI characters are generated by LLM
      generateAICharacter();
    } else {
      setStep(2); // Start human character creation
    }
  };

  const generateAICharacter = async () => {
    try {
      const response = await fetch('/api/characters/generate-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ characterType: 'ai' })
      });
      const aiCharacter = await response.json();
      onCharacterCreated(aiCharacter);
    } catch (error) {
      console.error('Failed to generate AI character:', error);
    }
  };

  return (
    <div className="character-creator">
      <h2>Create Your Character</h2>
      
      {step === 1 && (
        <div className="character-type-selection">
          <h3>Choose Character Type</h3>
          <button onClick={() => handleTypeSelection('human')}>
            Human Character
          </button>
          <button onClick={() => handleTypeSelection('ai')}>
            AI Character
          </button>
        </div>
      )}

      {step === 2 && characterType === 'human' && (
        <div className="human-character-wizard">
          {/* Step-by-step human character creation */}
          <HumanCharacterWizard 
            character={character}
            onCharacterUpdate={setCharacter}
            onComplete={onCharacterCreated}
          />
        </div>
      )}
    </div>
  );
};
```

#### Game Interface (ChatGPT-style)
```typescript
// frontend/src/components/GameInterface.tsx
import React, { useState, useEffect, useRef } from 'react';
import { ChatInterface } from './ChatInterface';
import { CharacterSheet } from './CharacterSheet';
import { CampaignOverview } from './CampaignOverview';

interface GameInterfaceProps {
  campaign: Campaign;
  characters: Character[];
}

export const GameInterface: React.FC<GameInterfaceProps> = ({
  campaign,
  characters
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const sendMessage = async (content: string, skillCheckData?: SkillCheckData) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: 'player',
      timestamp: new Date(),
      skillCheckData
    };

    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    try {
      const response = await fetch('/api/gameplay/act', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: content,
          skillCheckData,
          campaignId: campaign.id
        })
      });

      const data = await response.json();
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        sender: 'ai',
        timestamp: new Date(),
        nextActions: data.nextActions
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="game-interface">
      <div className="main-content">
        <ChatInterface 
          messages={messages}
          onSendMessage={sendMessage}
          loading={loading}
        />
      </div>
      
      <div className="sidebar">
        <CampaignOverview campaign={campaign} />
        <CharacterSheet characters={characters} />
      </div>
    </div>
  );
};
```

#### Skill Check Interface
```typescript
// frontend/src/components/SkillCheckInterface.tsx
import React, { useState } from 'react';

interface SkillCheckData {
  skill: string;
  roll: number;
  targetDC?: number;
  advantage?: boolean;
  disadvantage?: boolean;
  action: string;
}

interface SkillCheckInterfaceProps {
  onSubmit: (data: SkillCheckData) => void;
  onCancel: () => void;
}

export const SkillCheckInterface: React.FC<SkillCheckInterfaceProps> = ({
  onSubmit,
  onCancel
}) => {
  const [skill, setSkill] = useState('');
  const [roll, setRoll] = useState('');
  const [targetDC, setTargetDC] = useState('');
  const [advantage, setAdvantage] = useState(false);
  const [disadvantage, setDisadvantage] = useState(false);
  const [action, setAction] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const rollNum = parseInt(roll);
    if (rollNum < 1 || rollNum > 20) {
      alert('Roll must be between 1 and 20');
      return;
    }

    onSubmit({
      skill: skill.toLowerCase(),
      roll: rollNum,
      targetDC: targetDC ? parseInt(targetDC) : undefined,
      advantage,
      disadvantage,
      action
    });
  };

  return (
    <div className="skill-check-modal">
      <h3>Skill Check</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Skill:</label>
          <select value={skill} onChange={(e) => setSkill(e.target.value)} required>
            <option value="">Select a skill</option>
            <option value="acrobatics">Acrobatics</option>
            <option value="athletics">Athletics</option>
            <option value="deception">Deception</option>
            <option value="insight">Insight</option>
            <option value="intimidation">Intimidation</option>
            <option value="investigation">Investigation</option>
            <option value="perception">Perception</option>
            <option value="persuasion">Persuasion</option>
            <option value="stealth">Stealth</option>
            <option value="survival">Survival</option>
          </select>
        </div>

        <div className="form-group">
          <label>Your D20 Roll:</label>
          <input
            type="number"
            min="1"
            max="20"
            value={roll}
            onChange={(e) => setRoll(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Target DC (optional):</label>
          <input
            type="number"
            min="1"
            value={targetDC}
            onChange={(e) => setTargetDC(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={advantage}
              onChange={(e) => setAdvantage(e.target.checked)}
            />
            Advantage
          </label>
          <label>
            <input
              type="checkbox"
              checked={disadvantage}
              onChange={(e) => setDisadvantage(e.target.checked)}
            />
            Disadvantage
          </label>
        </div>

        <div className="form-group">
          <label>What are you attempting?</label>
          <textarea
            value={action}
            onChange={(e) => setAction(e.target.value)}
            required
            placeholder="Describe what you're trying to do..."
          />
        </div>

        <div className="form-actions">
          <button type="button" onClick={onCancel}>Cancel</button>
          <button type="submit">Submit Skill Check</button>
        </div>
      </form>
    </div>
  );
};
```

### 2. Backend API Endpoints (`backend/api/`)

#### Campaign API
```python
# backend/api/campaigns.py
from fastapi import APIRouter, HTTPException
from typing import List, Optional
from ..models.campaign import Campaign, CampaignTheme
from ..services.session_manager import MultiSessionManager

router = APIRouter(prefix="/api/campaigns", tags=["campaigns"])

@router.get("/")
async def list_campaigns() -> List[Campaign]:
    """List all available campaigns"""
    return session_manager.list_sessions()

@router.post("/")
async def create_campaign(
    name: str,
    theme: Optional[CampaignTheme] = None,
    custom_scenario: Optional[str] = None
) -> dict:
    """Create a new campaign"""
    try:
        result = session_manager.create_new_campaign(name, theme, custom_scenario)
        return {"message": result, "success": True}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{campaign_id}")
async def get_campaign(campaign_id: str) -> Campaign:
    """Get campaign details"""
    campaign = session_manager.get_campaign(campaign_id)
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return campaign
```

#### Character API
```python
# backend/api/characters.py
from fastapi import APIRouter, HTTPException
from typing import List
from ..models.character import Character, CharacterType
from ..services.character_service import CharacterService

router = APIRouter(prefix="/api/characters", tags=["characters"])

@router.post("/generate-ai")
async def generate_ai_character(character_type: CharacterType) -> Character:
    """Generate an AI character using the LLM"""
    try:
        character = character_service.generate_ai_character()
        return character
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/")
async def create_character(character: Character) -> Character:
    """Create a new character"""
    try:
        created_character = character_service.create_character(character)
        return created_character
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/")
async def list_characters() -> List[Character]:
    """List all characters"""
    return character_service.list_characters()
```

#### Gameplay API
```python
# backend/api/gameplay.py
from fastapi import APIRouter, HTTPException
from typing import Optional, Dict, Any
from ..models.skill_check import SkillCheckData
from ..services.game_engine import GameEngine

router = APIRouter(prefix="/api/gameplay", tags=["gameplay"])

@router.post("/act")
async def perform_action(
    action: str,
    skill_check_data: Optional[SkillCheckData] = None,
    campaign_id: str = None
) -> dict:
    """Perform a game action"""
    try:
        result = game_engine.process_player_action(action, skill_check_data)
        return {
            "response": result,
            "nextActions": game_engine.get_suggested_actions(),
            "success": True
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
```

### 3. Responsive Design and User Experience

#### CSS Framework and Styling
```css
/* frontend/src/index.css */
:root {
  --primary-color: #2c3e50;
  --secondary-color: #3498db;
  --accent-color: #e74c3c;
  --background-color: #ecf0f1;
  --text-color: #2c3e50;
  --border-color: #bdc3c7;
}

.game-interface {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 20px;
  height: 100vh;
  padding: 20px;
}

.main-content {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  overflow: hidden;
}

.sidebar {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  padding: 20px;
}

/* Responsive design */
@media (max-width: 768px) {
  .game-interface {
    grid-template-columns: 1fr;
  }
  
  .sidebar {
    order: -1;
  }
}
```

## Data Flow

### 1. Game Initialization
```
User Web Interface → React Frontend → FastAPI Backend → Load/Create Session → Initialize Game State
```

### 2. Game Play Loop
```
Player Input → React Frontend → FastAPI API → Game Engine → Context Manager → AI Client → AI Response → Update Game State → Return Response → Update UI
```

### 3. Context Building
```
Game State → Story Events → Context Manager → Context Compression → AI Prompt
```

### 4. State Persistence
```
Game State Changes → Story Events → Database Service → MongoDB
```

### 5. Real-time Updates
```
Game State Changes → WebSocket/HTTP → React Frontend → UI Updates
```

## Configuration

### Environment Variables
```bash
# .env
GEMINI_API_KEY=your_api_key_here
GAME_DATA_DIR=data
MAX_CONTEXT_TOKENS=8000
LOG_LEVEL=INFO
FRONTEND_URL=http://localhost:3000
```

### Configuration File
```yaml
# config/game_config.yaml
game:
  max_characters: 6
  max_session_duration: 4h
  auto_save_interval: 5m

ai:
  model: gemini-pro
  max_context_tokens: 8000
  response_timeout: 30s
  retry_attempts: 3

storage:
  backup_enabled: true
  backup_interval: 1h
  max_backups: 10
  compression_enabled: true

frontend:
  theme: "default"
  responsive_breakpoints: [768, 1024, 1440]
  animations_enabled: true
  real_time_updates: true
```

## Error Handling

### API Error Handling
```python
class AIError(Exception):
    """Base class for AI-related errors"""
    pass

class RateLimitError(AIError):
    """Raised when API rate limit is exceeded"""
    pass

class ContextTooLargeError(AIError):
    """Raised when context exceeds token limits"""
    pass

def handle_ai_error(error: Exception) -> str:
    """Handle AI API errors gracefully"""
    if isinstance(error, RateLimitError):
        return "AI is temporarily unavailable. Please wait a moment and try again."
    elif isinstance(error, ContextTooLargeError):
        return "Story context is too complex. Starting fresh scene."
    else:
        return "AI encountered an error. Please try again."
```

### Data Validation
```python
from pydantic import ValidationError

def validate_game_data(data: Dict[str, Any]) -> bool:
    """Validate game data before processing"""
    try:
        # Validate data structure
        GameState(**data)
        return True
    except ValidationError as e:
        print(f"Data validation error: {e}")
        return False
```

## Performance Considerations

### Backend Performance
- **Context Cache**: Cache frequently used context elements
- **Response Cache**: Cache AI responses for common scenarios
- **Character Cache**: Cache character data in memory

### Frontend Performance
- **Component Memoization**: Use React.memo and useMemo for expensive components
- **Virtual Scrolling**: Implement virtual scrolling for long chat histories
- **Image Optimization**: Optimize character portraits and UI assets
- **Bundle Splitting**: Split code into chunks for faster loading

### Async Operations
- **Context Building**: Build context asynchronously
- **AI Communication**: Handle API calls asynchronously
- **File I/O**: Use async file operations for large data
- **Real-time Updates**: Use WebSockets for live game state updates

### Memory Management
- **Context Compression**: Compress old context to save memory
- **Event Cleanup**: Archive old story events
- **Garbage Collection**: Regular cleanup of unused data
- **Frontend Memory**: Implement proper cleanup in React components

## Security Considerations

### API Key Management
- Store API keys in environment variables
- Never commit keys to version control
- Use key rotation when possible

### Frontend Security
- **Input Sanitization**: Sanitize all user inputs to prevent XSS
- **CSRF Protection**: Implement CSRF tokens for form submissions
- **Content Security Policy**: Set up CSP headers to prevent code injection
- **HTTPS Enforcement**: Force HTTPS in production

### Backend Security
- **Input Validation**: Validate all user input using Pydantic
- **Rate Limiting**: Implement rate limiting for API endpoints
- **Authentication**: Add user authentication for sensitive operations
- **CORS Configuration**: Properly configure CORS for frontend access

### Data Security
- **Data Validation**: Validate all user input
- **Data Sanitization**: Sanitize data before storage
- **Access Controls**: Implement access controls for sensitive data
- **Encryption**: Encrypt sensitive game data at rest

### Backup Security
- Encrypt sensitive game data
- Secure backup storage location
- Implement backup verification
