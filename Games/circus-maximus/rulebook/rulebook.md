# Circus Maximus - Rulebook

A worker placement board game for 2-4 players set in ancient Rome. Players compete to perform circus acts for Rome, managing resources and gaining favor across three victory tracks: **Empire**, **Population**, and **Church**.

---

## Game Setup

### Starting Resources
Each player begins the game with:
- **15 coins** (updated from playtesting - previously 5)
- **5 workers** (updated from playtesting - previously 3)
- **0 mummers**
- **0 animals**
- **0 slaves**
- **0 prisoners**

### Starting Victory Tracks
Each player begins with:
- **Empire**: 3
- **Population**: 3
- **Church**: 3

Track values range from -10 to 15 (win threshold).

---

## Game Phases

Each round consists of 5 phases, played in order:

### 1. Bid on Acts
- Players bid coins on act cards they want to perform
- **Turn Order**: Leader on Empire track goes first
- Players can bid multiple coins or pass (first player must bid)

### 2. Place Workers
- Players place workers at locations to perform actions
- **Turn Order**: Leader on Population track goes first
- Cost: 1 coin per worker deployed

### 3. Buy Resources
- Players purchase resources from markets using supply/demand pricing
- **Turn Order**: Based on market queue (when workers were placed at markets)
- Prices increase left-to-right (cheapest first)

### 4. Perform Acts
- Resolve act cards, award coins and track movement
- **Turn Order**: Based on bid order
- Resources may be consumed or returned based on act type

### 5. Cleanup and Reset
- Reset workers and bids
- Restock markets
- Check win conditions
- No player actions

---

## Victory Tracks

Three victory tracks determine the winner:

- **Empire**: Favor with the empire
- **Population**: Favor with the people
- **Church**: Favor with the church

Each track ranges from -10 to 15.

### Win Conditions
- **Track Victory**: Reach 15 on any track (immediate win)
- **Round Limit**: After 10 rounds, player with highest total across all tracks wins
- **Tiebreaker**: Player with most total resources wins

---

## Resources

- **Coins**: Currency for bidding and purchasing
- **Workers**: Placed at locations to perform actions
- **Mummers**: Performers for circus acts
- **Animals**: Animals for circus acts
- **Slaves**: Slaves for circus acts
- **Prisoners**: Used in final execution acts

---

## Market System

Supply/demand pricing system:
- Resources bought left-to-right (cheapest to most expensive)
- Price tiers:
  - **Mummers**: [1, 2, 3, 4, 5]
  - **Animals**: [2, 3, 4, 5, 6]
  - **Slaves**: [3, 4, 5, 6, 7]
- Markets restock during cleanup phase based on player count

---

## Worker Placement Locations

The game board features 13 locations where players can place workers during the **Place Workers** phase. Most locations are available from the start of the game, though Gamblers Den is not available in the MVP.

### Initial Spaces (Available from Game Start)

1. **Port** (Action Location)
   - **Type**: Action (Coin Flip)
   - **Max Workers**: 1 total (first come, first served)
   - **Effect**: Your worker adventures to Greece in hope of finding mummers to perform in the circus
   - **Coin Flip**:
     - **Heads**: Take 2 mummers from the supply (not the market). If there are less than 2 in the supply, take what's left. The journey is successful.
     - **Tails**: Return your worker to the supply (you do not have to pay the worker cost). The space may be taken again if the worker dies. A tragic accident at sea kills your worker before they make it to Greece.
   - **Worker Cost**: 1 coin per worker deployed (if successful)

2. **War** (Action Location)
   - **Type**: Action (Coin Flip)
   - **Max Workers**: 1 total (first come, first served)
   - **Effect**: Your worker joins the legion headed for war in hope of capturing slaves to fight in the circus
   - **Coin Flip**:
     - **Heads**: Take 2 slaves from the supply (not the market). If there are less than 2 in the supply, take what's left. The worker is triumphant.
     - **Tails**: Return your worker to the supply (you do not have to pay the worker cost). The space may be taken again if the worker dies. Your worker dies valiantly in the field of battle.
   - **Worker Cost**: 1 coin per worker deployed (if successful)

3. **Gamblers Den** (Action Location)
   - **Type**: Action (Betting - Not Available in MVP)
   - **Max Workers**: 1 total
   - **Effect**: You feel confident in the circus to come, you decide to play the odds
   - **Note**: Not available in MVP version

4. **Prison** (Action Location)
   - **Type**: Action
   - **Max Workers**: 2 per player (e.g., 4 workers in 2-player game, 8 workers in 4-player game). Players may place multiple workers here per turn.
   - **Effect**: Your worker goes to the prison to retrieve a prisoner to be put to death in the final act of the circus
   - **Result**: Gain 1 prisoner from the supply. You may take this action multiple times in a turn. Not all prisoners must be spent each round.
   - **Worker Cost**: 1 coin per worker deployed

5. **Mummers Market** (Market Location)
   - **Type**: Market Queue
   - **Max Workers**: 1 per player
   - **Effect**: You wish to replenish your stock for the upcoming circus. You send your worker to hold your place in line so you can get the best quality.
   - **Rules**: You may only have one worker in each market. If you do not have a worker in a market, then you may not buy any of that resource. You are not required to buy a resource if you are in a market.
   - **Worker Cost**: 1 coin per worker deployed

6. **Animals Market** (Market Location)
   - **Type**: Market Queue
   - **Max Workers**: 1 per player
   - **Effect**: Same as Mummers Market - hold place in line for buying animals
   - **Worker Cost**: 1 coin per worker deployed

7. **Slaves Market** (Market Location)
   - **Type**: Market Queue
   - **Max Workers**: 1 per player
   - **Effect**: Same as Mummers Market - hold place in line for buying slaves
   - **Worker Cost**: 1 coin per worker deployed

8. **Forest** (Action Location)
   - **Type**: Action (Coin Flip)
   - **Max Workers**: 1 total (first come, first served)
   - **Effect**: Your worker goes into the forest in hope of capturing a wild beast to perform in the circus
   - **Coin Flip**:
     - **Heads**: Take 2 animals from the supply (not the market). If there are less than 2 in the supply, take what's left. The hunt is successful.
     - **Tails**: Return your worker to the supply (you do not have to pay the worker cost). The space may be taken again if the worker dies. Your worker enters the forest and is never seen again.
   - **Worker Cost**: 1 coin per worker deployed (if successful)

9. **Town Square** (Action Location)
   - **Type**: Action (Track Movement)
   - **Max Workers**: 1 total (first come, first served)
   - **Effect**: Your worker goes to the town square to talk to the citizens
   - **Result**: Move your marker up one space on the Population (Citizen) track for this turn only. You will get paid at the increased rate.
   - **Worker Cost**: 1 coin per worker deployed

10. **Palace** (Action Location)
    - **Type**: Action (Track Movement)
    - **Max Workers**: 1 total (first come, first served)
    - **Effect**: Your worker goes to the Palace to speak to the Caesar
    - **Result**: Move your marker up one space on the Empire track for this turn only. You will get paid at the increased rate. You will also go first next round if this puts you in first place on the Empire track.
    - **Worker Cost**: 1 coin per worker deployed

11. **Pantheon** (Action Location)
    - **Type**: Action (Track Movement)
    - **Max Workers**: 1 total (first come, first served)
    - **Effect**: Your worker goes to the Pantheon to talk to the gods
    - **Result**: Move your marker up one space on the Church (Clergy) track for this turn only. You will get paid at the increased rate.
    - **Worker Cost**: 1 coin per worker deployed

12. **Guildhall** (Action Location)
    - **Type**: Action (Resource Conversion)
    - **Max Workers**: 1 total (first come, first served)
    - **Effect**: Your slave has served you loyally for years. It's time to free the slave, with a little cash in the slave's pocket.
    - **Result**: Return one slave to the resource supply and pay 5 coins, then add one worker of your color from the supply to your pool of workers. If you have all the workers from the supply, you may not take this action.
    - **Worker Cost**: 1 coin per worker deployed (plus 5 coins for freeing the slave)

13. **Oracle** (Action Location - Not Available in MVP)
    - **Type**: Action (Information - Not Available in MVP)
    - **Max Workers**: 1 total (first come, first served)
    - **Effect**: Your worker travels to the Oracle wishing to know the future. The oracle sacrifices a sheep and reads the entrails.
    - **Result**: Return one animal to the supply and look at the top card of the event deck. If you have no animals, you cannot take this action.
    - **Worker Cost**: 1 coin per worker deployed (plus 1 animal)
    - **Note**: Not available in MVP version

### Location Rules

- **Action Locations**: Most action locations allow only 1 total worker at the location (first come, first served). This includes: Port, War, Forest, Town Square, Palace, Pantheon, and Guildhall. Oracle and Gamblers Den are not available in MVP.
- **Prison Exception**: Prison allows 2 workers per player (e.g., 4 workers in a 2-player game, 8 workers in a 4-player game). Players may place multiple workers here in a single turn.
- **Market Locations**: Each market (Mummers, Animals, Slaves) allows 1 worker per player. Workers in markets hold your place in the buying queue during the Buy Resources phase.
- **Worker Cost**: All workers cost 1 coin to deploy (base cost), though event cards may modify this cost.
- **Worker Death**: Some locations (Port, War, Forest) can result in worker death on coin flip tails. Dead workers return to the supply, and the location becomes available again (may be taken by any player).
- **Resource Supply**: Separate from markets, there is a resource supply from which some locations draw resources (Port, War, Forest, Prison, Guildhall, Oracle).
- **Disabled Locations**: Event cards may disable certain locations for a round, preventing worker placement. Gamblers Den is not available in MVP.

### Worker Placement Phase

During the **Place Workers** phase:
- **Turn Order**: Leader on Population track goes first
- **Cost**: 1 coin per worker deployed (base cost, may be modified by events)
- **Limits**: Most action locations can only have 1 worker total at the location (first come, first served). Markets allow 1 worker per player. Prison allows multiple workers per player (up to 2 per player based on player count).
- **Available Workers**: Players start with 5 workers and can gain more through various game effects (e.g., Guildhall)

---

## Act Cards

### Regular Acts (15 total, 5 displayed per round)
Acts are categorized by their primary track:

#### Church Track Acts (5 acts)

1. **Choral Performance**
   - **Resource Cost**: 1 mummer
   - **Tracks**: Church +1, Population +1
   - **Winner**: No (all participants get rewards)
   - **Resources**: Returned (not consumed)
   - **Coin Reward**: None
   - **Non-Participant Penalty**: Church -1

2. **Pageant** (Religious Pageants)
   - **Resource Cost**: 2 mummers
   - **Tracks**: Church +2
   - **Winner**: No (all participants get rewards)
   - **Resources**: Returned (not consumed)
   - **Coin Reward**: 3 coins
   - **Non-Participant Penalty**: Church -1

3. **Procession of Martyrs**
   - **Resource Cost**: 1 mummer, 1 slave
   - **Tracks**: Church +3, Population -1
   - **Winner**: No (all participants get rewards)
   - **Resources**: Slaves consumed (die in reenactment), Mummers returned
   - **Coin Reward**: 4 coins
   - **Non-Participant Penalty**: Church -2

4. **Hymn Competition**
   - **Resource Cost**: 1 mummer
   - **Tracks**: Church +2
   - **Winner**: Yes (only winner gets track advancement)
   - **Resources**: Returned (not consumed)
   - **Coin Reward**: Winner gets 4 coins, Losers get 2 coins
   - **Non-Participant Penalty**: Church -1

5. **Sacred Festival** (Sacred Music Festival)
   - **Resource Cost**: 2 mummers
   - **Coin Cost**: 1 coin (paid during act performance)
   - **Tracks**: Church +3, Population +1
   - **Winner**: No (all participants get rewards)
   - **Resources**: Returned (not consumed)
   - **Coin Reward**: 4 coins
   - **Non-Participant Penalty**: Church -2

#### Population Track Acts (5 acts)

1. **Gladiator Combat**
   - **Resource Cost**: 1 slave
   - **Tracks**: Population +2
   - **Winner**: Yes (only winner gets track advancement)
   - **Resources**: Loser's slaves die, winner's slaves return
   - **Coin Reward**: 3 coins (winner gets track advancement + coins, losers get coins only)
   - **Non-Participant Penalty**: Population -2

2. **Bestiarii vs. Beasts**
   - **Resource Cost**: 1 animal, 1 slave
   - **Tracks**: Population +3, Church -1
   - **Winner**: No (all participants get rewards)
   - **Resources**: Only slaves consumed, animals returned
   - **Coin Reward**: 5 coins
   - **Non-Participant Penalty**: Population -2

3. **Venatio (Animal Hunt)**
   - **Resource Cost**: 2 animals
   - **Tracks**: Population +2
   - **Winner**: No (all participants get rewards)
   - **Resources**: Animals killed (consumed)
   - **Coin Reward**: 4 coins
   - **Non-Participant Penalty**: Population -1

4. **Animal Feeding**
   - **Resource Cost**: 2 animals
   - **Coin Cost**: 2 coins (paid during act performance)
   - **Tracks**: Population +2, Church +1
   - **Winner**: No (all participants get rewards)
   - **Resources**: Returned (not consumed)
   - **Coin Reward**: 5 coins
   - **Non-Participant Penalty**: Population -2

5. **Slave Battle Royale**
   - **Resource Cost**: 3 slaves
   - **Tracks**: Population +3, Empire +2
   - **Winner**: Yes (only winner gets track advancement)
   - **Resources**: Loser's slaves die (all 3), winner's return
   - **Coin Reward**: 7 coins (winner gets track advancement + coins, losers get coins only)
   - **Non-Participant Penalty**: Population -2

#### Empire Track Acts (5 acts)

1. **Chariot Race**
   - **Resource Cost**: 2 animals, 1 mummer
   - **Tracks**: Empire +3, Population +1
   - **Winner**: Yes (only winner gets track advancement)
   - **Resources**: Returned (not consumed)
   - **Coin Reward**: 5 coins (winner gets track advancement + coins, losers also get coins)
   - **Non-Participant Penalty**: Empire -1

2. **Ludi Militaris (War Games)**
   - **Resource Cost**: 2 slaves
   - **Tracks**: Empire +3, Population +1
   - **Winner**: Yes (only winner gets track advancement)
   - **Resources**: Loser's slaves die, winner's return
   - **Coin Reward**: 7 coins (winner gets track advancement + coins, losers also get coins)
   - **Non-Participant Penalty**: Empire -2

3. **Triumph Parade**
   - **Resource Cost**: 2 mummers, 1 animal
   - **Tracks**: Empire +2, Church +1
   - **Winner**: No (all participants get rewards)
   - **Resources**: Returned (not consumed)
   - **Coin Reward**: 3 coins
   - **Non-Participant Penalty**: Empire -1

4. **Cavalry Display**
   - **Resource Cost**: 2 animals
   - **Tracks**: Empire +1, Church +1
   - **Winner**: Yes (winner determined by most total animals)
   - **Resources**: Returned (not consumed)
   - **Coin Reward**: 1 coin per animal (for all participants)
   - **Non-Participant Penalty**: Empire -1

5. **Naumachia (Naval Battle)**
   - **Resource Cost**: 3 slaves
   - **Coin Cost**: 3 coins (paid during act performance)
   - **Tracks**: Empire +4, Population +2
   - **Winner**: Yes (only winner gets track advancement)
   - **Resources**: Loser's slaves die, winner's return
   - **Coin Reward**: 8 coins (all participants receive coins regardless of victory)
   - **Non-Participant Penalty**: Empire -2, Population -1

### Final Execution Acts (3 total, always available)

All execution acts require 1 prisoner and consume the prisoner when performed. They provide no coin rewards.

1. **Public Torture**
   - **Resource Cost**: 1 prisoner
   - **Tracks**: Population +1
   - **Winner**: No (all participants get rewards)
   - **Resources**: Prisoner consumed
   - **Coin Reward**: None
   - **Non-Participant Penalty**: None

2. **Military Execution**
   - **Resource Cost**: 1 prisoner
   - **Tracks**: Empire +1
   - **Winner**: No (all participants get rewards)
   - **Resources**: Prisoner consumed
   - **Coin Reward**: None
   - **Non-Participant Penalty**: None

3. **Crucifixion**
   - **Resource Cost**: 1 prisoner
   - **Tracks**: Church +1
   - **Winner**: No (all participants get rewards)
   - **Resources**: Prisoner consumed
   - **Coin Reward**: None
   - **Non-Participant Penalty**: None

---

## Event Cards

Event cards are drawn at the start of each round (before phases begin) and affect that round. The deck contains various events that modify gameplay.

### Negative Events

1. **The Plague Strikes**
   - Population track cannot be moved this round
   - Town Square location is disabled this round

2. **Animals Escape**
   - Removes 3 animals from the market

3. **Caesar Leaves for War**
   - Empire track cannot be moved this round
   - Palace location is disabled this round

4. **Pirates Grow Brave**
   - Each player pays 5 coins (or loses 1 resource of their choice if no coins)

5. **Slaves Revolt**
   - Removes 3 slaves from the market

6. **Jupiter is Angry**
   - Church track cannot be moved this round
   - Pantheon location is disabled this round

### Positive Events

7. **New Lands Discovered**
   - Adds 1 animal per player to the market (e.g., 2 animals in 2-player game, 4 animals in 4-player game)

8. **Traveling Troop**
   - Adds 1 mummer per player to the market (e.g., 2 mummers in 2-player game, 4 mummers in 4-player game)

9. **Slave Ship Arrives**
   - Adds 1 slave per player to the market (e.g., 2 slaves in 2-player game, 4 slaves in 4-player game)

10. **Victory Celebration**
    - All players gain 2 coins
    - All players gain +1 Empire track

11. **Festival Declared**
    - All players gain 1 coin
    - All players gain +1 Population track
    - Adds 2 mummers to the market

12. **Imperial Bounty**
    - Each player gains coins equal to their Empire track position (minimum 1 coin)

13. **Religious Offering**
    - All players gain +1 Church track
    - Adds 2 mummers to the market

14. **Economic Boom**
    - Adds 2 resources to each market (mummers, animals, slaves)
    - All players gain 1 coin

### Strategic/Neutral Events

15. **New Age**
    - Shuffle discard pile into event deck, then draw another event card (resolved immediately)

16. **Market Crash**
    - All market prices reduced by 1 this round (minimum 1 coin)

17. **Labor Shortage**
    - Workers cost +1 coin to deploy this round

---

## Playtesting Updates

This section documents rule changes made during playtesting:

### Update 1: Starting Resources
- **Date**: Initial playtesting
- **Change**: Starting coins increased from 5 to 15, starting workers increased from 3 to 5
- **Reason**: To provide players with more strategic options and reduce early-game resource constraints

---

## Notes for Development

- All game values are stored in `js/utils/config.js` for easy adjustment
- This rulebook should be updated whenever playtesting reveals balance issues
- Configuration changes should be documented here with reasoning
