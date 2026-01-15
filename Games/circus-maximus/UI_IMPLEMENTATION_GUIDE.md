# UI Implementation Guide

This document outlines what's ready for UI implementation and what the UI agent needs to build.

## ✅ What's Ready

### Game Engine State
- `gameEngine.getState()` - Returns complete game state including:
  - `players` - Array of player summaries (resources, tracks, workers)
  - `currentPlayer` - Current player info
  - `currentPhase` - Current phase ID ('bidOnActs', 'placeWorkers', etc.)
  - `round`, `turn` - Game progress
  - `board` - Worker placements
  - `markets` - Market states (available resources, prices)
  - `availableActs` - Available act cards (from `gameEngine.acts.getAvailableActs()`)
  - `currentEvent` - Current event card
  - `blockedTracks` - Tracks blocked by events
  - `disabledLocations` - Locations disabled by events

### Action Execution
- `gameEngine.executeAction(action)` - Executes player actions
  - Returns `{ success: boolean, error?: string, gameOver?: boolean, winner?: Player }`
  - Action format: `{ type: string, ...phaseSpecificData }`
  
### Phase Tracking
- ✅ Phase transitions work correctly
- ✅ Passed player tracking implemented
- ✅ Phases end when all players pass

### Available Data Sources
- `gameEngine.acts.getAvailableActs()` - Returns `{ regular: [...], execution: [...] }`
- `gameEngine.markets.getAllStates()` - Market resource availability
- `gameEngine.board.spaces` - Location definitions
- `gameEngine.board.workerPlacements` - Current worker placements

## ⚠️ What Needs Fixing

### Action Structure Mismatch
**Problem**: `getAvailableActions()` returns strings (`'bid'`, `'pass'`), but UI expects objects with `.name` property.

**Current Code**:
```javascript
// Phases.js line 73
actions.push('bid', 'pass'); // Returns strings
```

**UI Expects**:
```javascript
// GameDisplay.js line 91
actionBtn.textContent = action.name || 'Action'; // Expects object with .name
```

**Fix Needed**: Change `getAvailableActions()` to return action objects, or update UI to handle both.

## 🎯 UI Implementation Tasks

### 1. Fix Action Structure (CRITICAL)
Either:
- **Option A**: Update `Phases.getAvailableActions()` to return objects:
  ```javascript
  { type: 'bid', name: 'Bid on Act', requiresSelection: true }
  { type: 'pass', name: 'Pass' }
  ```
- **Option B**: Update `GameDisplay.js` to handle string actions and build UI accordingly

### 2. Build Interactive Action UI

#### For `bidOnActs` Phase:
- Display all available acts (regular + execution)
- Show current bids on each act
- Input field for bid amount
- Button to submit bid
- Pass button (disabled for first player)

**Action Format**:
```javascript
{ type: 'bid', actId: 'choral_performance', coins: 5 }
{ type: 'pass' }
```

#### For `placeWorkers` Phase:
- Display all locations
- Show which locations are disabled
- Show worker cost (base + modifier)
- Show available workers
- Click location to place worker
- Pass button

**Action Format**:
```javascript
{ type: 'placeWorker', locationId: 'arena' }
{ type: 'pass' }
```

#### For `buyResources` Phase:
- Display market resources (Mummers, Animals, Slaves)
- Show prices (left-to-right, cheapest first)
- Show available quantities
- Click resource to buy
- Pass button

**Action Format**:
```javascript
{ type: 'buyResource', resourceType: 'mummers' }
{ type: 'pass' }
```

#### For `performActs` Phase:
- Automatic phase - just show "Resolving Acts..." message
- Display act resolution results

#### For `cleanup` Phase:
- Automatic phase - show "Cleanup..." message

### 3. Display Game State

#### Player Cards
- Show resources (coins, mummers, animals, slaves, prisoners)
- Show workers (available/placed)
- Show victory tracks (empire, population, church)
- Highlight current player

#### Board Display
- Show all locations
- Show worker placements per location
- Show disabled locations (grayed out)

#### Market Display
- Show available resources with prices
- Show price tiers (1-5 for Mummers, 2-6 for Animals, 3-7 for Slaves)
- Mark sold resources

#### Act Cards Display
- Show 5 regular acts + 3 execution acts
- Show current bids on each act
- Show resource costs
- Show track rewards
- Highlight acts with bids

#### Event Card Display
- Show current event
- Show effects (blocked tracks, disabled locations, modifiers)

### 4. Action Validation Feedback
- Show why actions are invalid (insufficient coins, no workers, etc.)
- Disable buttons for invalid actions
- Show tooltips/hints

### 5. Phase Transitions
- Show phase name clearly
- Show turn order indicator
- Show "Waiting for players..." when appropriate

## 📋 Action Execution Flow

1. User clicks action button/selects option
2. UI builds action object: `{ type: 'bid', actId: '...', coins: 5 }`
3. Call `gameEngine.executeAction(action)`
4. Check result:
   - `success: true` → Call `gameEngine.endTurn()` → Update display
   - `success: false` → Show error message
   - `gameOver: true` → Show game end screen

## 🔧 Helper Methods Available

```javascript
// Get game state
const state = gameEngine.getState();

// Get available acts
const acts = gameEngine.acts.getAvailableActs();
// Returns: { regular: [...], execution: [...] }

// Get market states
const markets = gameEngine.markets.getAllStates();
// Returns market data with available resources

// Get board state
const board = gameEngine.state.board;
// Access: board.spaces, board.workerPlacements

// Check if player can pass
const turnOrder = gameEngine.state.turnOrder;
const firstPlayerIndex = turnOrder[0];
const currentPlayerIndex = gameEngine.state.currentPlayerIndex;
const canPass = (currentPlayerIndex !== firstPlayerIndex || 
                 gameEngine.state.currentPhase !== 'bidOnActs');
```

## 🐛 Known Issues

1. **Action structure mismatch** - Strings vs objects (see above)
2. **No location effects UI** - Locations don't show what they do yet
3. **No act card images** - Just text display for now
4. **Market queue order** - Not tracked yet (placeholder)

## ✅ Testing Checklist

After UI implementation:
- [ ] Can bid on acts in bidOnActs phase
- [ ] Can place workers in placeWorkers phase
- [ ] Can buy resources in buyResources phase
- [ ] Phases transition correctly
- [ ] Pass button works (except first player in bidOnActs)
- [ ] Error messages show for invalid actions
- [ ] Game state displays correctly
- [ ] AI turns work (automatic)
- [ ] Save/load works

## 📝 Notes

- UI should call `uiManager.updateDisplay()` after actions
- AI turns are handled automatically by `UIManager.handleAITurn()`
- Current player is highlighted in player cards
- Disabled locations should be visually distinct
- Blocked tracks should be indicated
