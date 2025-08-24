# 📚 Documentation Index

Welcome to the AI-Powered D&D Game documentation! This index provides an overview of all available documentation and guides.

## 🎯 Getting Started

### [Installation Guide](INSTALLATION.md)
Complete setup instructions for getting the application running on your system.
- **Prerequisites**: System requirements and software dependencies
- **Quick Installation**: Docker-based setup in minutes
- **Local Development**: Alternative setup without Docker
- **Production Setup**: Production-ready configuration
- **Troubleshooting**: Common installation issues and solutions

### [User Guide](USER_GUIDE.md)
Comprehensive guide to using the application features.
- **Getting Started**: First-time setup and account creation
- **Campaign Management**: Creating and managing D&D campaigns
- **Character Creation**: Building human and AI characters
- **Gameplay**: Running sessions with AI assistance
- **World Building**: Creating locations and managing factions
- **Session Analytics**: Tracking performance and engagement

## 🔧 Technical Documentation

### [API Reference](API_REFERENCE.md)
Complete API documentation for developers and integrators.
- **Authentication**: JWT-based authentication system
- **Campaigns**: Campaign management endpoints
- **Characters**: Character creation and management
- **Gameplay**: Story generation and AI interactions
- **Locations**: World building and location management
- **Sessions**: Session tracking and analytics
- **Quests**: Quest generation and management
- **AI Integration**: AI model selection and performance

### [AI Integration Guide](AI_INTEGRATION.md)
Deep dive into the AI-powered features and capabilities.
- **AI Models**: Gemini 2.5 Flash-Lite, Flash, and Pro
- **Model Selection**: Intelligent automatic model selection
- **Use Cases**: Story generation, character development, world building
- **Context Management**: Memory systems and context compression
- **Performance Monitoring**: Response time and quality tracking
- **Optimization**: Prompt engineering and caching strategies

### [Production Deployment Guide](PRODUCTION_DEPLOYMENT.md)
Enterprise-grade deployment and scaling strategies.
- **Architecture**: Production-ready service architecture
- **Security**: SSL/TLS, authentication, and security headers
- **Docker**: Production Docker configurations and Dockerfiles
- **Cloud Deployment**: AWS, Google Cloud, and Azure guides
- **Monitoring**: Health checks, logging, and performance monitoring
- **Scaling**: Horizontal scaling and load balancing
- **CI/CD**: Automated deployment pipelines
- **Disaster Recovery**: Backup strategies and recovery procedures

## 🛠️ Reference Materials

### [Quick Reference](QUICK_REFERENCE.md)
Essential commands, configurations, and shortcuts.
- **Quick Start**: Docker and development commands
- **Environment**: Configuration templates and variables
- **Database**: MongoDB and Redis operations
- **Testing**: Test commands and debugging
- **Monitoring**: Health checks and performance monitoring
- **Workflows**: Common development and deployment workflows
- **Aliases**: Useful shell aliases and shortcuts

### [Troubleshooting Guide](TROUBLESHOOTING.md)
Comprehensive problem-solving guide.
- **Emergency Issues**: Critical problems and quick fixes
- **Common Issues**: Frontend, backend, and database problems
- **Performance Issues**: Slow response times and resource problems
- **Security Issues**: Authentication and CORS problems
- **Testing & Debugging**: Debug mode and health checks
- **Error Messages**: Common errors and solutions
- **Getting Help**: Support channels and escalation

## 🏗️ Project Structure

```
AI-Powered-DnD-Game/
├── frontend/          # Next.js 15 React application
│   ├── app/          # App router and pages
│   ├── components/   # React components and UI
│   ├── lib/          # Utilities and helpers
│   └── hooks/        # Custom React hooks
├── backend/           # Express.js API server
│   ├── src/          # Source code
│   ├── models/       # MongoDB models
│   ├── routes/       # API endpoints
│   ├── services/     # Business logic
│   └── middleware/   # Express middleware
├── docs/             # This documentation
├── config/           # Configuration files
├── scripts/          # Build and deployment scripts
└── docker-compose.yml # Docker services configuration
```

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/BradReaney/AI-Powered-DnD-Game.git
   cd ai-powered-dnd-game
   ```

2. **Set up environment**
   ```bash
   cp config/env.example .env
   # Edit .env with your Gemini API key
   ```

3. **Start with Docker**
   ```bash
   docker-compose up -d
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5001

## 🔑 Key Features

### 🎮 Core Game Features
- **Campaign Management**: Create and manage multiple D&D campaigns
- **Character Creation**: Build human and AI-controlled characters
- **Multi-Session Support**: Continue campaigns across sessions
- **AI Dungeon Master**: Intelligent AI assistance for storytelling
- **Combat System**: Full D&D 5e combat mechanics
- **Quest System**: AI-generated quests and world exploration

### 🤖 AI Integration
- **Smart Model Selection**: Automatic AI model selection
- **Context-Aware Responses**: AI remembers session history
- **Dynamic Storytelling**: AI generates scenarios and NPCs
- **Character Development**: AI assists with character growth
- **World Building**: AI helps create campaign worlds

### 🎨 User Interface
- **Modern Web Interface**: Built with Next.js 15 and Tailwind CSS
- **Mobile-First Design**: Optimized for mobile devices
- **Real-Time Updates**: Live updates during gameplay
- **Campaign Dashboard**: Comprehensive campaign overview
- **Session Analytics**: Track performance and engagement

## 🛠️ Technology Stack

- **Frontend**: Next.js 15, React 18, TypeScript, Tailwind CSS 4
- **Backend**: Express.js, TypeScript, Node.js 18+
- **Database**: MongoDB 7.0 with Mongoose ODM
- **Cache**: Redis 7.2
- **AI**: Google Gemini 2.5 (Flash-Lite, Flash, Pro)
- **Containerization**: Docker & Docker Compose
- **Testing**: Jest, Playwright

## 📱 Mobile Optimization

The application is specifically optimized for mobile devices, with special attention to:
- **iPhone 14 Pro Max**: Primary mobile target device
- **Touch Interface**: Optimized touch targets and gestures
- **Responsive Design**: Adaptive layouts for all screen sizes
- **Performance**: Fast loading and smooth interactions
- **Accessibility**: Screen reader support and keyboard navigation

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **CORS Protection**: Configurable cross-origin restrictions
- **Rate Limiting**: API request throttling
- **Input Validation**: Comprehensive input sanitization
- **Security Headers**: Helmet.js security middleware
- **Environment Variables**: Secure configuration management

## 📊 Performance Features

- **AI Model Selection**: Automatic model optimization
- **Response Caching**: Redis-based caching system
- **Context Compression**: Intelligent memory management
- **Database Indexing**: Optimized MongoDB queries
- **Static Asset Optimization**: Compressed and cached assets
- **Load Balancing**: Horizontal scaling support

## 🧪 Testing Strategy

- **Unit Tests**: Jest for backend services
- **Integration Tests**: API endpoint testing
- **E2E Tests**: Playwright for user journeys
- **Performance Tests**: Load testing and optimization
- **AI Tests**: AI integration validation
- **Mobile Tests**: Mobile-specific testing

## 🚀 Deployment Options

### Development
- **Local Development**: npm scripts and hot reloading
- **Docker Development**: Containerized development environment

### Production
- **Self-Hosted**: Docker Compose on VPS or dedicated server
- **Cloud Platforms**: AWS, Google Cloud, Azure deployment guides
- **Container Orchestration**: Kubernetes and Docker Swarm support
- **CI/CD**: Automated deployment pipelines

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines:

1. **Fork the repository**
2. **Create a feature branch**
3. **Make your changes**
4. **Add tests for new functionality**
5. **Submit a pull request**

### Development Guidelines
- Follow TypeScript best practices
- Write comprehensive tests
- Use conventional commit messages
- Ensure mobile-first responsive design
- Maintain accessibility standards

## 📞 Support

### Self-Help Resources
1. **Check the logs**: `docker-compose logs -f [service-name]`
2. **Review troubleshooting guide**: [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
3. **Search GitHub issues**: Look for similar problems
4. **Check documentation**: Review relevant guides

### Support Channels
- **GitHub Issues**: Report bugs and request features
- **Documentation**: Check this documentation index
- **Community**: Join our Discord server
- **Email Support**: For critical issues (if available)

## 📋 Documentation Status

| Document | Status | Last Updated |
|----------|--------|--------------|
| Installation Guide | ✅ Complete | Current |
| User Guide | ✅ Complete | Current |
| API Reference | ✅ Complete | Current |
| AI Integration Guide | ✅ Complete | Current |
| Production Deployment | ✅ Complete | Current |
| Quick Reference | ✅ Complete | Current |
| Troubleshooting Guide | ✅ Complete | Current |

## 🔄 Documentation Updates

This documentation is actively maintained and updated to reflect:
- **Current project state**: Latest features and capabilities
- **User feedback**: Improvements based on user experience
- **Technical changes**: Updates for new technologies
- **Best practices**: Industry standard recommendations

## 📚 Additional Resources

### External Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Redis Documentation](https://redis.io/documentation)
- [Google Gemini Documentation](https://ai.google.dev/docs)

### Community Resources
- [D&D 5e Rules](https://dnd.wizards.com/)
- [Character Sheets](https://dndbeyond.com/)
- [Spell Database](https://www.dnd-spells.com/)

---

**🎲 Ready to start your AI-powered D&D adventure?**

Choose your path:
- **New Users**: Start with the [Installation Guide](INSTALLATION.md)
- **Players**: Read the [User Guide](USER_GUIDE.md)
- **Developers**: Check the [API Reference](API_REFERENCE.md)
- **Deployers**: Use the [Production Deployment Guide](PRODUCTION_DEPLOYMENT.md)

**For quick help, see the [Quick Reference](QUICK_REFERENCE.md) or [Troubleshooting Guide](TROUBLESHOOTING.md).**
