# Task 1: AI Integration and Quality

## Overview

Implement functional AI opponents that can play the game competently across all phases. Centralize validation logic for reusability.

---

## Current AI Implementation Status

### Files in `js/ai/` Folder

| File | Purpose | Status |
|------|---------|--------|
| `AIPlayer.js` | Wrapper class that connects a Player to a Strategy | ✅ Framework complete |
| `PlaytestEngine.js` | Runs automated AI vs AI games for balance testing | ⚠️ Placeholder (just passes each turn) |
| `strategies/BasicStrategy.js` | Random-but-valid decision making | ⚠️ Basic random logic, needs improvement |

### `AIPlayer.js` Details
- Wraps a player with a strategy (defaults to `BasicStrategy`)
- Supports difficulty levels: easy, medium, hard (configured in `config.js`)
- `makeDecision(gameState)` - async method with 500ms delay for natural feel
- `shouldAct(gameState)` - checks if AI should take action

### `BasicStrategy.js` Details
- **Current behavior**: Makes random decisions with probability thresholds
  - `bidChance = 0.4` (40% chance to bid)
  - `placeWorkerChance = 0.7` (70% chance to place worker)
  - `buyResourceChance = 0.6` (60% chance to buy)
- **Methods**:
  - `decideBid()` - Random act, random 1-3 coins
  - `decideWorkerPlacement()` - Random valid location
  - `decideMarketPurchase()` - Random buy decision
  - `getValidLocations()` - Filters invalid placements
  - `decide()` - Main entry point, routes by phase

### `PlaytestEngine.js` Details
- `runGame(playerCount)` - Runs single game (currently just passes each turn)
- `runBatch(count, playerCount)` - Runs multiple games
- `getStatistics()` - Aggregates results (duration, turns, wins)
- **NOT FUNCTIONAL** - needs AI decision execution implemented

---

## Game Mechanics Summary (For AI Decision Making)

### Victory Conditions
- **Track Victory**: Reach 15 on any track (Empire, Population, Church)
- **Round Limit**: After 10 rounds, highest total across all tracks wins
- **Tiebreaker**: Most total resources

### Resource Economy
| Resource | Starting | Purpose |
|----------|----------|---------|
| Coins | 15 | Bidding, purchasing, worker deployment |
| Workers | 5 | Place at locations for actions |
| Mummers | 0 | Required for some acts |
| Animals | 0 | Required for some acts |
| Slaves | 0 | Required for some acts |
| Prisoners | 0 | Required for execution acts |

### Phase-by-Phase AI Requirements

#### 1. Bid on Acts Phase
- **Turn Order**: Empire track leader first
- **First player rule**: Must place at least one bid before passing
- **Decision factors**:
  - Available coins
  - Act requirements (can I participate?)
  - Act rewards (track movements, coins)
  - Competition (who else might bid?)

#### 2. Place Workers Phase
- **Turn Order**: Population track leader first
- **Cost**: 1 coin per worker
- **Decision factors**:
  - What resources do I need?
  - Risk/reward for coin-flip locations
  - Track boosts (Town Square, Palace, Pantheon)
  - Market positioning

#### 3. Buy Resources Phase
- **Turn Order**: Market queue order (when workers were placed)
- **Supply/demand pricing**: Left-to-right, cheapest first
- **Price tiers**:
  - Mummers: [1, 2, 3, 4, 5]
  - Animals: [2, 3, 4, 5, 6]
  - Slaves: [3, 4, 5, 6, 7]

#### 4. Perform Acts Phase (Automatic)
- AI doesn't make decisions here
- Acts resolve based on bids and resources

#### 5. Cleanup Phase (Automatic)
- No player actions

---

## Worker Placement Locations

### Resource Acquisition (Coin Flip - Risk/Reward)
| Location | Success | Failure | AI Strategy |
|----------|---------|---------|-------------|
| Port | +2 mummers from supply | Lose worker | Good when low on mummers, workers abundant |
| War | +2 slaves from supply | Lose worker | Good when low on slaves, workers abundant |
| Forest | +2 animals from supply | Lose worker | Good when low on animals, workers abundant |

### Market Positioning
| Location | Effect | AI Strategy |
|----------|--------|-------------|
| Mummers Market | Queue for buying mummers | Place early for better prices |
| Animals Market | Queue for buying animals | Place early for better prices |
| Slaves Market | Queue for buying slaves | Place early for better prices |

### Track Boosters (Temporary +1)
| Location | Track | AI Strategy |
|----------|-------|-------------|
| Town Square | Population | Good when close to 15 or for income boost |
| Palace | Empire | Good when close to 15, affects next round order |
| Pantheon | Church | Good when close to 15 or for income boost |

### Special Locations
| Location | Effect | AI Strategy |
|----------|--------|-------------|
| Prison | +1 prisoner (up to 6 total) | Essential for execution acts |
| Guildhall | Slave + 5 coins → +1 worker | Long-term investment, expensive |
| Oracle | 1 animal → see top event card | Information value, situational |
| Gamblers Den | Betting (not implemented) | Skip for now |

---

## Goals

1. **Functional AI** — AI can play full games without errors
2. **Competent Strategy** — AI makes reasonable decisions (not optimal, just sensible)
3. **Centralized Validation** — All rule validation in `rules.js` for AI and UI reuse

---

## Subtasks

### 1.1 ✅ Implement `rules.js` Validation Logic

**Status:** COMPLETE

`rules.js` now contains:
- `validateBid()` - Bid validation with first-player rule
- `validateWorkerPlacement()` - Location and resource validation
- `validateLocationRequirements()` - Location-specific requirements
- `validateResourcePurchase()` - Market queue and pricing validation
- `validateAction()` - Phase-based action routing
- `canParticipateInAct()` - Act resource requirements
- `checkWinConditions()` - Track victory check
- `checkGameOver()` - Game end conditions
- `validateGameState()` - State consistency check
- `getValidWorkerLocations()` - Valid placement list

---

### 1.2 AI Move Generation (In Progress)

**Priority:** High

**Tasks:**
- [x] Generate valid moves for Place Workers phase (BasicStrategy.getValidLocations)
- [ ] Generate valid moves for Bid on Acts phase (needs act requirement check)
- [ ] Generate valid moves for Buy Resources phase (needs market queue integration)
- [ ] Use `rules.js` functions consistently (currently duplicated logic)

**Recommendation:** Refactor `BasicStrategy` to use `rules.js` functions instead of duplicating validation logic.

---

### 1.3 AI Move Evaluation (Pending)

**Priority:** Medium

**Current State:** Random selection only

**Recommended Heuristics:**

#### Bidding Evaluation
```javascript
// Score an act bid
function scoreActBid(act, player, gameState) {
    let score = 0;
    
    // Can we even participate?
    if (!canParticipateInAct(player, act)) return -Infinity;
    
    // Reward value
    score += act.rewards?.coins || 0;
    for (const [track, amount] of Object.entries(act.rewards?.tracks || {})) {
        const currentValue = player.getTrack(track);
        // Higher value if close to winning
        score += amount * (currentValue >= 12 ? 3 : 1);
    }
    
    // Penalty for non-participation
    if (act.penalty) score += 5; // Avoid penalty
    
    // Cost consideration
    score -= (act.resourceCost ? Object.values(act.resourceCost).reduce((a,b) => a+b, 0) : 0);
    
    return score;
}
```

#### Worker Placement Evaluation
```javascript
// Score a location
function scoreLocation(locationId, player, gameState) {
    let score = 0;
    
    // Resource acquisition locations
    if (['port', 'war', 'forest'].includes(locationId)) {
        // 50% success chance
        // Score based on resource need
        const resourceMap = { port: 'mummers', war: 'slaves', forest: 'animals' };
        const resource = resourceMap[locationId];
        const currentAmount = player.getResource(resource);
        score = currentAmount < 2 ? 3 : 1; // Higher if we need it
    }
    
    // Market positions - earlier is better
    if (locationId.includes('Market')) {
        score = 2; // Moderate value
    }
    
    // Track boosters - high value if close to winning
    if (['townSquare', 'palace', 'pantheon'].includes(locationId)) {
        const trackMap = { townSquare: 'population', palace: 'empire', pantheon: 'church' };
        const track = trackMap[locationId];
        const value = player.getTrack(track);
        score = value >= 12 ? 5 : 2;
    }
    
    // Prison - essential for execution acts
    if (locationId === 'prison') {
        score = player.getResource('prisoners') < 2 ? 3 : 1;
    }
    
    return score;
}
```

---

### 1.4 AI Testing

**Priority:** Low (after implementation)

**Tasks:**
- [ ] Fix PlaytestEngine to execute AI decisions
- [ ] AI vs AI games complete without errors
- [ ] AI makes sensible decisions (manual review)
- [ ] AI doesn't get stuck in infinite loops
- [ ] AI handles edge cases (no resources, no workers, etc.)

---

## Implementation Recommendations

### Priority 1: Make PlaytestEngine Functional
1. Import `AIPlayer` in `PlaytestEngine.js`
2. Create AI instances for each player
3. Call `ai.makeDecision(gameState)` and execute result via `GameEngine`

### Priority 2: Improve BasicStrategy
1. Replace `getValidLocations()` with `rules.getValidWorkerLocations()`
2. Add scoring functions for each decision type
3. Sort options by score, pick best (or weighted random for difficulty)

### Priority 3: Add Difficulty Scaling
- **Easy**: High randomness, no look-ahead
- **Medium**: Moderate randomness, basic scoring
- **Hard**: Low randomness, full scoring evaluation

### Priority 4: Edge Case Handling
- No valid moves → must pass
- First player bidding rule enforcement
- Resource depletion scenarios

---

## Key Files

| File | Purpose |
|------|---------|
| `js/utils/rules.js` | Centralized validation logic (COMPLETE) |
| `js/ai/AIPlayer.js` | AI player wrapper |
| `js/ai/strategies/BasicStrategy.js` | Decision-making strategy |
| `js/ai/PlaytestEngine.js` | Automated game running |
| `js/utils/config.js` | AI difficulty settings |

---

## Notes for Agents

- Use `rules.js` functions for ALL validation (don't duplicate logic)
- AI doesn't need to be optimal, just functional and sensible
- Start with simple heuristics, can improve later
- Test with `PlaytestEngine.js` for automated games
- Check `config.js` for AI difficulty settings (lookAhead, randomness)
- **Important**: First player in bidding phase MUST bid before passing

---

## Success Criteria

- [ ] AI can complete full games without errors
- [ ] AI makes reasonable bids on acts
- [ ] AI places workers at useful locations
- [ ] AI buys resources it needs
- [ ] AI doesn't waste resources unnecessarily
- [x] All validation centralized in `rules.js`

---

## Implementation Batches (For Agents)

Execute these batches in order. Each batch is one prompt/session.

---

### BATCH 1: Make BasicStrategy Use rules.js ✅ COMPLETE

**Goal:** Remove duplicated validation logic from BasicStrategy

**Files modified:**
- `js/ai/strategies/BasicStrategy.js`

**Completed:**
1. ✅ Imported `validateBid`, `validateResourcePurchase`, `getValidWorkerLocations`, `canParticipateInAct` from rules.js
2. ✅ Removed `getValidLocations()` method - now uses `getValidWorkerLocations()` from rules.js
3. ✅ `decideBid()` uses `validateBid()` for pass validation (first player rule) and bid validation
4. ✅ `decideMarketPurchase()` uses `validateResourcePurchase()` for buy validation
5. ✅ All methods now pass `config` parameter for validation
6. ✅ Added fallback handling for first player rule (must bid if can't pass)

---

### BATCH 2: Add Scoring Heuristics to BasicStrategy ✅ COMPLETE

**Goal:** AI makes intelligent decisions instead of random

**Files modified:**
- `js/ai/strategies/BasicStrategy.js`

**Completed:**
1. ✅ Added `scoreAct(act, player, gameState)` - evaluates acts based on:
   - Resource requirements (returns -Infinity if can't participate)
   - Coin rewards (weighted x2)
   - Track rewards (weighted by proximity to win: x5 at 12+, x3 at 8+, x1.5 base)
   - Non-participation penalties (+4 incentive)
   - Execution act handling (requires prisoners)

2. ✅ Added `scoreLocation(locationId, player, gameState, config)` - evaluates locations:
   - Resource locations (port/war/forest): Score by need, reduce if low on workers
   - Market locations: Score by resource need
   - Track boosters: High score when close to winning (6 at 13+, 4 at 10+)
   - Prison: Score by prisoner need for execution acts
   - Guildhall: Score when low on workers and can afford
   - Oracle: Moderate base score

3. ✅ Added `scoreResourcePurchase(resourceType, player, gameState)` - evaluates purchases:
   - Base need score (5 if none, decreasing with quantity)
   - Bonus if resource needed for available acts

4. ✅ Added `selectBestOption(options)` - helper to pick highest scored option

5. ✅ Updated `decideBid()` to score all acts and bid on best one
   - Bid amount scales with act score (3 for high value, 2 for medium, 1 for low)

6. ✅ Updated `decideWorkerPlacement()` to score locations and pick best
   - Threshold check: won't place if best score < 1

7. ✅ Updated `decideMarketPurchase()` to evaluate value vs price
   - Uses value/price ratio (must be >= 0.5 to buy)

---

### BATCH 3: Fix PlaytestEngine to Execute AI Decisions ✅ COMPLETE

**Goal:** PlaytestEngine can run full AI vs AI games

**Files modified:**
- `js/ai/PlaytestEngine.js`

**Completed:**
1. ✅ Imported `AIPlayer` and `BasicStrategy` at top
2. ✅ Create AIPlayer instances for each player after `game.initializeGame()`
3. ✅ Game loop now executes AI decisions:
   - Gets current player's AI instance
   - Calls `strategy.decide(gameState, player, config)`
   - Executes returned action via `game.executeAction(decision)`
   - Falls back to pass if action fails
4. ✅ Skip automatic phases (performActs, cleanup)
5. ✅ Error handling with try/catch, falls back to pass on error
6. ✅ Safety limits: maxTurns=1000, maxActions=5000
7. ✅ Added debug mode (`enableDebug()`) for logging AI decisions
8. ✅ Enhanced statistics: tracks completed games, actions, hit limits
9. ✅ Better result tracking: final scores include all tracks and resources
10. ✅ `runBatch()` now logs progress and summary statistics

---

### BATCH 4: Add Difficulty Levels ✅ COMPLETE

**Goal:** Easy/Medium/Hard AI behaves differently

**Files modified:**
- `js/ai/strategies/BasicStrategy.js`
- `js/utils/config.js`

**Completed:**
1. ✅ Added `randomness` property (0.0 = always best, 1.0 = always random)
2. ✅ Added `getDefaultRandomness(difficulty)` method
3. ✅ Added `configureFromConfig(config)` to read AI settings from config.js
4. ✅ New `selectOption(options)` method with weighted random selection:
   - If roll > randomness: pick best option
   - Else: pick weighted random based on scores (softmax-like)
5. ✅ Updated config.js with proper difficulty values:
   - Easy: randomness=0.8 (80% random)
   - Medium: randomness=0.4 (40% random)
   - Hard: randomness=0.1 (10% random)
6. ✅ `decideBid()` uses difficulty for act selection AND bid amount:
   - Hard: precise bidding based on score
   - Medium: somewhat strategic with some randomness
   - Easy: random bidding 1-3 coins
7. ✅ `decideWorkerPlacement()` uses difficulty:
   - Easy AI has lower placement threshold (more likely to place)
8. ✅ `decideMarketPurchase()` uses difficulty:
   - Easy AI has lower buy threshold, more impulsive buying
   - Hard AI is more selective about value/price ratio

---

### BATCH 5: Edge Cases and First Player Rule ✅ COMPLETE

**Goal:** AI handles all edge cases without errors

**Files modified:**
- `js/ai/strategies/BasicStrategy.js`

**Completed:**
1. ✅ **First player bidding rule**: Added `isFirstPlayer()` and `hasPlayerBid()` helpers
   - If first player and no bids yet, MUST bid even if no good options
   - Falls back to minimum bid on first available act

2. ✅ **Safe accessor methods** added:
   - `safeGetResource(player, resourceName)` - handles undefined/null
   - `safeGetTrack(player, trackName)` - handles undefined/null
   - `safeGetAvailableWorkers(player)` - handles undefined/null

3. ✅ **Edge cases in decideBid()**:
   - No acts available → pass
   - No coins → pass (even first player can't bid without coins)
   - No valid acts to score → forced bid if first player
   - Validation fails → fallback bid if first player, else pass

4. ✅ **Edge cases in decideWorkerPlacement()**:
   - No available workers → pass
   - No coins for worker cost → pass
   - No valid locations → pass
   - Score too low → pass

5. ✅ **Edge cases in decideMarketPurchase()**:
   - No current market → pass
   - Not in market queue → pass
   - No coins → pass
   - Can't afford price → pass
   - Market empty (stock=0) → pass

6. ✅ **Global safety**:
   - All methods check for null/undefined gameState and player
   - try/catch wrappers around validation calls
   - Unknown phase → pass
   - Any exception → pass (prevents crashes)

---

### BATCH 6: Testing and Validation

**Goal:** Verify AI works correctly

**Tasks:**
1. Run PlaytestEngine.runBatch(10, 2) and check for errors
2. Manually review AI decisions in console logs
3. Verify games complete without infinite loops
4. Check AI uses resources sensibly (not hoarding, not wasting)
5. Document any remaining issues in AI-REFERENCE.md

**Prompt for agent:**
> "Test the AI implementation by running PlaytestEngine.runBatch(10, 2). Add console.log statements to track AI decisions. Identify and fix any errors or infinite loops. Update AI-REFERENCE.md with test results and any remaining issues."

---

### Batch Dependency Chart

```
BATCH 1 (rules.js integration)
    ↓
BATCH 2 (scoring heuristics)
    ↓
BATCH 3 (PlaytestEngine fix)
    ↓
BATCH 4 (difficulty levels)
    ↓
BATCH 5 (edge cases)
    ↓
BATCH 6 (testing)
```
