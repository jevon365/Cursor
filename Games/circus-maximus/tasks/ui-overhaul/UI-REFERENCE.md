# Task 2: UI Overhaul and Development

## Overview

Update the UI to display all game state information and provide a polished, usable interface for players.

---

## Goals

1. **Complete Information Display** — All game state visible to players
2. **Clear Feedback** — Players understand what's happening (coin flips, track changes, etc.)
3. **Usable Interface** — Players can easily take actions
4. **Visual Polish** — Game looks good and is enjoyable to play

---

## Subtasks

### 2.1 Display Resource Supply Counts

**Priority:** High

**Current State:** Resource supply exists in game state but not displayed in UI.

**Tasks:**
- [ ] Add supply display section to game board
- [ ] Show counts for: Mummers, Animals, Slaves, Prisoners, Workers
- [ ] Update display when supply changes
- [ ] Distinguish supply from player resources and market

**Files:**
- `js/ui/GameDisplay.js` — Add supply rendering
- `css/style.css` — Style supply display
- `index.html` — Add supply container if needed

---

### 2.2 Show Coin Flip Results

**Priority:** High

**Current State:** Coin flips happen in game logic but results not shown to player.

**Tasks:**
- [ ] Create coin flip animation/display component
- [ ] Show result (Heads/Tails) with outcome description
- [ ] Display for Port, War, Forest locations
- [ ] Include flavor text (e.g., "Your worker enters the forest and is never seen again")
- [ ] Pause for player to see result before continuing

**Files:**
- `js/ui/GameDisplay.js` — Coin flip display
- `css/style.css` — Coin flip animation/styling

---

### 2.3 Display Temporary Track Movements

**Priority:** Medium

**Current State:** Temporary track boosts (Town Square, Palace, Pantheon) tracked but not shown.

**Tasks:**
- [ ] Show indicator on track when temporary boost active
- [ ] Tooltip or label showing "Temporary +1"
- [ ] Different visual from permanent track position
- [ ] Clear indicator when boost expires

**Files:**
- `js/ui/GameDisplay.js` — Track display updates
- `css/style.css` — Temporary boost styling

---

### 2.4 Show Market Queue Order

**Priority:** Medium

**Current State:** Market queues tracked but not displayed during Buy Resources phase.

**Tasks:**
- [ ] Display queue order for each market
- [ ] Show which player is next to buy
- [ ] Highlight current buyer
- [ ] Show "No worker in market" for players who can't buy

**Files:**
- `js/ui/GameDisplay.js` — Market queue display
- `css/style.css` — Queue styling

---

### 2.5 Display Oracle Peeked Event Card

**Priority:** Low

**Current State:** Oracle lets player peek at event card but result not displayed.

**Tasks:**
- [ ] Show peeked event card to player who used Oracle
- [ ] Only visible to that player (not opponents)
- [ ] Clear after viewing
- [ ] Include "Oracle reveals..." flavor text

**Files:**
- `js/ui/GameDisplay.js` — Event card display
- `css/style.css` — Card styling

---

### 2.6 Game Instructions/Help

**Priority:** Low

**Tasks:**
- [ ] Add help button/panel
- [ ] Explain each phase
- [ ] Explain each location
- [ ] Explain victory conditions
- [ ] Tooltips on hover for game elements

**Files:**
- `js/ui/UIManager.js` — Help panel logic
- `index.html` — Help content
- `css/style.css` — Help styling

---

### 2.7 Visual Polish

**Priority:** Low (after functionality)

**Tasks:**
- [ ] Consistent color scheme
- [ ] Clear typography
- [ ] Responsive layout
- [ ] Smooth transitions/animations
- [ ] Loading states
- [ ] Error messages styled nicely

**Files:**
- `css/style.css` — All styling
- `index.html` — Structure updates if needed

---

## Key Files

| File | Purpose |
|------|---------|
| `js/ui/GameDisplay.js` | Main game rendering |
| `js/ui/GameControls.js` | User input handling |
| `js/ui/UIManager.js` | UI coordination |
| `css/style.css` | All styling |
| `index.html` | HTML structure |

---

## Implementation Order

1. **Resource Supply Display** — Critical for gameplay understanding
2. **Coin Flip Results** — Players need to see outcomes
3. **Market Queue Order** — Important for Buy Resources phase
4. **Temporary Track Movements** — Helps players understand their position
5. **Oracle Event Card** — Lower priority feature
6. **Help/Instructions** — Polish item
7. **Visual Polish** — Final pass

---

## Notes for Agents

- Keep UI simple and clear (MVP first)
- Use existing CSS patterns where possible
- Test on different screen sizes
- Ensure all state changes trigger UI updates
- Don't break existing functionality when adding features

---

## Success Criteria

- [ ] All game state information visible to players
- [ ] Coin flip results clearly displayed
- [ ] Market queue order shown during Buy Resources
- [ ] Temporary track boosts indicated
- [ ] Oracle peeked card shown to player
- [ ] Help/instructions available
- [ ] UI looks polished and professional
