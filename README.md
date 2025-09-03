# AI-Powered D&D Game

A comprehensive AI-powered Dungeons & Dragons game application built with modern web technologies. This application provides a complete tabletop RPG experience with AI-driven storytelling, character management, and campaign organization.

## 🎮 Features

### Core Gameplay
- **AI Dungeon Master**: Intelligent AI that responds to player actions with rich, contextual storytelling
- **Character Management**: Create, edit, and manage D&D characters with full stat tracking
- **Campaign Organization**: Organize multiple campaigns with different themes and settings
- **Session Management**: Track game sessions with message history and continuity
- **Location Discovery**: AI automatically discovers and creates new locations during gameplay

### Advanced Features
- **Story Arc System**: Plan and manage narrative arcs with AI-powered validation
- **Character Discovery**: AI creates and manages NPCs during gameplay
- **Game Commands**: Built-in commands for dice rolling, status checking, and inventory management
- **Multi-Character Support**: Support for multiple characters per campaign
- **Real-time Chat**: Interactive chat interface with the AI Dungeon Master

### Technical Features
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Real-time Updates**: Live session updates and character synchronization
- **Data Persistence**: All game data is saved and persists between sessions
- **Performance Optimized**: Efficient resource usage and fast response times

## 🏗️ Architecture

### Frontend
- **Framework**: Next.js 14 with TypeScript
- **UI Library**: Tailwind CSS with shadcn/ui components
- **State Management**: React hooks and context
- **API Integration**: RESTful API with Next.js API routes

### Backend
- **Runtime**: Node.js with Express.js
- **Database**: MongoDB for data persistence
- **Caching**: Redis for session management and performance
- **AI Integration**: Google Gemini API for intelligent responses
- **Authentication**: JWT-based authentication system

### Infrastructure
- **Containerization**: Docker and Docker Compose
- **Database**: MongoDB with Redis caching
- **Environment**: Configurable via environment variables
- **Deployment**: Railway-ready with production optimizations

## 📁 Project Structure

```
AI-Powered-DnD-Game/
├── frontend/                 # Next.js frontend application
│   ├── app/                 # Next.js app router
│   ├── components/          # React components
│   ├── lib/                 # Utility functions and types
│   └── public/              # Static assets
├── backend/                 # Node.js backend application
│   ├── src/
│   │   ├── routes/          # API route handlers
│   │   ├── services/        # Business logic services
│   │   ├── models/          # Database models
│   │   └── middleware/      # Express middleware
│   └── tests/               # Backend test suite
├── mock-llm-service/        # Mock AI service for testing
├── config/                  # Configuration files
├── docs/                    # Documentation
├── plans/                   # Development plans and testing
└── docker-compose.yml       # Docker orchestration
```

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)
- MongoDB (or use Docker)
- Redis (or use Docker)

### Environment Setup
1. Copy the environment template:
   ```bash
   cp config/env.example .env
   ```

2. Configure your environment variables in `.env`:
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/dnd-game
   REDIS_URL=redis://localhost:6379
   
   # AI Integration
   GEMINI_API_KEY=your_gemini_api_key
   
   # Application
   BACKEND_URL=http://localhost:5001
   NEXT_PUBLIC_API_URL=http://localhost:3000
   ```

### Running the Application
1. Start all services:
   ```bash
   docker-compose up --build
   ```

2. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5001
   - MongoDB: localhost:27017
   - Redis: localhost:6379

## 🧪 Testing

### Running Tests
```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test

# E2E tests with Playwright
cd frontend && npm run test:e2e
```

### Test Coverage
- **Backend**: Comprehensive unit and integration tests
- **Frontend**: Component tests and user interaction tests
- **E2E**: Full application workflow testing
- **API**: Complete API endpoint testing

## 📚 API Documentation

### Core Endpoints
- `GET /api/campaigns` - List all campaigns
- `POST /api/campaigns` - Create new campaign
- `GET /api/characters` - List characters
- `POST /api/characters` - Create new character
- `GET /api/sessions/active` - Get active sessions
- `POST /api/gameplay/story-response` - AI story response

### Authentication
- JWT-based authentication
- Session management with Redis
- Role-based access control

## 🔧 Development

### Local Development
1. Install dependencies:
   ```bash
   npm install
   cd frontend && npm install
   cd ../backend && npm install
   ```

2. Start development servers:
   ```bash
   # Backend
   cd backend && npm run dev
   
   # Frontend
   cd frontend && npm run dev
   ```

### Code Quality
- **Linting**: ESLint with TypeScript support
- **Formatting**: Prettier for consistent code style
- **Type Safety**: Full TypeScript coverage
- **Testing**: Jest and Playwright for comprehensive testing

## 🚀 Deployment

### Railway Deployment
The application is configured for Railway deployment with:
- Automatic builds from Git
- Environment variable management
- Database and Redis provisioning
- SSL termination and custom domains

### Environment Variables
Key environment variables for production:
- `MONGODB_URI` - MongoDB connection string
- `REDIS_URL` - Redis connection string
- `GEMINI_API_KEY` - Google Gemini API key
- `JWT_SECRET` - JWT signing secret
- `NODE_ENV` - Environment (production/development)

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

### Code Standards
- Follow TypeScript best practices
- Write comprehensive tests
- Document new features
- Use conventional commit messages

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Google Gemini**: AI language model for intelligent storytelling
- **Next.js**: React framework for the frontend
- **MongoDB**: Database for data persistence
- **Redis**: Caching and session management
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Modern UI component library

## 📞 Support

For support, questions, or contributions:
- Create an issue in the GitHub repository
- Check the documentation in the `docs/` folder
- Review the testing plans in the `plans/` folder

---

**Built with ❤️ for the D&D community**
