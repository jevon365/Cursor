# Code Comparison: Reference TSX vs Project Implementation

## Architecture Overview

| Aspect | Reference (TSX) | Project (JS) |
|--------|-----------------|--------------|
| **Framework** | React (single component) | Vanilla JavaScript (modular classes) |
| **State Management** | useState hook (single object) | GameState class with serialize/deserialize |
| **Structure** | ~1100 lines, 1 file | Multiple files across folders |
| **Patterns** | Functional, hooks | Object-Oriented, class-based |

---

## Key Differences

### 1. State Management

**Reference (React useState):**
```javascript
const [gameState, setGameState] = useState({
    phase: -1,
    round: 1,
    players: [],
    market: { slaves: [...], animals: [...], mummers: [...] },
    // ... all state in one object
});

// Updates via spread operator
setGameState(prev => ({ ...prev, phase: 2 }));
```

**Project (Class-based):**
```javascript
class GameState {
    constructor(config) {
        this.players = [];
        this.currentPhase = null;
        this.round = 1;
        // ... properties spread across class
    }
    
    // Methods for specific operations
    markPlayerPassed() { ... }
    checkGameOver() { ... }
}
```

**Trade-offs:**
- Reference: Simpler, all state visible, but can get messy
- Project: Better organization, but state scattered across classes

---

### 2. Phase Handling

**Reference (inline switch/if):**
```javascript
// Phase checks inline with UI rendering
{gameState.phase === 1 && (
    <div>Bidding UI...</div>
)}
{gameState.phase === 2 && (
    <div>Worker UI...</div>
)}

// Phase transitions inside action handlers
if (allPassed) {
    if (actKey === 'act1') {
        return { ...prev, biddingState: { currentAct: 'act2' } };
    } else if (actKey === 'act2') { ... }
}
```

**Project (Phases class):**
```javascript
class Phases {
    initializePhases() {
        this.phases = Object.entries(config.phases)
            .sort((a, b) => a[1].order - b[1].order);
    }
    
    nextPhase() { this.currentPhaseIndex++; }
    onPhaseStart(gameState) { ... }  // Phase-specific setup
    onPhaseEnd(gameState) { ... }    // Phase-specific cleanup
    shouldEndPhase(gameState) { ... } // Conditional transitions
}
```

**Trade-offs:**
- Reference: Easy to understand flow, but rigid
- Project: Configurable via config.js, but more complex

---

### 3. Action Execution

**Reference (direct mutation in handlers):**
```javascript
const placeWorker = (location) => {
    setGameState(prev => {
        const newPlayers = [...prev.players];
        const p = newPlayers[prev.currentPlayer - 1];
        p.coins -= cost;
        p.availableWorkers -= 1;
        p.workerPlacements.push(location);
        // ... all logic inline
        return { ...prev, players: newPlayers };
    });
};
```

**Project (action validation + execution split):**
```javascript
// GameEngine.executeAction()
executeAction(action) {
    // 1. Validate with Phases
    const validation = this.phases.validateAction(action, this.state);
    if (!validation.valid) return { success: false };
    
    // 2. Execute based on type
    switch (action.type) {
        case 'placeWorker':
            // Check disabled locations
            // Calculate worker cost with modifiers
            // Call board.placeWorker()
            // Call handleLocationEffect()
            // Update player resources
            break;
    }
    
    // 3. Record and check win
    this.state.recordAction(action);
    if (this.state.checkGameOver()) { ... }
}
```

**Trade-offs:**
- Reference: All logic visible in one place
- Project: Validation separated from execution (better for debugging)

---

### 4. Location Effects

**Reference (inline in resolveWorkers):**
```javascript
const resolveWorkers = () => {
    newPlayers.forEach(p => {
        p.workerPlacements.forEach(location => {
            if (location === 'Prison') {
                p.resources.prisoners += 1;
            } else if (location === 'Port') {
                const flip = Math.random() > 0.5;
                if (flip) p.resources.mummers += 2;
                else p.workers -= 1;
            }
            // ... all locations inline
        });
    });
};
```

**Project (separate effect handlers):**
```javascript
// Config-driven
location.effectType = 'coinFlip';
location.coinFlipReward = { mummers: 2 };

// GameEngine handles by type
handleLocationEffect(locationId, location, player) {
    switch (location.effectType) {
        case 'gainResource':
            return this.handleGainResourceEffect(location, player);
        case 'coinFlip':
            return this.handleCoinFlipEffect(location, player);
        case 'trackMovement':
            return this.handleTrackMovementEffect(location, player);
        // ...
    }
}
```

**Trade-offs:**
- Reference: Easy to read all effects at once
- Project: Easy to add new effect types without touching core logic

---

### 5. Market System

**Reference (array-based, simple):**
```javascript
market: { 
    slaves: [1,1,2,2,3,3,4,4,5,5],  // Prices in order
    animals: [1,1,2,2,3,3,4,4,5,5],
    mummers: [1,1,2,2,3,3,4,4,5,5] 
}

// Buy = shift first element
const buyResource = () => {
    newMarket[resource].shift();
    player.resources[resource] += 1;
};
```

**Project (MarketManager class):**
```javascript
class MarketManager {
    constructor(config) {
        this.markets = {};
        // Initialize from config
    }
    
    buyResource(resourceType, player, priceModifier) {
        // Price calculation with modifiers
        // Validation
        // Transaction
    }
    
    restockAll(playerCount) {
        // Complex restock logic per config
    }
}
```

**Trade-offs:**
- Reference: Super simple, but hardcoded prices
- Project: Configurable prices, modifiers, restock rules

---

### 6. AI System

**Reference (useEffect-based, random):**
```javascript
useEffect(() => {
    if (!currentPlayer.isAI) return;
    
    const aiDelay = 800;
    
    if (gameState.phase === 1) {
        setTimeout(() => {
            const shouldBid = Math.random() < 0.4;
            if (shouldBid) placeBid();
            else passBid();
        }, aiDelay);
    }
}, [gameState.phase, gameState.currentPlayer]);
```

**Project (separate AI folder with strategies):**
```
js/ai/
├── AIPlayer.js        // AI controller
├── PlaytestEngine.js  // Automated testing
└── strategies/
    └── BasicStrategy.js  // Decision logic
```

**Trade-offs:**
- Reference: Simple random decisions, works immediately
- Project: Extensible strategies, but more setup needed

---

### 7. Act Resolution

**Reference (inline in performAllActs):**
```javascript
const performAllActs = () => {
    // Act 1 logic
    if (act.id === 'musicians') {
        if (p.resources.mummers >= 2) {
            p.tracks.clergy += 1;
            p.coins += 2;
        } else {
            p.tracks.clergy -= 1;
        }
    }
    
    // Act 2 - dice rolls
    if (act.id === 'chariot') {
        const rolls = newPlayers.map(p => ({
            roll: Math.floor(Math.random() * 6) + 1
        }));
        // Sort and award
    }
};
```

**Project (ActCardManager):**
```javascript
class ActCardManager {
    initializeActPool() { ... }
    setupRound() { ... }
    placeBid(playerId, actId, amount) { ... }
    resolveAct(actId, gameState) { ... }
    getSelectedActs() { ... }
}
```

**Trade-offs:**
- Reference: All act logic readable in one method
- Project: Acts defined in config, resolution logic separated

---

## What Project Has That Reference Doesn't

| Feature | Reference | Project |
|---------|-----------|---------|
| Save/Load | No | Yes (serialize/deserialize) |
| Config file | Hardcoded | CONFIG object |
| Action history | No | `gameState.history` array |
| Turn order tracking | Implicit | `gameState.turnOrder` array |
| Event effects | Basic | Blocked tracks, disabled locations, modifiers |
| Resource supply | Simple numbers | `resourceSupply` with take/add methods |
| Validation | Inline checks | `phases.validateAction()` |
| UI separation | JSX inline | UIManager, GameDisplay, GameControls classes |

---

## What Reference Has That Project Could Use

1. **Simpler phase flow** - Reference phases are just numbers (0-6), easy to follow
2. **Inline act execution** - All act logic visible in one function
3. **Simple AI** - Random decisions work well for playtesting
4. **Market queue visualization** - Shows queue order in UI
5. **Result messages** - `gameState.message` for user feedback

---

## Recommendations for Project

1. **Keep the class structure** - Better for long-term maintenance
2. **Add message system** - Like reference's `gameState.message`
3. **Simplify phase names** - Use numbers or shorter IDs
4. **Consider hybrid approach** - Config-driven but with inline fallbacks
5. **Port the AI logic** - Reference's random AI is good enough for MVP
