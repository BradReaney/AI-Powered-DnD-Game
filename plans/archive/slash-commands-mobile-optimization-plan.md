# Slash Commands & Mobile Optimization Implementation Plan

## Overview
This plan outlines the implementation of slash commands to replace the game tools sidebar and optimize the game session screen for mobile devices. The goal is to create a more mobile-friendly interface where all game tools are accessible through intuitive slash commands in the chat interface.

## Current State Analysis

### Existing Components
- **GameChat**: Main chat interface with AI DM responses
- **GameTools**: Sidebar with 4 tabs (Dice, Combat, Character, AI)
- **DiceRoller**: Dedicated dice rolling component
- **GameSession**: Session setup and management

### Current Issues
1. Game tools sidebar takes up valuable screen space on mobile
2. Items are off-screen and hard to read on small devices
3. Tabbed interface is not mobile-optimized
4. Chat area is constrained by sidebar width

## Implementation Goals

### 1. Slash Command System
- Replace all game tools with slash commands
- Implement local command processing (no API calls for most commands)
- Maintain dice rolling functionality
- Add comprehensive help system

### 2. Mobile Optimization
- Remove game tools sidebar
- Expand chat to full screen width
- Keep campaign/character info card at top
- Ensure all content is mobile-readable

### 3. Command Categories
- **Character Commands**: `/character`, `/stats`, `/inventory`
- **Dice Commands**: `/dice`, `/roll`, `/d20`, `/attack`
- **Combat Commands**: `/attack`, `/defend`, `/spell`, `/initiative`
- **Utility Commands**: `/help`, `/location`, `/status`

## Technical Implementation

### Phase 1: Slash Command Infrastructure

#### 1.1 Command Parser Service
```typescript
// services/CommandParserService.ts
interface CommandResult {
  command: string;
  args: string[];
  isValid: boolean;
  error?: string;
}

interface CommandHandler {
  name: string;
  description: string;
  usage: string;
  examples: string[];
  execute: (args: string[], character: Character, campaign: Campaign) => CommandResponse;
}
```

#### 1.2 Command Registry
```typescript
// services/CommandRegistry.ts
class CommandRegistry {
  private commands: Map<string, CommandHandler> = new Map();
  
  register(command: CommandHandler): void;
  execute(input: string, character: Character, campaign: Campaign): CommandResponse;
  getHelp(): CommandHelp[];
}
```

### Phase 2: Individual Command Implementations

#### 2.1 Character Commands
- `/character` - Display character sheet info
- `/stats` - Show ability scores and modifiers
- `/inventory` - List character items and equipment
- `/proficiency` - Show proficiency bonuses

#### 2.2 Dice Commands
- `/dice 1d20` - Roll specific dice
- `/dice 1d20+5` - Roll with modifier
- `/roll 3d6` - Alternative dice syntax
- `/attack` - Roll attack with character's attack bonus

#### 2.3 Combat Commands
- `/attack [weapon]` - Perform attack roll
- `/defend` - Take defensive action
- `/spell [spell]` - Cast spell
- `/initiative` - Roll initiative

#### 2.4 Utility Commands
- `/help` - Show all available commands
- `/help [command]` - Show specific command help
- `/location` - Show current location info
- `/status` - Show character status

### Phase 3: UI Integration

#### 3.1 Chat Input Enhancement
- Add slash command detection
- Implement command autocomplete
- Show command suggestions
- Display command help inline

#### 3.2 Command Response Display
- Format command results as chat messages
- Use appropriate message types (roll, info, action)
- Maintain chat history consistency
- Support rich formatting for complex results

#### 3.3 Mobile Layout Changes
- Remove GameTools sidebar component
- Expand chat area to full width
- Ensure responsive design for all screen sizes
- Optimize touch interactions

## Detailed Implementation Steps

### Step 1: Create Command Infrastructure
1. Create `CommandParserService` for parsing slash commands
2. Implement `CommandRegistry` for managing all commands
3. Create base `CommandHandler` interface
4. Set up command validation and error handling

### Step 2: Implement Core Commands
1. **Character Commands**
   - Extract character display logic from GameTools
   - Format character info for chat display
   - Handle character stats and abilities

2. **Dice Commands**
   - Port dice rolling logic from DiceRoller
   - Support standard dice notation (1d20, 3d6, etc.)
   - Handle modifiers and complex rolls
   - Format roll results for chat

3. **Combat Commands**
   - Implement attack roll calculations
   - Handle initiative rolls
   - Support defensive actions
   - Format combat results

4. **Utility Commands**
   - Create comprehensive help system
   - Show command categories and examples
   - Provide contextual help for each command

### Step 3: Integrate with Chat Interface
1. Modify `GameChat` component to detect slash commands
2. Route commands to appropriate handlers
3. Display command results as chat messages
4. Implement command autocomplete and suggestions

### Step 4: Remove Game Tools Sidebar
1. Remove `GameTools` component from `GameChat`
2. Expand chat area to full width
3. Ensure mobile-responsive layout
4. Test all functionality works through commands

### Step 5: Mobile Optimization
1. Test on mobile devices (iPhone 14 Pro Max focus)
2. Ensure all text is readable on small screens
3. Optimize touch targets and interactions
4. Verify chat scrolling and input work properly

## Testing Strategy

### Unit Testing
1. Test each command handler individually
2. Verify command parsing and validation
3. Test error handling and edge cases
4. Ensure command responses are properly formatted

### Integration Testing
1. Test command integration with chat interface
2. Verify command history in chat
3. Test mobile responsiveness
4. Ensure no API calls for local commands

### User Experience Testing
1. Test on mobile devices
2. Verify command discoverability
3. Test help system usability
4. Ensure smooth mobile interactions

## File Structure Changes

### New Files
```
frontend/
├── services/
│   ├── CommandParserService.ts
│   ├── CommandRegistry.ts
│   └── commands/
│       ├── CharacterCommands.ts
│       ├── DiceCommands.ts
│       ├── CombatCommands.ts
│       └── UtilityCommands.ts
├── hooks/
│   └── useSlashCommands.ts
└── components/
    └── CommandAutocomplete.tsx
```

### Modified Files
```
frontend/
├── components/
│   ├── game-chat.tsx (major changes)
│   └── game-session.tsx (minor changes)
└── lib/
    └── types.ts (add command types)
```

### Removed Files
```
frontend/
└── components/
    ├── game-tools.tsx (replaced by commands)
    └── dice-roller.tsx (functionality moved to commands)
```

## Command Examples

### Character Commands
```
/character          - Show character overview
/stats              - Display ability scores
/inventory          - List equipment and items
/proficiency        - Show proficiency bonuses
```

### Dice Commands
```
/dice 1d20         - Roll a d20
/dice 3d6+2        - Roll 3d6 with +2 modifier
/roll 1d100        - Alternative dice syntax
/attack            - Roll attack with character bonus
```

### Combat Commands
```
/attack sword      - Attack with sword
/defend            - Take defensive stance
/spell fireball    - Cast fireball spell
/initiative        - Roll initiative
```

### Utility Commands
```
/help              - Show all commands
/help dice         - Show dice command help
/location          - Show current location
/status            - Show character status
```

## Mobile-Specific Considerations

### Touch Interface
- Ensure command buttons are large enough for touch
- Implement swipe gestures for chat navigation
- Optimize input field for mobile keyboards

### Screen Real Estate
- Maximize chat area width
- Keep essential info (HP, AC) always visible
- Use collapsible sections for detailed info

### Performance
- Minimize re-renders during command execution
- Optimize command parsing for mobile devices
- Ensure smooth scrolling on mobile

## Success Criteria

### Functional Requirements
- [ ] All game tools accessible via slash commands
- [ ] No API calls for local commands (except dice rolls)
- [ ] Comprehensive help system implemented
- [ ] Game tools sidebar completely removed
- [ ] Chat takes full screen width on mobile

### Mobile Experience
- [ ] All content readable on iPhone 14 Pro Max
- [ ] Touch interactions work smoothly
- [ ] No horizontal scrolling required
- [ ] Command input optimized for mobile

### User Experience
- [ ] Commands are intuitive and discoverable
- [ ] Help system provides clear guidance
- [ ] Command responses are well-formatted
- [ ] No loss of functionality from sidebar removal

## Risk Mitigation

### Technical Risks
1. **Command Parsing Complexity**: Start with simple regex parsing, evolve to more sophisticated parser
2. **Performance Impact**: Profile command execution, optimize critical paths
3. **Mobile Compatibility**: Test early and often on target devices

### User Experience Risks
1. **Command Discovery**: Implement comprehensive help and autocomplete
2. **Learning Curve**: Provide clear examples and guidance
3. **Functionality Loss**: Ensure all features are accessible through commands

## Timeline

### Week 1: Infrastructure
- Command parser and registry implementation
- Basic command framework setup
- Unit testing infrastructure

### Week 2: Core Commands
- Character and dice commands
- Combat command implementation
- Command response formatting

### Week 3: Integration
- Chat interface integration
- Command autocomplete
- Mobile layout optimization

### Week 4: Testing & Polish
- Comprehensive testing
- Mobile device testing
- Bug fixes and refinements
- Documentation updates

## Conclusion

This implementation will significantly improve the mobile experience by:
1. Eliminating the cramped sidebar interface
2. Providing intuitive access to all game tools
3. Maximizing screen real estate for the chat
4. Maintaining all existing functionality through commands

The slash command system will make the game more accessible on mobile devices while preserving the rich functionality currently available in the sidebar tools.
