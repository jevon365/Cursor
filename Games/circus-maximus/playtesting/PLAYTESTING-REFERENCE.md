# Task 3: Playtesting and Adjusting Values

## Overview

Run playtests to identify balance issues and adjust game values in `config.js` to create a fun, balanced experience.

---

## Goals

1. **Identify Balance Issues** — Find values that are too strong/weak
2. **Adjust Config Values** — Tune numbers for better gameplay
3. **Document Changes** — Track what was changed and why
4. **Verify Fun Factor** — Game is enjoyable to play

---

## Subtasks

### 3.1 Automated Playtesting Setup

**Priority:** High

**Current State:** `PlaytestEngine.js` has framework but needs game-specific implementation.

**Tasks:**
- [ ] Implement automated game runner
- [ ] Run AI vs AI games
- [ ] Collect statistics (game length, winner distribution, resource usage)
- [ ] Export data for analysis

**Files:**
- `js/ai/PlaytestEngine.js` — Automated testing
- `js/utils/config.js` — Values to adjust

---

### 3.2 Balance Metrics to Track

**Priority:** High

**Metrics:**
- [ ] Average game length (rounds)
- [ ] Win rate by starting position
- [ ] Which victory track wins most often
- [ ] Average coins at game end
- [ ] Average resources used per game
- [ ] Location usage frequency
- [ ] Act card win rates
- [ ] Worker death rate (Port, War, Forest)

---

### 3.3 Values to Potentially Adjust

**Priority:** Medium

**Starting Resources:**
- `setup.startingResources.coins` — Currently 15
- `setup.startingResources.workers` — Currently 5
- `setup.startingTracks.*` — Currently 3 each

**Victory Conditions:**
- `victoryTracks.*.max` — Win threshold, currently 15
- `winConditions.roundLimit.maxRounds` — Currently 10

**Market Pricing:**
- `markets.mummers.priceTiers` — [1,2,3,4,5]
- `markets.animals.priceTiers` — [2,3,4,5,6]
- `markets.slaves.priceTiers` — [3,4,5,6,7]
- `markets.*.restockRate` — How many resources added per cleanup

**Resource Supply:**
- `setup.resourceSupply.*` — Starting supply counts

**Location Effects:**
- Coin flip success rate (currently 50/50)
- Resources gained from successful coin flips (currently 2)
- Guildhall cost (currently 5 coins + 1 slave)

---

### 3.4 Manual Playtesting

**Priority:** Medium

**Tasks:**
- [ ] Play full games manually
- [ ] Note frustrating moments
- [ ] Note exciting moments
- [ ] Identify dominant strategies
- [ ] Identify useless strategies
- [ ] Get feedback from other players

---

### 3.5 Document Changes

**Priority:** High

**Tasks:**
- [ ] Update `rulebook/rulebook.md` with changes
- [ ] Add entry to "Playtesting Updates" section
- [ ] Include date, change, and reasoning
- [ ] Update `config.js` comments

**Example Entry:**
```markdown
### Update 2: Market Pricing
- **Date**: [Date]
- **Change**: Increased slave prices from [3,4,5,6,7] to [4,5,6,7,8]
- **Reason**: Slaves were too easy to acquire, making gladiator acts dominant
```

---

### 3.6 Edge Case Testing

**Priority:** Low

**Scenarios to Test:**
- [ ] Supply runs out (Prison, Port, War, Forest, Guildhall)
- [ ] Player has no coins
- [ ] Player has no workers
- [ ] All players pass immediately
- [ ] Track reaches maximum/minimum
- [ ] Save/load mid-game
- [ ] 2-player vs 4-player balance

---

## Key Files

| File | Purpose |
|------|---------|
| `js/utils/config.js` | All game values |
| `js/ai/PlaytestEngine.js` | Automated testing |
| `rulebook/rulebook.md` | Document changes |
| `IMPLEMENTATION_STATUS.md` | Track progress |

---

## Implementation Order

1. **Automated Playtesting** — Get data collection working
2. **Run Initial Tests** — Gather baseline data
3. **Identify Issues** — Analyze data for problems
4. **Adjust Values** — Make targeted changes
5. **Re-test** — Verify changes helped
6. **Document** — Record all changes

---

## Notes for Agents

- **Always document changes** in `rulebook/rulebook.md`
- Make **one change at a time** to isolate effects
- Use **automated testing** for quick iteration
- **Manual testing** catches things automation misses
- Keep config comments updated with reasoning
- Previous change: Starting coins 5→15, workers 3→5 (early game too constrained)

---

## Success Criteria

- [ ] Automated playtesting runs successfully
- [ ] Game length is reasonable (not too short/long)
- [ ] All victory tracks are viable paths to win
- [ ] No dominant strategy exists
- [ ] Resources feel valuable but not impossible to get
- [ ] Worker death rate feels fair (risky but rewarding)
- [ ] All changes documented in rulebook
