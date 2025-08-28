## 🎯 Pull Request Description

### What does this PR do?
<!-- Describe the changes and why they're needed -->

### Type of change
- [ ] 🐛 Bug fix
- [ ] ✨ New feature
- [ ] 🚀 Performance improvement
- [ ] 🔧 Refactoring
- [ ] 📚 Documentation update
- [ ] 🧪 Test addition/update
- [ ] 🏗️ Build/CI improvement

### Related issues
<!-- Link any related issues here -->
Closes #

## ✅ Quality Checklist

Before submitting this PR, please ensure:

### Code Quality
- [ ] **Backend**: `npm run quality` passes in `backend/` directory
- [ ] **Frontend**: `npm run lint` and `npm run format` pass in `frontend/` directory
- [ ] **TypeScript**: `npx tsc --noEmit` passes in both directories
- [ ] **Builds**: Both frontend and backend build successfully

### Testing
- [ ] **Unit Tests**: `npm test` passes in both directories
- [ ] **E2E Tests**: `npm run test:e2e:quick` passes in frontend directory
- [ ] **New Features**: Added appropriate tests for new functionality

### Documentation
- [ ] **Code Comments**: Added/updated comments for complex logic
- [ ] **README**: Updated if needed
- [ ] **API Changes**: Documented any breaking changes

### Environment
- [ ] **Dependencies**: No unnecessary dependencies added
- [ ] **Environment Variables**: Added to `.env.example` if new ones are needed
- [ ] **Docker**: `docker-compose up` works locally

## 🚀 How to Test

1. **Local Setup**:
   ```bash
   docker-compose up -d
   cd backend && npm run quality
   cd ../frontend && npm run lint && npm run format
   ```

2. **Test the Changes**:
   <!-- Describe how to test the specific changes -->

## 📸 Screenshots (if applicable)
<!-- Add screenshots for UI changes -->

## 🔍 Additional Notes
<!-- Any other information that reviewers should know -->

---

**Remember**: This project maintains a **100% quality score**. All quality checks must pass before merging! 🎉
