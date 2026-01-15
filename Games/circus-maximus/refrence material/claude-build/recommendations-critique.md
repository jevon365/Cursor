# Critique of Recommendations

## What the Recommendations Got Wrong

### 1. Market System - Major Oversight

**The Problem:** The recommendations suggest keeping the project's MarketManager class approach, but the reference TSX market is actually simpler AND works better.

**Reference Market (works well):**
```javascript
market: { 
    slaves: [1,1,2,2,3,3,4,4,5,5],  // Simple array of prices
    animals: [1,1,2,2,3,3,4,4,5,5],
    mummers: [1,1,2,2,3,3,4,4,5,5] 
}

// Buy = just shift the first element
const buyResource = () => {
    const price = market[resource][0];
    player.coins -= price;
    player.resources[resource] += 1;
    market[resource].shift();  // Remove cheapest item
};
```

**Project Market (overcomplicated):**
- MarketManager class with multiple methods
- Separate `available` flags per item
- Complex restock logic
- Price modifiers layer

**Better Recommendation:** Port the reference's simple array-based market directly. The array-shift pattern is:
- Easier to understand
- Naturally handles supply/demand (cheapest first)
- Trivial to restock (push new prices to array)
- No state tracking bugs

---

### 2. Tiered Pricing Recommendation - Questionable

**Original Recommendation:** Keep rulebook's tiered prices (Mummers [1-5], Animals [2-6], Slaves [3-7])

**Critique:** This adds complexity without clear gameplay benefit. The reference's uniform pricing ([1-5] for all) is:
- Simpler to balance
- Easier for players to understand
- Still has supply/demand dynamics

**Revised Recommendation:** Start with uniform pricing, add tiers later if playtesting shows need.

---

### 3. Feeding Costs + Income - Missing Details

**Original Recommendation:** Add feeding costs (1 coin per resource) and income (sum of tracks)

**Critique:** This creates a potential death spiral:
- Low tracks = low income
- Low income = can't buy resources
- Can't participate in acts = tracks go lower
- Game becomes unfun for losing players

**Revised Recommendation:** 
- Minimum income floor (e.g., 3 coins regardless of tracks)
- OR feeding costs only apply to resources over a threshold (e.g., first 3 resources free)

---

### 4. Worker Cost Scaling - Over-engineered

**Original Recommendation:** Port worker cost scaling (cost increases if any track > 5)

**Critique:** This is a balancing mechanism for the reference's 10-point win threshold. With the project's 15-point threshold, this may not be needed. It also:
- Adds mental overhead for players
- Makes the leader feel punished rather than rewarded
- Is harder to communicate in UI

**Revised Recommendation:** Skip this for MVP. Add later if playtesting shows runaway leader problem.

---

### 5. Dice Roll Competitions - Underspecified

**Original Recommendation:** Add dice rolls for Act 2 competitions

**Critique:** The recommendation shows the pattern but doesn't address:
- What happens on ties?
- Do higher bids give dice bonuses?
- Are resources consumed before or after the roll?

**Reference Answers:**
- Ties: All tied players win
- Bids: No bonus (just for selecting the act)
- Resources: Losers lose resources, winners keep them

**Revised Recommendation:** Port the full logic including tie handling.

---

### 6. Message System - Good but Incomplete

**Original Recommendation:** Add message system with history

**Critique:** Good idea, but should also include:
- Message types (info, warning, success, error)
- Player-specific messages (for secrets like Oracle peek)
- Action log for debugging/replay

---

## What the Recommendations Got Right

1. **Keep immediate worker resolution** - Batch resolution is confusing
2. **Keep Phases class structure** - Config-driven is better long-term
3. **Port random AI for testing** - Fast way to playtest
4. **Add message system** - Essential for UX
5. **Priority order** - Message system first is correct

---

## Revised Priority Order

1. **Replace MarketManager with array-based market** - Fixes broken system
2. **Message System** - UX improvement
3. **Random AI Strategy** - Enables playtesting
4. **Dice Roll Competitions** - Core mechanic
5. **Feeding/Income (with floor)** - Economy balance
6. ~~Worker Cost Scaling~~ - Defer

---

## Market Implementation to Port

Replace the project's MarketManager with this simpler approach:

```javascript
// In GameState or separate simple class
class SimpleMarket {
    constructor() {
        this.markets = {
            mummers: [1, 1, 2, 2, 3, 3, 4, 4, 5, 5],
            animals: [1, 1, 2, 2, 3, 3, 4, 4, 5, 5],
            slaves:  [1, 1, 2, 2, 3, 3, 4, 4, 5, 5]
        };
    }
    
    getPrice(resourceType) {
        const market = this.markets[resourceType];
        return market.length > 0 ? market[0] : null; // null = sold out
    }
    
    buy(resourceType, player) {
        const price = this.getPrice(resourceType);
        if (price === null) return { success: false, error: 'Sold out' };
        if (player.coins < price) return { success: false, error: 'Insufficient coins' };
        
        player.coins -= price;
        player.resources[resourceType] += 1;
        this.markets[resourceType].shift();
        
        return { success: true, price };
    }
    
    restock() {
        // Fill to 2 of each price tier, max 3 new items per market
        ['mummers', 'animals', 'slaves'].forEach(type => {
            let added = 0;
            for (let price = 5; price >= 1 && added < 3; price--) {
                const currentCount = this.markets[type].filter(p => p === price).length;
                const toAdd = Math.min(2 - currentCount, 3 - added);
                for (let i = 0; i < toAdd; i++) {
                    // Insert in sorted position
                    const insertIdx = this.markets[type].findIndex(p => p > price);
                    if (insertIdx === -1) {
                        this.markets[type].push(price);
                    } else {
                        this.markets[type].splice(insertIdx, 0, price);
                    }
                    added++;
                }
            }
        });
    }
    
    serialize() {
        return JSON.stringify(this.markets);
    }
    
    deserialize(data) {
        this.markets = JSON.parse(data);
    }
}
```

This is ~50 lines vs the current MarketManager which is much larger and has bugs.

---

## Implementation To-Do List

### Batch 1: Replace Market System
**Files:** `js/game/Market.js`, `js/game/GameEngine.js`
**Reference:** `claude-build/roman-circus-game.tsx` lines 33, 71-75, 489-506, 744-757
**Tasks:**
- [ ] Replace MarketManager class with SimpleMarket (array-based)
- [ ] Update GameEngine.executeAction() for 'buyResource' to use new market
- [ ] Update market restock in cleanup phase
- [ ] Test buy/restock cycle works

---

### Batch 2: Add Message System
**Files:** `js/game/GameState.js`, `js/game/GameEngine.js`
**Reference:** `claude-build/roman-circus-game.tsx` lines 38, 247-248, 274, 355
**Tasks:**
- [ ] Add `message` and `messageHistory` to GameState
- [ ] Add `setMessage(msg)` method to GameState
- [ ] Update GameEngine.executeAction() to set messages after actions
- [ ] Update serialize/deserialize to include messages

---

### Batch 3: Random AI Strategy
**Files:** `js/ai/strategies/BasicStrategy.js`
**Reference:** `claude-build/roman-circus-game.tsx` lines 98-163, `claude-build/recommendations.md` AI section
**Tasks:**
- [ ] Add `decideBid()` - 40% chance to bid if has coins
- [ ] Add `decideWorkerPlacement()` - 70% chance, filter valid locations
- [ ] Add `decideMarketPurchase()` - 60% chance if in queue and can afford
- [ ] Add helper `getValidLocations(gameState, player)`

---

### Batch 4: Dice Roll Competitions
**Files:** `js/game/ActCardManager.js`
**Reference:** `claude-build/roman-circus-game.tsx` lines 591-683, `claude-build/game-summary.md` Act 2 section
**Tasks:**
- [ ] Add `resolveCompetitionAct(act, gameState)` method
- [ ] Implement d6 rolls for participants
- [ ] Handle ties (all tied players win)
- [ ] Award 1st/2nd place, penalize losers (resources lost)

---

### Batch 5: Feeding Costs and Income
**Files:** `js/game/Phases.js`, `js/utils/config.js`
**Reference:** `claude-build/roman-circus-game.tsx` lines 731-738
**Tasks:**
- [ ] Add feeding cost calculation (1 coin per resource) to cleanup
- [ ] Add income calculation (sum of tracks) with minimum floor of 3
- [ ] Add `feedingCostPerResource` and `minimumIncome` to config.js
- [ ] Update Phases.onPhaseEnd() for 'cleanup' case

---

### Batch 6: UI Message Display
**Files:** `js/ui/GameDisplay.js`, `index.html`
**Reference:** `claude-build/roman-circus-game.tsx` lines 933-936
**Tasks:**
- [ ] Add message display element to index.html
- [ ] Update GameDisplay to render current message
- [ ] Style message area (info/warning/error colors optional)
- [ ] Show message history in collapsible panel (optional)
