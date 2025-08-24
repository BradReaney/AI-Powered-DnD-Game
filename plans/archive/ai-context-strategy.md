# AI Context Management Strategy

## Problem Statement
The primary challenge is ensuring the Gemini AI maintains full knowledge of the story history and character development across multiple sessions, while working within API context limits and maintaining coherent storytelling.

## Context Management Architecture

### 1. Multi-Layer Context System

#### Layer 1: Immediate Context (Last 10-15 interactions)
- Recent dialogue and actions
- Current scene description
- Active character states
- Immediate consequences of recent actions

#### Layer 2: Session Context (Current play session)
- Session summary
- Character development in current session
- Quest progress and objectives
- World changes during session

#### Layer 3: Long-term Context (Campaign history)
- Compressed story summary
- Character relationship evolution
- Major world events and consequences
- Completed quests and their impact

#### Layer 4: Character Context (Individual character knowledge)
- Character sheets and stats
- Personal history and motivations
- Relationships with NPCs and other characters
- Character-specific knowledge and experiences

### 2. Context Compression Techniques

#### Story Summarization
```typescript
class StorySummarizer {
    generateSessionSummary(events: StoryEvent[]): string {
        // Generate a concise summary of the current session
    }
    
    generateCampaignSummary(sessions: GameSession[]): string {
        // Generate a high-level campaign summary
    }
    
    compressEvents(events: StoryEvent[], maxTokens: number): string {
        // Compress events to fit within token limits
    }
    
    summarizeSkillChecks(skillChecks: SkillCheck[]): string {
        // Summarize recent skill check outcomes and consequences
    }
    
    summarizeNPCRelationships(npcs: NPC[]): string {
        // Summarize current NPC relationships and statuses
    }
    
    summarizeInventoryChanges(items: Item[]): string {
        // Summarize important items and their significance
    }
}

#### Hierarchical Memory
- **Episodic Memory**: Individual story events with timestamps
- **Semantic Memory**: Abstracted knowledge and relationships
- **Procedural Memory**: Rules and mechanics learned through play
- **Character Memory**: Individual character development and relationships
- **World Memory**: Location knowledge and world state changes
- **Item Memory**: Important items and their magical properties

#### Context Chunking
- Break long histories into digestible chunks
- Use sliding window approach for recent events
- Maintain critical information across all chunks
- Group related information (skill checks, NPC interactions, item discoveries)
- Prioritize context based on current scene and objectives

### 3. AI Prompt Engineering Strategy

#### Context Injection Pattern
```
[SYSTEM CONTEXT]
You are a Dungeon Master for a D&D campaign. Use the following context to maintain story continuity:

[CAMPAIGN SUMMARY]
{compressed_campaign_history}

[SESSION SUMMARY]
{current_session_summary}

[CURRENT POSITION]
Location: {current_location}
Description: {location_description}
Active Characters: {active_characters}
Present NPCs: {present_npcs}

[CHARACTER CONTEXT]
{active_characters_and_relationships}

[NPC RELATIONSHIPS]
Allies: {ally_summary}
Enemies: {enemy_summary}
Current NPC Status: {npc_status_summary}

[INVENTORY & ITEMS]
Important Items: {key_items_summary}
Magical Items: {magical_items_summary}
Recent Discoveries: {recent_items_summary}

[WORLD STATE]
Known Locations: {known_locations}
Active Threats: {active_threats}
Completed Objectives: {completed_objectives}

[RECENT EVENTS]
Last 5 Interactions: {recent_events}
Recent Skill Checks: {skill_check_summary}

[CURRENT OBJECTIVES]
Mission: {current_mission}
Immediate Goals: {immediate_goals}
Plot Hooks: {available_plot_hooks}

[INSTRUCTIONS]
- Maintain consistency with established story elements
- Reference past events and character development
- Ensure NPCs remember previous interactions
- Continue the story naturally from where it left off
- Consider the consequences of recent skill checks
- Incorporate discovered items and locations into responses
- Maintain NPC relationship dynamics and statuses
```

#### Dynamic Context Selection
- Prioritize context based on current scene
- Include character-specific knowledge when relevant
- Adapt context depth based on interaction type

### 4. Implementation Strategy

#### Context Manager Class
```python
class ContextManager:
    def __init__(self, max_context_tokens: int = 8000):
        self.max_context_tokens = max_context_tokens
        self.prompt_builder = PromptBuilder()
        self.story_summarizer = StorySummarizer()
    
    def build_context_for_action(self, 
                               action: str,
                               game_state: GameState,
                               campaign_status: CampaignStatus) -> str:
        """Build optimized context for AI action processing"""
        
        # Get current game context
        current_context = game_state.get_current_context()
        
        # Build layered context
        context_layers = {
            "campaign_summary": self._get_campaign_summary(game_state),
            "session_summary": self._get_session_summary(game_state),
            "current_position": self._format_current_position(campaign_status),
            "active_characters": self._format_characters(current_context["active_characters"]),
            "npc_relationships": self._format_npc_relationships(game_state.npcs),
            "inventory_items": self._format_inventory_items(game_state.items),
            "world_state": self._format_world_state(campaign_status),
            "recent_events": self._format_recent_events(current_context["recent_events"]),
            "skill_checks": self._format_recent_skill_checks(game_state.recent_skill_checks),
            "current_objectives": self._format_objectives(campaign_status),
            "player_action": action
        }
        
        # Build and optimize prompt
        prompt = self.prompt_builder.build_action_prompt(context_layers)
        
        # Ensure context fits within token limits
        if self._estimate_tokens(prompt) > self.max_context_tokens:
            prompt = self._compress_context(prompt)
        
        return prompt
    
    def _format_current_position(self, campaign_status: CampaignStatus) -> str:
        """Format current position information"""
        return f"Location: {campaign_status.current_location}\nDescription: {campaign_status.location_description}"
    
    def _format_npc_relationships(self, npcs: List[NPC]) -> str:
        """Format NPC relationship information"""
        allies = [npc for npc in npcs if npc.relationship in [NPCRelationship.ALLY, NPCRelationship.MENTOR]]
        enemies = [npc for npc in npcs if npc.relationship == NPCRelationship.ENEMY]
        
        ally_summary = "\n".join([f"- {npc.name} ({npc.npc_type}): {', '.join(npc.specializations)}" for npc in allies])
        enemy_summary = "\n".join([f"- {npc.name} ({npc.npc_type}): {npc.status} at {npc.current_location}" for npc in enemies])
        
        return f"Allies:\n{ally_summary}\n\nEnemies:\n{enemy_summary}"
    
    def _format_inventory_items(self, items: List[Item]) -> str:
        """Format inventory and item information"""
        magical_items = [item for item in items if item.item_type == ItemType.MAGICAL]
        key_items = [item for item in items if item.importance_level in ["major", "critical"]]
        
        magical_summary = "\n".join([f"- {item.name}: {', '.join(item.magical_properties)}" for item in magical_items])
        key_summary = "\n".join([f"- {item.name}: {item.description}" for item in key_items])
        
        return f"Magical Items:\n{magical_summary}\n\nKey Items:\n{key_summary}"
    
    def _format_recent_skill_checks(self, skill_checks: List[SkillCheck]) -> str:
        """Format recent skill check information"""
        recent_checks = skill_checks[-5:]  # Last 5 skill checks
        summary = []
        
        for check in recent_checks:
            outcome = "✓" if check.check_result in [CheckResult.SUCCESS, CheckResult.CRITICAL_SUCCESS] else "✗"
            summary.append(f"{outcome} {check.description}: {check.consequences}")
        
        return "\n".join(summary)
    
    def _format_objectives(self, campaign_status: CampaignStatus) -> str:
        """Format current objectives and goals"""
        return f"Current Mission: {campaign_status.current_mission}\nImmediate Goals: {', '.join(campaign_status.immediate_goals)}"
    
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

### 5. Skill Check Integration with AI Context

#### Skill Check Impact on Story
```python
class SkillCheckContextIntegrator:
    def __init__(self):
        self.skill_check_analyzer = SkillCheckAnalyzer()
    
    def integrate_skill_check_context(self, 
                                   skill_check: SkillCheck,
                                   game_state: GameState,
                                   ai_prompt: str) -> str:
        """Integrate skill check results into AI context for better storytelling"""
        
        # Analyze skill check for story impact
        story_impact = self.skill_check_analyzer.analyze_story_impact(skill_check, game_state)
        
        # Enhance AI prompt with skill check context
        enhanced_prompt = f"""
{ai_prompt}

[RECENT SKILL CHECK CONTEXT]
Skill: {skill_check.primary_skill.title()}
Result: {skill_check.check_result.value.replace('_', ' ').title()}
Consequences: {skill_check.consequences}
Story Impact: {story_impact}

[INSTRUCTIONS FOR AI]
- Consider the outcome of this skill check when crafting your response
- Reference the consequences and story impact in your narrative
- Ensure the story flows naturally from this skill check result
- Maintain consistency with the character's demonstrated abilities
"""
        
        return enhanced_prompt
    
    def update_context_after_skill_check(self, 
                                       skill_check: SkillCheck,
                                       game_state: GameState):
        """Update game context based on skill check results"""
        
        # Update character development
        if skill_check.character_development:
            character = game_state.get_character(skill_check.character_id)
            character.add_development_note(skill_check.character_development)
        
        # Update world state
        if skill_check.world_impact:
            game_state.world_state.add_impact_note(skill_check.world_impact)
        
        # Update NPC relationships if applicable
        if skill_check.primary_skill in ["persuasion", "intimidation", "deception"]:
            self._update_npc_relationship_from_skill_check(skill_check, game_state)
    
    def _update_npc_relationship_from_skill_check(self, 
                                                skill_check: SkillCheck,
                                                game_state: GameState):
        """Update NPC relationships based on social skill check results"""
        
        # Find NPCs involved in the interaction
        involved_npcs = self._find_involved_npcs(skill_check, game_state)
        
        for npc in involved_npcs:
            if skill_check.check_result in [CheckResult.SUCCESS, CheckResult.CRITICAL_SUCCESS]:
                # Positive relationship change
                npc.improve_relationship(skill_check.character_id)
            elif skill_check.check_result in [CheckResult.FAILURE, CheckResult.CRITICAL_FAILURE]:
                # Negative relationship change
                npc.worsen_relationship(skill_check.character_id)
```

#### Skill Check History in Context
```python
class SkillCheckHistoryContext:
    def __init__(self):
        self.skill_pattern_analyzer = SkillPatternAnalyzer()
    
    def build_skill_check_context(self, 
                                character: Character,
                                game_state: GameState) -> str:
        """Build context about character's skill check history and patterns"""
        
        # Get recent skill checks for this character
        recent_checks = game_state.get_character_skill_checks(character.id, limit=10)
        
        # Analyze skill patterns
        skill_patterns = self.skill_pattern_analyzer.analyze_patterns(recent_checks)
        
        # Build context summary
        context = f"""
[CHARACTER SKILL HISTORY]
Recent Skill Performance:
{self._format_skill_performance(recent_checks)}

Skill Patterns:
{self._format_skill_patterns(skill_patterns)}

Character Development from Skills:
{self._format_skill_development(recent_checks)}
"""
        
        return context
    
    def _format_skill_performance(self, skill_checks: List[SkillCheck]) -> str:
        """Format recent skill check performance"""
        if not skill_checks:
            return "No recent skill checks recorded."
        
        performance_summary = []
        for check in skill_checks[-5:]:  # Last 5 checks
            outcome = "✓" if check.check_result in [CheckResult.SUCCESS, CheckResult.CRITICAL_SUCCESS] else "✗"
            performance_summary.append(f"{outcome} {check.primary_skill.title()}: {check.consequences}")
        
        return "\n".join(performance_summary)
    
    def _format_skill_patterns(self, patterns: Dict) -> str:
        """Format identified skill patterns"""
        if not patterns:
            return "No clear skill patterns identified yet."
        
        pattern_summary = []
        for skill, pattern in patterns.items():
            pattern_summary.append(f"- {skill.title()}: {pattern['description']}")
        
        return "\n".join(pattern_summary)
    
    def _format_skill_development(self, skill_checks: List[SkillCheck]) -> str:
        """Format character development from skill checks"""
        development_notes = []
        
        for check in skill_checks:
            if check.character_development:
                development_notes.append(f"- {check.primary_skill.title()}: {check.character_development}")
        
        if not development_notes:
            return "No character development recorded from recent skill checks."
        
        return "\n".join(development_notes)
```

#### Context Optimization Algorithms
1. **Relevance Scoring**: Score context elements by relevance to current scene
2. **Temporal Weighting**: Give more weight to recent events
3. **Character Proximity**: Prioritize context related to active characters
4. **Story Arc Tracking**: Maintain critical plot points across compression

### 5. Data Structures for Context Management

#### Story Event Compression
```python
class CompressedStoryEvent:
    original_event: StoryEvent
    compressed_summary: str
    key_elements: List[str]  # Names, locations, consequences
    emotional_impact: str
    character_development: Dict[str, str]
    
class StoryArc:
    arc_id: str
    title: str
    summary: str
    key_events: List[CompressedStoryEvent]
    consequences: List[str]
    character_development: Dict[str, str]
```

#### Character Memory System
```python
class CharacterMemory:
    character_id: str
    personal_history: List[PersonalEvent]
    relationships: Dict[str, Relationship]
    knowledge: Dict[str, KnowledgeItem]
    emotional_state: EmotionalState
    goals_and_motivations: List[str]
```

### 6. Context Persistence Strategy

#### Storage Format
- **JSON for human readability**
- **SQLite for complex queries**
- **Compressed summaries for long-term storage**
- **Incremental updates to avoid full rewrites**

#### Backup and Recovery
- Automatic context backups before major changes
- Version control for story development
- Export/import functionality for campaign sharing

### 7. Performance Considerations

#### Token Usage Optimization
- Monitor API token usage per request
- Implement context caching for repeated elements
- Use compression ratios to predict token needs

#### Response Time Management
- Pre-generate common context elements
- Cache frequently used context chunks
- Implement async context building for complex scenarios

### 8. Testing and Validation

#### Context Consistency Tests
- Verify character memory across sessions
- Test story continuity with compressed context
- Validate NPC behavior consistency

#### Performance Benchmarks
- Context building time
- Token usage efficiency
- AI response quality with compressed context

## Implementation Priority

### Phase 1: Basic Context Management
1. Implement basic context building
2. Create story event storage
3. Basic context compression

### Phase 2: Advanced Context Optimization
1. Implement relevance scoring
2. Add story arc tracking
3. Character memory system

### Phase 3: Context Intelligence
1. Dynamic context selection
2. Context quality metrics
3. Automated context optimization

## Success Metrics
- [ ] Context fits within Gemini API limits
- [ ] Story continuity maintained across sessions
- [ ] Character consistency preserved
- [ ] Context building time < 2 seconds
- [ ] Token usage efficiency > 80%
