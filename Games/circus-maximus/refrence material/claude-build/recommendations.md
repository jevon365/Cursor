# Recommendations: Merging Reference TSX with Project Rulebook

## Summary

The reference TSX provides working game logic with simpler execution patterns. The project rulebook has more detailed and balanced game rules. This document recommends how to merge the best of both.

---

## Rule Recommendations

### Keep from Project Rulebook

| Rule | Rulebook Value | Reference Value | Reason |
|------|----------------|-----------------|--------|
| Win Threshold | 15 | 10 | Longer games, more strategy |
| Track Range | -10 to 15 | 0 to 10 | Penalties are more meaningful |
| Track Names | Population/Empire/Church | Citizen/Empire/Clergy | More thematic |
| Starting Coins | 15 | 50 | Balanced for economy |
| Starting Tracks | 3 | 2 | Gives buffer before negatives |
| Market Prices | Tiered by type | Same for all | More strategic buying |
| Round Limit | 10 rounds | None | Prevents infinite games |

### Port from Reference TSX

| Feature | Reference Implementation | Benefit |
|---------|-------------------------|---------|
| Feeding Costs | 1 coin per resource | Prevents hoarding |
| Track Income | Sum of track positions | Rewards track advancement |
| Dice Competitions | d6 rolls for Act 2 | Adds excitement to combat |
| Market Restock | Fill to 2 per price, max 3 total | Prevents depletion |
| Worker Cost Scaling | Cost increases if track > 5 | Balances leaders |

---

## Code Execution Recommendations

### 1. Phase Transitions

**Reference Pattern (simpler):**
```javascript
// Inline phase transitions in action handlers
if (allPassed) {
    if (actKey === 'act1') {
        return { ...prev, biddingState: { currentAct: 'act2' } };
    } else if (actKey === 'act2') {
        return { ...prev, biddingState: { currentAct: 'act3' } };
    } else {
        return { ...prev, phase: 2 }; // Move to workers
    }
}
```

**Project Pattern (flexible):**
```javascript
// Separate Phases class with config-driven transitions
if (this.phases.shouldEndPhase(this.state)) {
    this.phases.onPhaseEnd(this.state);
    this.phases.nextPhase();
    this.phases.onPhaseStart(this.state);
}
```

**Recommendation:** Keep project's Phases class but add a simpler `transitionTo(phaseId)` method for explicit transitions. The reference's inline approach is easier to debug.

---

### 2. Act Resolution

**Reference Pattern:**
```javascript
const performAllActs = () => {
    // All act logic in one function
    if (act.id === 'musicians') {
        if (p.resources.mummers >= 2) {
            p.tracks.clergy += 1;
            p.coins += 2;
        } else {
            p.tracks.clergy -= 1;
        }
    }
    // ... more acts inline
};
```

**Project Pattern:**
```javascript
// ActCardManager with config-driven resolution
resolveAct(actId, gameState) {
    const act = this.getAct(actId);
    // Generic resolution based on act.rewards, act.costs, etc.
}
```

**Recommendation:** Keep project's ActCardManager but add explicit resolution functions for each act type. The reference shows that act logic can be complex (dice rolls, comparisons, conditional rewards) and doesn't fit cleanly into generic config.

**Suggested hybrid:**
```javascript
// In ActCardManager
resolveAct(actId, gameState) {
    const act = this.getAct(actId);
    
    switch (act.type) {
        case 'participation':
            return this.resolveParticipationAct(act, gameState);
        case 'competition':
            return this.resolveCompetitionAct(act, gameState);
        case 'execution':
            return this.resolveExecutionAct(act, gameState);
    }
}

resolveCompetitionAct(act, gameState) {
    // Dice roll logic from reference
    const rolls = participants.map(p => ({
        player: p,
        roll: Math.floor(Math.random() * 6) + 1
    }));
    rolls.sort((a, b) => b.roll - a.roll);
    // Award 1st, 2nd, penalize rest
}
```

---

### 3. Worker Resolution

**Reference Pattern (batch resolution):**
```javascript
const resolveWorkers = () => {
    // Resolve ALL workers at once after placement phase
    newPlayers.forEach(p => {
        p.workerPlacements.forEach(location => {
            // Apply effects
        });
    });
    // Then transition to markets
};
```

**Project Pattern (immediate resolution):**
```javascript
// Effects happen immediately when worker is placed
handleLocationEffect(locationId, location, player) {
    switch (location.effectType) {
        case 'coinFlip':
            return this.handleCoinFlipEffect(location, player);
        // ...
    }
}
```

**Recommendation:** Keep project's immediate resolution. The reference's batch approach creates a "phase 2.5" which is confusing. Immediate feedback is better for players.

---

### 4. Market Queue System

**Reference Pattern:**
```javascript
// Queue stored as player IDs
marketPhase: {
    queue: { slaves: [1, 3, 2], animals: [2], mummers: [] }
}

// Buy in queue order
const queue = gameState.marketPhase.queue[resource];
const currentPlayer = queue[0];
```

**Project Pattern:**
```javascript
// Queue in GameState
marketQueues: {
    mummers: [],
    animals: [],
    slaves: []
}

// Turn order set by Phases class
this.setTurnOrder(gameState, 'market');
```

**Recommendation:** Keep both! Project already has `marketQueues` - just ensure the turn order in Buy Resources phase uses the queue order (which it does via `setTurnOrder(gameState, 'market')`).

---

### 5. AI System

**Reference Pattern (simple random):**
```javascript
useEffect(() => {
    if (!currentPlayer.isAI) return;
    
    setTimeout(() => {
        if (gameState.phase === 1) {
            const shouldBid = Math.random() < 0.4;
            if (shouldBid) placeBid();
            else passBid();
        }
    }, 800);
}, [gameState.phase, gameState.currentPlayer]);
```

**Project Pattern (strategy classes):**
```javascript
class BasicStrategy {
    decideBid(gameState, player) { ... }
    decideWorkerPlacement(gameState, player) { ... }
    decideMarketPurchase(gameState, player) { ... }
}
```

**Recommendation:** Port reference's random logic as a `RandomStrategy` for quick testing. Keep strategy class structure for future improvements.

```javascript
class RandomStrategy {
    decideBid(gameState, player) {
        const shouldBid = Math.random() < 0.4 && player.coins >= 1;
        return shouldBid ? { type: 'bid', coins: 1 } : { type: 'pass' };
    }
    
    decideWorkerPlacement(gameState, player) {
        const shouldPlace = Math.random() < 0.7 && player.workers.available > 0;
        if (!shouldPlace) return { type: 'pass' };
        
        const validLocations = this.getValidLocations(gameState, player);
        const chosen = validLocations[Math.floor(Math.random() * validLocations.length)];
        return { type: 'placeWorker', locationId: chosen };
    }
}
```

---

### 6. Cleanup Phase

**Reference Pattern:**
```javascript
const endGame = () => {
    const newPlayers = prev.players.map(p => {
        // 1. Calculate feeding cost
        const totalResources = Object.values(p.resources).reduce((a, b) => a + b, 0);
        const feedCost = totalResources;
        
        // 2. Calculate income
        const payment = p.tracks.citizen + p.tracks.empire + p.tracks.clergy;
        
        // 3. Apply
        return {
            ...p,
            coins: p.coins - feedCost + payment,
            workerPlacements: [],
            passedBidding: false,
            passedWorkers: false
        };
    });
    
    // 4. Check winner
    const winner = checkForWinner(newPlayers);
    
    // 5. Restock markets
    const newMarket = restockMarket(prev.market);
};
```

**Project Pattern:**
```javascript
// In GameEngine.endTurn() during cleanup phase
if (currentPhaseId === 'cleanup') {
    this.markets.restockAll(this.state.players.length);
    this.events.endRound();
    this.acts.setupRound();
    this.events.drawEvent();
}

// In Phases.onPhaseEnd()
case 'cleanup':
    gameState.board.clearWorkers();
    gameState.players.forEach(p => {
        p.workers.available += p.workers.placed;
        p.workers.placed = 0;
        p.clearBids();
    });
```

**Recommendation:** Add feeding costs and income to project's cleanup:

```javascript
// Add to Phases.onPhaseEnd() for 'cleanup' case
gameState.players.forEach(p => {
    // Feeding costs (from reference)
    const totalResources = p.resources.mummers + p.resources.animals + 
                           p.resources.slaves + p.resources.prisoners;
    p.removeResource('coins', totalResources);
    
    // Income (from reference)
    const income = p.getTrack('empire') + p.getTrack('population') + p.getTrack('church');
    p.addResource('coins', Math.max(0, income));
    
    // Existing cleanup
    p.workers.available += p.workers.placed;
    p.workers.placed = 0;
    p.clearBids();
});
```

---

### 7. Message System

**Reference Pattern:**
```javascript
gameState: {
    message: "Player 1 bid. Player 2's turn."
}

// Update message with each action
setGameState(prev => ({
    ...prev,
    message: `P${prev.currentPlayer} placed at ${location}. P${nextPlayer}'s turn.`
}));

// Display in UI
<p className="text-lg font-bold">{gameState.message}</p>
```

**Project Pattern:** No message system.

**Recommendation:** Add message system to GameState:

```javascript
// In GameState
constructor() {
    // ...
    this.message = '';
    this.messageHistory = [];
}

setMessage(msg) {
    this.message = msg;
    this.messageHistory.push({ msg, timestamp: Date.now() });
}

// In GameEngine.executeAction()
case 'placeWorker':
    // ... existing logic
    this.state.setMessage(`${currentPlayer.name} placed worker at ${action.locationId}`);
    break;
```

---

## Priority Implementation Order

1. **Message System** - Easy, improves UX immediately
2. **Feeding Costs + Income** - Simple math in cleanup phase
3. **Random AI Strategy** - Enables playtesting quickly
4. **Competition Act Dice Rolls** - Core gameplay mechanic
5. **Market Restock Logic** - Balance issue
6. **Worker Cost Scaling** - Balance issue (optional)

---

## Files to Modify

| File | Changes |
|------|---------|
| `GameState.js` | Add message system |
| `Phases.js` | Add feeding/income to cleanup |
| `ActCardManager.js` | Add dice roll resolution for competitions |
| `BasicStrategy.js` | Port random decision logic |
| `Market.js` | Update restock logic |
| `config.js` | Add feeding cost rate, income multiplier |
