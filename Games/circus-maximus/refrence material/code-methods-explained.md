# Roman Circus Game - Code Methods Explained

## Overview
This is a React component using functional programming with `useState` and `useEffect` hooks to manage game state.

---

## State Management

### `gameState` (main state object)
Holds everything: current phase, round number, players, markets, bids, etc.

### `setGameState`
Updates state using spread operators to create new copies (immutable updates).

---

## Setup Methods

### `setPlayerCount(humanCount, aiCount)`
- Creates player objects with starting resources (50 coins, workers based on player count)
- Initializes bid tracking for each player
- Sets up AI vs human player flags

### `startGame()`
- Validates players exist
- Draws random event card
- Sets phase to 1 (bidding)
- Resets all player pass states

### `restartGame()`
- Resets entire gameState back to initial values
- Returns to setup screen (phase -1)

---

## Phase 1: Bidding Methods

### `selectCard(cardIndex)`
- Updates which act card is currently selected for bidding
- Updates message to show selected card name

### `placeBid()`
- Deducts 1 coin from current player
- Increments their bid count for current act
- Advances to next non-passed player

### `passBid()`
- Marks current player as passed
- When all pass: determines winner (highest bid), assigns won card, moves to next act or phase 2
- Handles progression through Act 1 → Act 2 → Act 3 → Worker phase

---

## Phase 2: Worker Placement Methods

### `getWorkerLocationStatus(location, player)`
- Checks if player already placed at location
- Returns whether they can place there (Prison allows repeats)

### `placeWorker(location)`
- Validates: not passed, location available, has workers, has coins
- Special validation for Guildhall (needs slave + extra coins) and Oracle (needs animal)
- Deducts placement cost
- Adds player to market queues if placing at markets
- Advances to next player

### `passWorker()`
- Marks player as done placing
- When all pass: triggers phase 2.5 (resolution)

---

## Phase 2.5: Worker Resolution

### `resolveWorkers()`
- Loops through each player's placements and applies effects:
  - **Prison**: +1 prisoner from supply
  - **Port/War/Forest**: 50% coin flip - success gives resources, fail kills worker
  - **Town Square/Palace/Pantheon**: +1 to respective track
  - **Guildhall**: Consumes slave + 5 coins, gains new worker
  - **Oracle**: Consumes animal (peek effect not fully implemented)
  - **Markets**: Just returns worker (buying happens in phase 3)
- Builds log of all results
- Transitions to phase 3 or 4 (skips market if no one queued)

---

## Phase 3: Market Methods

### `getMarketPrice(resource)`
- Returns first (cheapest) item price from market array
- Returns 99 if market empty

### `buyResource()`
- Deducts coin cost (first item in market array)
- Adds 1 resource to player
- Removes first item from market (shift)

### `passMarket()`
- Tracks who passed in current market
- When all in queue pass: moves to next market type (slaves → animals → mummers)
- After all markets: transitions to phase 4

---

## Phase 4: Show Execution

### `performAllActs()`
Large method that processes all three acts:

**Act 1 Logic:**
- Musicians: Has 2 mummers? +1 Clergy, +2c. Else -1 Clergy
- Animal Show: Has animals? Most animals wins big. Others get consolation. None = penalty
- Man vs Beast: Has slave + animal? Random kills one, +2 Citizen, +3c. Else -2 Citizen

**Act 2 Logic (competitive with dice):**
- Chariot Race: Participants roll d6, 1st/2nd get rewards, losers lose resources
- Gladiator Duel: Roll d6, winner keeps slave + rewards, losers lose slave
- Grand Battle: Roll d6, winner keeps slaves + rewards, losers lose slaves

**Act 3 Logic:**
- Torture: All prisoners → +1 Citizen each
- Crucifixion: All prisoners → +1 Clergy each
- Execution by Beast: Prisoners + 1 animal → +1 Empire each

Transitions to phase 5 after completion.

---

## Phase 5: Cleanup

### `endGame()`
- Calculates feeding cost (1 coin per resource)
- Calculates income (sum of track positions)
- Clears worker placements and pass states
- Checks for winner (any track ≥ 10)
- Restocks markets (fills up to 2 of each price tier, max 3 restocked)
- Advances round counter
- Returns to phase 0

### `checkForWinner(players)`
- Returns first player with any track ≥ 10
- Returns null if no winner

---

## AI System

### `useEffect` for AI auto-play
Triggers when phase/currentPlayer changes and current player is AI:

**Bidding (phase 1):**
- 40% chance to bid if has coins
- Otherwise passes

**Worker Placement (phase 2):**
- 70% chance to place if has workers + coins
- Filters valid locations (not already used, meets requirements)
- 50% preference for market locations
- Otherwise passes

**Market Buying (phase 3):**
- 60% chance to buy if in queue and can afford
- Otherwise passes

All AI actions have 800ms delay for "thinking" effect.

---

## useEffect Hooks

### Phase 2.5 trigger
```javascript
useEffect(() => {
  if (gameState.phase === 2.5) {
    setTimeout(() => resolveWorkers(), 500);
  }
}, [gameState.phase]);
```
Auto-triggers worker resolution after 500ms.

### Phase 4 trigger
```javascript
useEffect(() => {
  if (gameState.phase === 4) {
    setTimeout(() => performAllActs(), 1000);
  }
}, [gameState.phase]);
```
Auto-triggers act performance after 1 second.

---

## Data Structures

### `actCardsData`
Static object with all act cards organized by act1/act2/act3.

### `eventCards`
Array of event objects with name and effect.

### `workerLocationInfo`
Object mapping location names to descriptions and repeat rules.

### Player Object
```javascript
{
  id, name, color, isAI,
  coins, workers, availableWorkers,
  resources: { slaves, animals, mummers, prisoners },
  tracks: { citizen, empire, clergy },
  wonActs: { act1, act2, act3 },
  workerPlacements: [],
  passedBidding, passedWorkers
}
```

### Market Array
Each market is an array of prices: `[1,1,2,2,3,3,4,4,5,5]`
First element is cheapest available item.
