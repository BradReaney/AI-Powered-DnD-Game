# 🚀 AI-Powered D&D Game - Quick Reference

## **⚡ Quick Start Commands**

### **Docker (Recommended)**
```bash
# Quick start
docker-compose up -d

# Build and start
docker-compose up --build -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### **Local Development**
```bash
# Backend
cd backend && npm install && npm run dev

# Frontend  
cd frontend && npm install && npm run dev
```

## **🔑 Environment Variables**

### **Required (.env)**
```env
# Server
PORT=5001
NODE_ENV=development

# Database
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=password
MONGODB_URI=mongodb://admin:password@mongodb:27017/ai-dnd-game?authSource=admin

# AI API
GEMINI_API_KEY=your_api_key_here
GEMINI_FLASH_LITE_MODEL=gemini-2.5-flash-lite
GEMINI_FLASH_MODEL=gemini-2.5-flash
GEMINI_PRO_MODEL=gemini-2.5-pro

# Security
JWT_SECRET=your_jwt_secret
SESSION_SECRET=your_session_secret
CORS_ORIGIN=http://localhost:80
```

### **Optional**
```env
# Performance
LOG_LEVEL=info
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# AI Settings
MODEL_SELECTION_ENABLED=true
MAX_CONTEXT_LENGTH=8000
CONTEXT_COMPRESSION_THRESHOLD=6000

# Frontend
VITE_API_URL=http://localhost:5001
VITE_APP_NAME=AI-Powered D&D Game
```

## **🎮 Game Commands**

### **Character Actions**
- **Attack**: `!attack <target> [weapon]`
- **Cast Spell**: `!cast <spell> [target]`
- **Skill Check**: `!skill <skill> [difficulty]`
- **Move**: `!move <direction> [distance]`
- **Use Item**: `!use <item> [target]`

### **Combat Commands**
- **Initiative**: `!initiative`
- **Roll Attack**: `!roll attack [weapon]`
- **Roll Damage**: `!roll damage [weapon]`
- **End Turn**: `!end turn`
- **Flee**: `!flee`

### **Campaign Commands**
- **Save Game**: `!save`
- **Load Game**: `!load <save_name>`
- **Session Summary**: `!summary`
- **World State**: `!world`

## **📊 Character Stats**

### **Ability Scores**
- **STR**: Strength (melee attacks, carrying capacity)
- **DEX**: Dexterity (ranged attacks, armor class, initiative)
- **CON**: Constitution (hit points, saving throws)
- **INT**: Intelligence (spellcasting, knowledge skills)
- **WIS**: Wisdom (perception, spellcasting)
- **CHA**: Charisma (social skills, spellcasting)

### **Combat Stats**
- **HP**: Hit Points (health)
- **AC**: Armor Class (defense)
- **Initiative**: Turn order in combat
- **Speed**: Movement per turn
- **Proficiency**: Bonus to trained skills

### **Skill Modifiers**
- **Athletics**: STR-based physical activities
- **Acrobatics**: DEX-based agility
- **Stealth**: DEX-based hiding
- **Perception**: WIS-based awareness
- **Insight**: WIS-based understanding
- **Persuasion**: CHA-based convincing

## **⚔️ Combat Rules**

### **Action Economy**
- **Action**: Primary action per turn
- **Bonus Action**: Quick additional action
- **Reaction**: Response to enemy actions
- **Movement**: Up to speed per turn
- **Free Actions**: Minor interactions

### **Attack Resolution**
1. **Roll Attack**: d20 + attack bonus
2. **Compare to AC**: Target's Armor Class
3. **Roll Damage**: Weapon/spell damage dice
4. **Apply Modifiers**: Strength, magic, etc.

### **Critical Hits**
- **Natural 20**: Automatic hit + extra damage
- **Natural 1**: Automatic miss
- **Advantage**: Roll 2d20, take highest
- **Disadvantage**: Roll 2d20, take lowest

## **🔮 Spellcasting**

### **Spell Components**
- **Verbal (V)**: Spoken words
- **Somatic (S)**: Hand gestures
- **Material (M)**: Physical components
- **Focus**: Magical item substitute

### **Spell Levels**
- **Cantrips**: 0-level, unlimited use
- **1st-3rd**: Low-level spells
- **4th-6th**: Mid-level spells
- **7th-9th**: High-level spells

### **Concentration**
- **One Spell**: Can only concentrate on one spell at a time
- **Damage**: Constitution save to maintain
- **Duration**: Until concentration ends or spell completes

## **🏰 Campaign Types**

### **Adventure Styles**
- **Linear**: Follow predetermined plot
- **Sandbox**: Open exploration
- **Mystery**: Solve puzzles and secrets
- **Political**: Navigate social dynamics

### **Difficulty Levels**
- **Easy**: New players, simple challenges
- **Medium**: Balanced difficulty
- **Hard**: Experienced players
- **Deadly**: Extreme challenges

### **Themes**
- **High Fantasy**: Epic magical adventures
- **Dark Fantasy**: Grim and dangerous
- **Urban Fantasy**: Modern magical settings
- **Historical**: Fantasy in historical periods

## **🤖 AI Features**

### **Model Selection**
- **Flash**: Fast, simple tasks
- **Pro**: Complex, creative tasks
- **Auto**: Automatic selection

### **AI Capabilities**
- **Story Generation**: Dynamic plotlines
- **Character Voices**: Unique NPC personalities
- **World Building**: Expanding game world
- **Rule Adjudication**: D&D 5e rule application

### **Context Management**
- **Session Memory**: Remembering events
- **Character Consistency**: Maintaining personalities
- **World State**: Tracking changes
- **Story Continuity**: Narrative consistency

## **📱 User Interface**

### **Main Components**
- **Campaign Selector**: Choose active campaign
- **Character Sheet**: View and edit character
- **Game Interface**: Main gameplay area
- **Chat Interface**: AI communication
- **Combat Manager**: Battle interface

### **Navigation**
- **Campaigns**: Switch between campaigns
- **Characters**: Manage character roster
- **Sessions**: View session history
- **Settings**: Configure game options

### **Responsive Design**
- **Desktop**: Full interface with all features
- **Tablet**: Optimized for touch
- **Mobile**: Simplified mobile interface

## **🔧 Troubleshooting**

### **Docker Issues**
- **Services Not Starting**: Check `docker-compose ps` and logs
- **Environment Variables**: Verify `.env` file exists and has correct values
- **Port Conflicts**: Ensure ports 80, 5001, 27017, 6379 are available
- **Permission Issues**: Check Docker user permissions

### **Common Issues**
- **Connection Lost**: Check backend server
- **AI Not Responding**: Verify API key in `.env`
- **Game Not Saving**: Check MongoDB container status
- **Slow Performance**: Monitor container resources with `docker stats`

### **Quick Fixes**
- **Refresh Page**: Reload the application
- **Restart Services**: `docker-compose restart`
- **Rebuild Containers**: `docker-compose up --build -d`
- **Check Logs**: `docker-compose logs [service-name]`

### **Support Commands**
- **Help**: `!help`
- **Status**: `!status`
- **Debug**: `!debug`
- **Report Bug**: `!bug <description>`

## **📚 Useful Links**

### **Documentation**
- [Full User Guide](USER_GUIDE.md)
- [Installation Guide](INSTALLATION.md)
- [Troubleshooting](TROUBLESHOOTING.md)

### **Resources**
- [D&D 5e Rules](https://dnd.wizards.com/)
- [Character Sheets](https://dndbeyond.com/)
- [Spell Database](https://www.dnd-spells.com/)

### **Community**
- [GitHub Repository](https://github.com/your-username/ai-powered-dnd-game)
- [Discord Server](https://discord.gg/your-server)
- [Bug Reports](https://github.com/your-username/ai-powered-dnd-game/issues)

---

**Last Updated**: August 2025  
**Version**: 1.1.0

For detailed information, see the [Full User Guide](USER_GUIDE.md).
