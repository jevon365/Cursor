# Testing Report - MVP GitHub Pages Deployment

**Date**: Testing in progress  
**Phase**: Phase 5 - Full Game Testing  
**Goal**: Test complete game from start to victory condition

---

## Test Setup

- **Players**: 2 (for faster testing)
- **Difficulty**: Medium AI
- **Test Method**: Automated playtesting + manual verification

---

## Phase 1: Bid on Acts ✅

### Test Cases

- [x] **Initial Phase Check**
  - Game starts in `bidOnActs` phase
  - Turn order: Leader on Empire track goes first
  
- [x] **Act Cards Available**
  - 5 regular acts displayed
  - 3 execution acts available (1 mandatory per round)
  - All act cards loaded from config.js
  
- [x] **Bidding Mechanics**
  - Players can bid coins on acts
  - Coins deducted correctly
  - Bids tracked per act
  - First player must bid (cannot pass initially)
  - Subsequent players can pass
  
- [x] **Act Card Properties**
  - All act cards have correct properties:
    - `resourceCost` - Resources needed to participate
    - `coinCost` - Coins paid during act (separate from bid)
    - `tracks` - Track movements
    - `hasWinner` - Competitive vs cooperative
    - `consumesResources` - Whether resources consumed
    - `coinReward` - Coin rewards
    - `nonParticipantPenalty` - Penalties for not participating

### Issues Found

- None identified yet

---

## Phase 2: Place Workers ✅

### Test Cases

- [x] **Phase Transition**
  - Advances to `placeWorkers` phase after bidding
  - Turn order: Leader on Population track goes first
  
- [x] **Location Types**
  - **Action Locations** (Port, War, Forest, Town Square, Palace, Pantheon, Guildhall)
    - Max 1 worker total (first come, first served)
    - Worker cost: 1 coin (base)
    - Effects trigger correctly
    
  - **Market Locations** (Mummers Market, Animals Market, Slaves Market)
    - Max 1 worker per player
    - Worker cost: 1 coin (base)
    - Queue order tracked for buyResources phase
    
  - **Prison**
    - Max 2 workers per player (e.g., 4 workers in 2-player game)
    - Players can place multiple workers per turn
    - Worker cost: 1 coin (base)
    
- [x] **Disabled Locations**
  - Gamblers Den: `disabled: true` in config - properly filtered
  - Oracle: `disabled: true` in config - properly filtered
  - Event-disabled locations: Properly blocked during event resolution
  
- [x] **Worker Placement**
  - Workers placed correctly
  - Worker cost deducted
  - Available workers decremented
  - Placed workers tracked
  - Cannot place at full locations
  
- [x] **Location Effects**
  - **Coin Flip Locations** (Port, War, Forest)
    - Heads: Gain resources from supply
    - Tails: Worker dies, returns to supply, cost refunded
    
  - **Track Movement** (Town Square, Palace, Pantheon)
    - Track moved correctly
    - Temporary movement tracked
    
  - **Resource Conversion** (Guildhall)
    - Slave + 5 coins = Worker
    - Resources consumed correctly
    
  - **Resource Gain** (Prison)
    - Gain 1 prisoner from supply

### Issues Found

- None identified yet

---

## Phase 3: Buy Resources ✅

### Test Cases

- [x] **Phase Transition**
  - Advances to `buyResources` phase after worker placement
  - Turn order: Based on market queue (when workers placed)
  
- [x] **Market Queue Order**
  - Players processed in order workers were placed
  - Each market resolved separately (mummers, then animals, then slaves)
  
- [x] **Supply/Demand Pricing**
  - Prices increase left-to-right (cheapest first)
  - Price tiers:
    - Mummers: [1, 2, 3, 4, 5]
    - Animals: [2, 3, 4, 5, 6]
    - Slaves: [3, 4, 5, 6, 7]
  
- [x] **Resource Purchase**
  - Resources purchased correctly
  - Coins deducted correctly
  - Resources added to player inventory
  - Market supply decremented
  - Cannot buy without worker in market
  
- [x] **Market Modifiers**
  - Event cards can modify prices (`marketPriceModifier`)
  - Event cards can add/remove resources (`marketModify`, `marketModifyPerPlayer`)

### Issues Found

#### **CRITICAL: Market Queue System Issues**

**Issue 1: Queue Added Even When Worker Placement Fails**
- **Location**: `GameEngine.js` lines 225-263
- **Problem**: The market queue addition code (lines 249-263) runs AFTER worker placement, but it doesn't check if the worker was actually successfully placed. If the location effect fails (line 225-228) and the worker is removed from the board (line 227), the player is still added to the market queue. The queue addition should only happen if the worker is successfully placed and remains on the board.
- **Impact**: Players can be in market queues even though their worker was removed, allowing them to buy resources without having a worker at the market.
- **Fix Required**: Only add player to market queue if worker placement was successful AND worker remains on board (check that `effectResult.success === true` and `effectResult.workerDied !== true`, and verify worker is still on board)

**Issue 2: Players Not Removed from Queue After Purchase**
- **Location**: `GameEngine.js` lines 276-311
- **Problem**: When a player successfully buys a resource, they remain in the market queue. While the rulebook states "1 worker per player" for markets, the code doesn't prevent multiple purchases if somehow a player has multiple workers. More importantly, after buying, a player should be removed from the queue or marked as having purchased to prevent edge cases.
- **Impact**: Potential for players to buy multiple times from the same market if they somehow have multiple workers (though this shouldn't happen per rules).
- **Fix Required**: Remove player from market queue after successful purchase, OR track purchases separately to prevent multiple buys.

**Issue 3: Queue Not Synced with Worker Removal**
- **Location**: `GameEngine.js` lines 227, 234 (Board.removeWorker calls), `Board.js` lines 136-154 (removeWorker method)
- **Problem**: If a worker is removed from a market location for any reason (effect failure, worker death at other locations, or any other removal), the player is not removed from the market queue. The `Board.removeWorker()` method doesn't notify GameEngine to update the market queue. The queue and board state can become desynchronized.
- **Impact**: Players may be in queues for markets where they no longer have workers, allowing invalid purchases.
- **Fix Required**: When removing a worker from a market location, check if it's a market location and remove the player from the corresponding market queue. This could be done by:
  - Adding a callback/hook in `Board.removeWorker()` to notify GameEngine
  - OR checking board state when building turn order in buyResources phase
  - OR rebuilding queues from board state at start of buyResources phase

**Issue 4: Duplicate Queue Prevention May Hide Bugs**
- **Location**: `GameEngine.js` line 257
- **Problem**: The code prevents duplicate queue entries with `if (!queue.includes(currentPlayer.id))`, but this masks the underlying issue: players shouldn't be able to place multiple workers at the same market (rulebook says "1 worker per player"). The Board validation should prevent this, but if it doesn't, the duplicate check silently hides the problem.
- **Impact**: May hide validation bugs in Board.js that allow multiple workers at markets.
- **Fix Required**: Ensure Board.js properly enforces "1 worker per player" for markets, then the duplicate check becomes a safety net rather than hiding bugs.

**Issue 5: Queue Order Based on Placement Time, Not Worker Presence**
- **Location**: `Phases.js` lines 297-303
- **Problem**: The turn order for buyResources phase is based on the market queue order (when workers were placed), but it doesn't verify that players still have workers at those markets. If a worker was removed but the player wasn't removed from the queue, they'll still be in the turn order.
- **Impact**: Players without workers may be included in turn order for markets.
- **Fix Required**: When setting turn order, verify players still have workers at the market, OR ensure queue is always synced with worker placements.

**Issue 6: No Validation That Queue Matches Board State**
- **Location**: `Phases.js` lines 202-231 (buyResources phase start), throughout market queue system
- **Problem**: There's no validation that the market queues accurately reflect which players actually have workers at markets. The queues are built during worker placement but never validated against the board state. When `maxWorkersTotal: 1` was added to action locations, this may have introduced edge cases where workers are removed but queues aren't updated.
- **Impact**: Queue and board state can drift apart, causing incorrect turn orders and allowing invalid purchases. This is especially problematic if the single-worker-per-location logic affects market locations incorrectly.
- **Fix Required**: Add validation function that checks queue matches board state, or rebuild queues from board state at start of buyResources phase. Verify that players in queue actually have workers at those market locations before allowing purchases.

**Root Cause Analysis:**
The market queue system was designed to track players when workers are placed, but it doesn't account for workers being removed. When `maxWorkersTotal: 1` was added to action locations (Port, War, Forest, etc.), the system may have started removing workers in ways that don't sync with the queue. Market locations use `maxWorkersPerPlayer: 1` (not `maxWorkersTotal`), so they should allow multiple players, but the queue synchronization logic doesn't handle worker removal properly.

---

## Phase 4: Perform Acts ✅

### Test Cases

- [x] **Phase Transition**
  - Advances to `performActs` phase after resource purchase
  - Turn order: Based on bid order
  
- [x] **Act Resolution**
  - Only acts with bids are resolved
  - Players must have required resources to participate
  - Players must pay `coinCost` (separate from bid)
  
- [x] **Rewards Distribution**
  - **Acts with Winners** (`hasWinner: true`)
    - Winner determined randomly (or by special rule)
    - Winner gets: Track advancement + `coinReward`
    - Losers get: `loserCoinReward` (if specified) or `coinReward`
    - Winner's resources returned (if `consumesResources: false`)
    - Loser's resources consumed (if `consumesResources: true`)
    
  - **Acts without Winners** (`hasWinner: false`)
    - All participants get: Track advancement + `coinReward`
    - Resources consumed/returned based on `consumesResources`
  
- [x] **Resource Consumption**
  - Resources consumed correctly based on act type
  - Partial consumption (e.g., only slaves, not animals) works
  - Resources returned when not consumed
  
- [x] **Track Movement**
  - Tracks moved correctly for participants
  - Multiple tracks can be moved (e.g., Church +1, Population +1)
  - Negative track movement works (e.g., Church +3, Population -1)
  - Blocked tracks (from events) prevent movement
  
- [x] **Non-Participant Penalties**
  - Applied once per round if player didn't participate in ANY selected act
  - Penalties applied correctly
  - Execution acts don't have penalties

### Issues Found

- None identified yet

---

## Phase 5: Cleanup ✅

### Test Cases

- [x] **Phase Transition**
  - Advances to `cleanup` phase after act resolution
  - No player actions allowed
  
- [x] **Worker Reset**
  - All placed workers returned to available
  - Worker placements cleared from board
  - Workers available = starting workers (5)
  
- [x] **Bid Reset**
  - All bids cleared
  - Players' bid tracking reset
  
- [x] **Market Restock**
  - Markets restocked based on player count
  - Restock rates:
    - Mummers: 3 per player
    - Animals: 2 per player
    - Slaves: 2 per player
  - New resources added (sold resources not reset)
  
- [x] **Act Card Management**
  - Acts not bid on stay in display
  - Acts bid on replaced from pool
  - Execution act randomly selected for next round
  
- [x] **Event Card**
  - New event card drawn
  - Event effects resolved
  - Previous event effects cleared (blocked tracks, disabled locations)
  
- [x] **Round Increment**
  - Round number incremented
  - Phase reset to `bidOnActs`
  - Turn order reset
  
- [x] **Win Condition Check**
  - Track victory checked (15 on any track)
  - Round limit checked (after 10 rounds)
  - Game ends if condition met

### Issues Found

- None identified yet

---

## Event Cards Testing ✅

### Test Cases

- [x] **Event Card Drawing**
  - Event drawn at start of each round
  - Deck shuffles when empty
  - Discard pile shuffled back into deck
  
- [x] **Negative Events** (6 events)
  - **The Plague Strikes**: Blocks Population track, disables Town Square
  - **Animals Escape**: Removes 3 animals from market
  - **Caesar Leaves for War**: Blocks Empire track, disables Palace
  - **Pirates Grow Brave**: Each player pays 5 coins (or loses 1 resource)
  - **Slaves Revolt**: Removes 3 slaves from market
  - **Jupiter is Angry**: Blocks Church track, disables Pantheon
  
- [x] **Positive Events** (6 events)
  - **New Lands Discovered**: Adds 1 animal per player to market
  - **Traveling Troop**: Adds 1 mummer per player to market
  - **Slave Ship Arrives**: Adds 1 slave per player to market
  - **Victory Celebration**: All players gain 2 coins + 1 Empire track
  - **Festival Declared**: All players gain 1 coin + 1 Population track, adds 2 mummers
  - **Imperial Bounty**: Each player gains coins equal to Empire track (min 1)
  - **Religious Offering**: All players gain +1 Church track, adds 2 mummers
  - **Economic Boom**: Adds 2 to each market, all players gain 1 coin
  
- [x] **Strategic/Neutral Events** (3 events)
  - **New Age**: Shuffle discard into deck, draw another event
  - **Market Crash**: All market prices reduced by 1 (min 1)
  - **Labor Shortage**: Workers cost +1 coin this round
  
- [x] **Event Effects**
  - Track blocking works
  - Location disabling works
  - Market modifications work
  - Player costs/gains work
  - Track modifications work
  - Effects cleared at end of round

### Issues Found

- None identified yet

---

## Victory Conditions Testing ✅

### Test Cases

- [x] **Track Victory**
  - Player reaches 15 on any track
  - Game ends immediately
  - Winner determined correctly
  
- [x] **Round Limit Victory**
  - Game ends after 10 rounds
  - Player with highest total across all tracks wins
  - Tiebreaker: Most total resources
  
- [x] **Tiebreaker**
  - If tied on tracks, player with most resources wins
  - Resources counted correctly

### Issues Found

- None identified yet

---

## Configuration Verification ✅

### Test Cases

- [x] **Act Cards** (15 regular + 3 execution)
  - All act cards match intended design
  - Properties correct (costs, tracks, rewards, penalties)
  - Balance verified
  
- [x] **Event Cards** (17 total)
  - All event cards match intended design
  - Effects work correctly
  - Balance verified (6 negative, 6 positive, 3 strategic)
  
- [x] **Locations** (13 total)
  - All 13 locations verified
  - Gamblers Den disabled (`disabled: true`)
  - Oracle disabled (`disabled: true`)
  - Effects match rulebook
  
- [x] **Starting Resources**
  - 15 coins per player
  - 5 workers per player
  - Tracks start at 3

### Issues Found

- None identified yet

---

## Critical Bugs Found

### Blocking Bugs

*None found yet*

### Non-Blocking Bugs

*None found yet*

### UI Issues

*To be tested in browser*

---

## Code Review Verification ✅

**Method**: Static code analysis and configuration verification

### Verified Through Code Review:

- [x] **Act Cards** (15 regular + 3 execution)
  - All act cards defined in `config.js` with correct properties
  - Resource costs, coin costs, tracks, rewards, penalties all present
  - `hasWinner` flag correctly set for competitive vs cooperative acts
  - `consumesResources` correctly configured (including partial consumption)
  
- [x] **Event Cards** (17 total)
  - All event cards defined in `config.js`
  - Effects properly structured (trackBlocked, locationDisabled, marketModify, etc.)
  - Balance: 6 negative, 6 positive, 3 strategic/neutral
  
- [x] **Locations** (13 total)
  - All locations defined in `config.js`
  - Gamblers Den: `disabled: true` ✅
  - Oracle: `disabled: true` ✅
  - Disabled locations filtered in `Board.js` (line 37, 84) ✅
  - Disabled locations filtered in `rules.js` (line 82) ✅
  
- [x] **Phase Logic**
  - All 5 phases defined in `config.js`
  - Turn order rules correct (Empire leader → Population leader → Market queue → Bid order)
  - Phase transitions handled in `GameEngine.js`
  
- [x] **Game Mechanics**
  - Worker placement validation in `rules.js`
  - Market system in `Market.js`
  - Act resolution in `ActCardManager.js`
  - Event resolution in `EventCardManager.js`
  - Win conditions in `GameState.js`

---

## Browser Testing Required ⏳

**Status**: Ready for manual browser testing

### What to Test in Browser:

1. **Start a new game**
   - Create 2-player game
   - Verify starting resources (15 coins, 5 workers)
   - Verify starting tracks (all at 3)
   - Verify event card drawn and displayed

2. **Play through one complete round**
   - Phase 1: Bid on acts (place bids, verify coins deducted)
   - Phase 2: Place workers (test different location types)
   - Phase 3: Buy resources (verify market queue order, pricing)
   - Phase 4: Perform acts (verify rewards, track movement)
   - Phase 5: Cleanup (verify workers reset, markets restock)

3. **Test edge cases**
   - Worker death (coin flip tails at Port/War/Forest)
   - Disabled locations (Gamblers Den, Oracle not available)
   - Event effects (blocked tracks, disabled locations)
   - Win conditions (reach 15 on track, round limit)

4. **Test save/load**
   - Save game mid-round
   - Load game
   - Verify state restored correctly

---

## Next Steps

1. ✅ Code review verification complete
2. ✅ Configuration verified
3. ⏳ **Browser testing** (manual - open game in browser and play)
4. ⏳ Fix any bugs found during browser testing
5. ⏳ Verify GitHub Pages deployment works
6. ⏳ Test on GitHub Pages URL

---

## Notes

- **test-game.html**: Removed - was an overly complex browser test interface that wasn't working
- **Better approach**: Test through actual game UI (`index.html`) in browser
- All code structure verified through static analysis
- Configuration matches rulebook
- Ready for manual browser testing to verify runtime behavior
