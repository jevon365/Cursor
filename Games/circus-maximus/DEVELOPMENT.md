# Development Guide - Circus Maximus

This document serves as a reference guide for developers and AI agents working on this codebase. Read this first to understand the project structure, game mechanics, and implementation status.

## For Cursor AI Agents

This README serves as a reference guide for AI agents working on this codebase. Read this first to understand the project structure, game mechanics, and implementation status.

---

## Game Overview

**Circus Maximus** is a worker placement board game for 2-4 players set in ancient Rome. Players compete to perform circus acts for Rome, managing resources and gaining favor across three victory tracks: **Empire**, **Population**, and **Church**.

### Core Game Mechanics

1. **5 Phases per Round:**
   - **Bid on Acts**: Players bid coins on act cards (Empire track leader goes first)
   - **Place Workers**: Workers placed at locations (Population track leader goes first)
   - **Buy Resources**: Purchase from supply/demand markets (order by market queue)
   - **Perform Acts**: Resolve act cards, award coins and track movement
   - **Cleanup**: Reset workers/bids, restock markets, check win conditions

2. **Resources:**
   - **Coins**: Currency for bidding and purchasing
   - **Workers**: Placed at locations to perform actions
   - **Mummers, Animals, Slaves**: Purchased from markets for act participation
   - **Prisoners**: Acquired from prison, used in final execution acts

3. **Victory Tracks:**
   - **Empire**: Track favor with the empire
   - **Population**: Track favor with the people
   - **Church**: Track favor with the church
   - Each track ranges from -10 to 20
   - Win condition: Reach 20 on any track OR highest total after 10 rounds

4. **Market System:**
   - Supply/demand pricing: Resources bought left-to-right (cheapest to most expensive)
   - Price tiers: [1,2,3,4,5] for Mummers, [2,3,4,5,6] for Animals, [3,4,5,6,7] for Slaves
   - Restocks during cleanup based on player count

5. **Act Cards:**
   - Players bid coins to participate in acts
   - Acts reward coins and move victory tracks
   - Some acts have winners (random selection), some don't
   - Non-participants may be penalized on tracks
   - Resources may be consumed or returned based on act type

---

## Project Structure

```
circus-maximus/
├── README.md                    # Portfolio-focused README
├── DEVELOPMENT.md               # This file - developer documentation
├── IMPLEMENTATION_STATUS.md     # Detailed implementation status
├── .gitignore                   # Git ignore rules
├── .cursorrules                 # Cursor AI rules for this project
├── index.html                   # Main game page
├── css/
│   └── style.css               # Game styles
├── js/
│   ├── main.js                 # Entry point
│   ├── game/                   # Core game logic
│   │   ├── GameEngine.js      # Main game loop and action execution
│   │   ├── GameState.js        # Game state management (serializable)
│   │   ├── Player.js           # Player class with resources and tracks
│   │   ├── Board.js            # Board and location management
│   │   ├── Phases.js           # Phase management and turn order
│   │   └── Market.js           # Supply/demand market system
│   ├── ai/                     # AI implementation
│   │   ├── AIPlayer.js         # AI player wrapper
│   │   ├── PlaytestEngine.js   # Automated playtesting
│   │   └── strategies/
│   │       └── BasicStrategy.js # AI decision-making
│   ├── ui/                     # User interface
│   │   ├── UIManager.js        # UI coordination
│   │   ├── GameDisplay.js      # Game state rendering
│   │   └── GameControls.js      # User input handling
│   └── utils/                  # Utilities
│       ├── config.js           # All game configuration values
│       └── rules.js            # Rule validation
└── rulebook/
    ├── rulebook.md             # Markdown rulebook (placeholder)
    └── rulebook print.pdf      # PDF rulebook (reference)
```

---

## Key Architecture Decisions

### 1. **Pure Game State**
- `GameState` is serializable (save/load support)
- All game logic in `GameEngine` (no UI dependencies)
- State is immutable from UI perspective (read-only access)

### 2. **Configuration-Driven Design**
- All numeric values in `js/utils/config.js`
- Easy to adjust for playtesting
- Values organized by mechanic/phase

### 3. **Phase-Based System**
- `Phases.js` manages all phase logic
- Turn order changes per phase (track leaders, market queues)
- Phase transitions handled automatically

### 4. **Turn Order Management**
- **Critical**: Never mutate the `players` array directly
- Use `gameState.turnOrder` array (indices into players array)
- Set via `Phases.setTurnOrder()` which returns ordered indices
- Prevents player ID confusion and save/load issues

### 5. **Market System**
- Left-to-right pricing (cheapest first)
- Resources marked as `available: false` when sold
- Restock adds new resources, doesn't reset sold ones
- Restock happens during cleanup phase (before phase end)

### 6. **Worker Placement**
- One worker per location per player (except prison)
- Prison has stock system (unlimited until depleted)
- Workers reset during cleanup phase

---

## Implementation Status

### ✅ Completed

- **Core Framework**: All game classes implemented with basic structure
- **5 Phases**: All phases defined with turn order logic
- **Victory Tracks**: 3 tracks (Empire, Population, Church) fully implemented
- **Market System**: Supply/demand system with restocking
- **Player Resources**: All resource types tracked
- **Locations**: 8 locations defined (prison, arena, temple, palace, forum, training grounds, slums, barracks)
- **Win Conditions**: Track threshold and round limit implemented
- **Bidding System**: Structure in place (needs act card integration)
- **Bug Fixes**: All critical bugs fixed (see commit history)

### ⏳ Pending (Needs Rulebook Data)

- **Act Cards**: ✅ All 15 regular acts + 3 execution acts defined in config.js
- **Location Effects**: Locations defined but effects not implemented
- **Phase End Conditions**: ✅ Fixed - tracks passed players, ends when all pass
- **Market Queue Order**: Queue tracking for buyResources phase (placeholder)
- **Bid Order Tracking**: For performActs phase ordering (placeholder)
- **Final Act Selection**: One of three execution acts per round
- **Success/Failure Mechanics**: Random outcomes for worker actions

### 📋 TODO

1. ~~**Extract act cards from rulebook**~~ - ✅ Done - All acts in config.js
2. **Implement location effects** - What happens when workers are placed
3. ~~**Complete phase end logic**~~ - ✅ Done - Passed player tracking implemented
4. ~~**Implement act resolution**~~ - ✅ Done - ActCardManager.resolveAct() handles all rewards
5. **Add final act selection** - Randomly select one execution act per round
6. **Implement worker action outcomes** - Success/failure mechanics
7. **Complete AI strategy** - Decision-making for all phases
8. **UI Integration** - Connect UI to game engine actions (build interactive buttons/forms)

---

## Important Code Patterns

### Adding a New Location

1. Add to `config.js` under `locations`:
```javascript
newLocation: {
    name: "Location Name",
    maxWorkersPerPlayer: 1,
    type: "action", // or "stock"
    description: "What this location does"
}
```

2. Board.js automatically picks it up from config

### Adding a New Phase Action

1. Add action type to `Phases.getAvailableActions()`
2. Add validation in `Phases.validateAction()`
3. Add execution logic in `GameEngine.executeAction()`

### Modifying Turn Order

**Never do this:**
```javascript
gameState.players.sort(...) // ❌ Mutates player array
```

**Always do this:**
```javascript
gameState.turnOrder = players.map(...).sort(...).map(...) // ✅ Returns indices
```

### Market Restocking

- Called in `GameEngine.endTurn()` before cleanup phase ends
- Only adds new resources, doesn't reset sold ones
- Restock amount = `restockRate * playerCount`

### Worker Cleanup

**Correct order:**
```javascript
p.workers.available += p.workers.placed; // Return workers first
p.workers.placed = 0; // Then reset
```

---

## Configuration File (`js/utils/config.js`)

**All game values are here.** Organized by:
- `setup`: Starting resources, tracks, player limits
- `victoryTracks`: Track min/max values and thresholds
- `phases`: Phase definitions and turn order rules
- `locations`: All worker placement locations
- `resources`: Resource type definitions
- `markets`: Market configuration (prices, supply, restock rates)
- `winConditions`: Victory conditions and tiebreakers
- `limits`: Game limits (workers, bids, etc.)
- `bidding`: Bidding rules

**When adjusting game balance, edit this file.**

---

## Common Pitfalls

1. **Mutating players array**: Use `turnOrder` instead
2. **Market restock timing**: Must be before cleanup phase ends
3. **Worker reset order**: Return to available before resetting placed
4. **Missing Player import**: GameState needs Player import for deserialization
5. **Bidding validation**: Check pass action separately from bid action

---

## Testing the Game

### Local Development (Your Computer)

**⚠️ IMPORTANT: You cannot open `index.html` directly** - ES6 modules require a web server.

**Easiest Options (pick one):**

1. **VS Code Live Server** (Recommended - no installation needed)
   - Install "Live Server" extension
   - Right-click `index.html` → "Open with Live Server"

2. **Double-click `start-server.bat`** (Windows)
   - Tries Python, then Node.js automatically
   - Opens browser automatically

3. **Command Line:**
   ```bash
   python server.py    # If you have Python
   # OR
   node server.js      # If you have Node.js
   ```
   Then open: `http://localhost:8000/index.html`

### Hosting on GitHub Pages

**No server needed!** Just push your code and enable GitHub Pages in repository settings.

1. Push code to GitHub
2. Settings → Pages → Select branch
3. Game is live at `https://yourusername.github.io/repo-name/`

---

## Working with the Rulebook

- **PDF**: `rulebook/rulebook print.pdf` - Original rulebook (reference)
- **Markdown**: `rulebook/rulebook.md` - Editable version (currently placeholder)

**When extracting data:**
- Add to `config.js` with comments linking to rulebook sections
- Update `IMPLEMENTATION_STATUS.md` when completing features
- Keep config values organized by mechanic

---

## Development Notes

- **No build step**: Vanilla JavaScript, edit and refresh
- **No dependencies**: Pure browser APIs
- **Save/Load**: Game state is JSON-serializable
- **AI Ready**: Framework in place, needs game-specific logic
- **Playtesting**: Infrastructure ready for data collection

---

## For Future Agents

**Before making changes:**
1. Read this README completely
2. Check `IMPLEMENTATION_STATUS.md` for current state
3. Review `config.js` to understand game values
4. Check commit history for recent fixes/patterns

**When implementing features:**
1. Follow existing patterns (see "Important Code Patterns")
2. Update config.js for new values
3. Add validation in appropriate classes
4. Test serialization still works
5. Update IMPLEMENTATION_STATUS.md

**When fixing bugs:**
1. Check "Common Pitfalls" section
2. Ensure turn order isn't mutated
3. Verify phase transitions work correctly
4. Test with save/load functionality

---

## License

Personal project - all rights reserved.
