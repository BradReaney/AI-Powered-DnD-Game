# 🎯 IMPLEMENTATION GUIDELINES - PREVENT MODEL/TEST MISMATCHES

## **🚨 CRITICAL RULE: ALWAYS CHECK ACTUAL IMPLEMENTATION FIRST**

Before writing any tests or making changes, **ALWAYS** examine the actual codebase to understand the current implementation.

## **📋 Pre-Implementation Checklist**

### **1. Technology Stack Verification**
- [ ] Check `package.json` files to confirm actual tech stack
- [ ] Verify backend framework (Express.js vs FastAPI vs others)
- [ ] Confirm database technology (MongoDB vs PostgreSQL vs others)
- [ ] Check model/schema definitions in actual code

### **2. Model Structure Analysis**
- [ ] Read actual model files (`backend/src/models/*.ts`)
- [ ] Document actual property paths and nesting
- [ ] Compare with any existing tests to identify mismatches
- [ ] Update plans if implementation differs from documentation

### **3. Service Interface Review**
- [ ] Examine actual service classes (`backend/src/services/*.ts`)
- [ ] Check method signatures and return types
- [ ] Verify singleton patterns and constructor accessibility
- [ ] Document actual API contracts

### **4. Test Alignment Verification**
- [ ] Compare test expectations with actual model structure
- [ ] Verify mock setups match actual service interfaces
- [ ] Check TypeScript compatibility between tests and implementation
- [ ] Ensure test data matches actual model schemas

## **🔧 Implementation Process**

### **Step 1: Discovery Phase**
```bash
# Always start by examining the actual codebase
1. Read package.json files
2. Examine model definitions
3. Check service implementations
4. Review existing tests (if any)
5. Document findings vs plans
```

### **Step 2: Validation Phase**
```bash
# Verify implementation matches plans
1. Compare actual vs planned architecture
2. Identify discrepancies
3. Update plans if needed
4. Get confirmation before proceeding
```

### **Step 3: Implementation Phase**
```bash
# Only proceed after validation
1. Write code that matches actual implementation
2. Create tests that match actual models
3. Use correct property paths and interfaces
4. Test against actual running code
```

## **🚨 Red Flags to Watch For**

### **Architecture Mismatches**
- Plans show Python but code is TypeScript
- Plans show FastAPI but code uses Express.js
- Plans show flat models but code uses nested structures

### **Model Mismatches**
- Test expects `session.participants` but model has `session.metadata.players`
- Test expects `session.startTime` but model has `session.metadata.startTime`
- Test expects properties that don't exist in actual models

### **Service Mismatches**
- Tests try to instantiate services with `new Service()` but services use singleton pattern
- Tests expect public methods that are actually private
- Tests expect methods that don't exist in actual implementation

## **📝 Documentation Requirements**

### **When Implementation Differs from Plans**
1. **Document the discrepancy** in implementation notes
2. **Update the plans** to reflect actual implementation
3. **Get approval** before proceeding with changes
4. **Update all related tests** to match actual implementation

### **Model Documentation Template**
```typescript
// ACTUAL MODEL STRUCTURE (verified from code)
interface ISession {
    // Top-level properties
    campaignId: ObjectId;
    sessionNumber: number;
    name: string;
    status: 'active' | 'paused' | 'completed' | 'archived';
    
    // Nested metadata
    metadata: {
        startTime: Date;
        endTime?: Date;
        players: Array<{
            playerId: string;
            characterId: ObjectId;
            joinedAt: Date;
        }>;
        dm: string;
        location: string;
        weather: string;
        timeOfDay: string;
    };
    
    // Other nested structures...
}

// TEST EXPECTATIONS MUST MATCH THIS STRUCTURE
```

## **🧪 Testing Guidelines**

### **Mock Setup Rules**
1. **Match actual service interfaces** - Check constructor patterns, method signatures
2. **Use correct property paths** - `session.metadata.startTime` not `session.startTime`
3. **Handle TypeScript strict mode** - Ensure mock types are compatible
4. **Test against actual models** - Use real model structures in test data

### **Test Data Creation**
```typescript
// ✅ CORRECT - Matches actual model structure
const mockSession = {
    _id: 'session1',
    name: 'Test Session',
    campaignId: 'campaign123',
    sessionNumber: 1,
    status: 'active',
    metadata: {
        startTime: new Date(),
        endTime: new Date(),
        players: [
            { playerId: 'player1', characterId: 'char1', joinedAt: new Date() }
        ],
        dm: 'DM1',
        location: 'Tavern',
        weather: 'Sunny',
        timeOfDay: 'afternoon'
    },
    gameState: {
        currentScene: 'Scene 1',
        activeCharacters: ['char1'],
        // ... other nested properties
    }
};

// ❌ WRONG - Based on plans, not actual implementation
const mockSession = {
    _id: 'session1',
    name: 'Test Session',
    startTime: new Date(),  // Should be metadata.startTime
    participants: [],       // Should be metadata.players
    location: 'Tavern'      // Should be metadata.location
};
```

## **🔄 Continuous Verification**

### **Before Each Development Session**
1. **Check for recent changes** to models or services
2. **Verify tests still match** actual implementation
3. **Update documentation** if implementation has evolved
4. **Run tests** to ensure compatibility

### **Code Review Checklist**
- [ ] Tests match actual model structure
- [ ] Service calls use correct interfaces
- [ ] Property paths are accurate
- [ ] TypeScript types are compatible
- [ ] Mock setups reflect actual implementation

## **📚 Reference Documents**

### **Always Check These First**
1. `backend/src/models/*.ts` - Actual model definitions
2. `backend/src/services/*.ts` - Actual service implementations
3. `backend/package.json` - Actual dependencies and tech stack
4. `backend/tests/*.test.ts` - Existing test patterns (if any)

### **Plans Are Secondary**
- Plans are **guidance**, not **gospel**
- Implementation may have evolved beyond plans
- Always verify plans against actual code
- Update plans when implementation differs

## **🎯 Success Criteria**

### **Implementation is Correct When:**
- [ ] Tests pass without TypeScript errors
- [ ] Tests use actual model property paths
- [ ] Service mocks match actual interfaces
- [ ] Test data reflects actual model schemas
- [ ] Implementation works with actual running code

### **Documentation is Correct When:**
- [ ] Plans match actual implementation
- [ ] Model structures are accurately documented
- [ ] Service interfaces are correctly described
- [ ] Test examples use correct patterns

## **🚀 Moving Forward**

### **Immediate Actions**
1. **Always examine actual code first** before writing tests
2. **Update plans** to match actual implementation
3. **Fix existing tests** to use correct model structures
4. **Document discrepancies** for future reference

### **Long-term Process**
1. **Establish code-first approach** - Implementation drives documentation
2. **Regular plan updates** - Keep plans synchronized with code
3. **Test validation** - Ensure tests match actual implementation
4. **Team communication** - Share findings about plan/code mismatches

---

**Remember: The actual implementation is the source of truth, not the plans!**
