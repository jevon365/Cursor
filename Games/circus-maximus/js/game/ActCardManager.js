/**
 * ActCardManager - Manages act cards, bidding, and resolution
 */

export class ActCardManager {
    constructor(config) {
        this.config = config;
        this.availableActs = []; // 5 regular acts displayed
        this.actPool = []; // All 15 regular acts
        this.selectedActs = []; // Acts that received bids
        this.bids = {}; // { actId: [{ playerId, coins }] }
        this.mandatoryExecutionAct = null; // Randomly selected execution act for the round
        this.initializeActPool();
    }

    /**
     * Initialize act pool from config
     */
    initializeActPool() {
        const actCards = this.config.actCards;
        this.actPool = Object.keys(actCards).map(id => ({
            id: id,
            ...actCards[id]
        }));
        this.shuffleActPool();
    }

    /**
     * Shuffle act pool
     */
    shuffleActPool() {
        for (let i = this.actPool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.actPool[i], this.actPool[j]] = [this.actPool[j], this.actPool[i]];
        }
    }

    /**
     * Set up available acts for the round (5 regular + 1 mandatory execution)
     */
    setupRound() {
        // Keep acts that weren't bid on
        const keptActs = this.availableActs.filter(act => 
            !this.selectedActs.includes(act.id)
        );

        // Fill remaining slots from pool
        const needed = this.config.actDisplay.regularActsPerRound - keptActs.length;
        const newActs = [];
        
        // Create a working copy of the pool
        const availablePool = this.actPool.filter(act => 
            !keptActs.some(kept => kept.id === act.id)
        );

        for (let i = 0; i < needed && availablePool.length > 0; i++) {
            newActs.push(availablePool.shift());
        }

        this.availableActs = [...keptActs, ...newActs];
        this.selectedActs = [];
        this.bids = {};
        
        // Randomly select one mandatory execution act for the round
        const executionActs = Object.values(this.config.finalActs);
        const randomIndex = Math.floor(Math.random() * executionActs.length);
        this.mandatoryExecutionAct = { ...executionActs[randomIndex] };
    }
    
    /**
     * Get the mandatory execution act for this round
     */
    getMandatoryExecutionAct() {
        return this.mandatoryExecutionAct;
    }

    /**
     * Get all available acts (regular + mandatory execution)
     */
    getAvailableActs() {
        // Only show the mandatory execution act for this round
        const executionActs = this.mandatoryExecutionAct ? [this.mandatoryExecutionAct] : [];

        return {
            regular: this.availableActs,
            execution: executionActs
        };
    }

    /**
     * Place a bid on an act
     */
    placeBid(playerId, actId, coins) {
        if (!this.bids[actId]) {
            this.bids[actId] = [];
        }
        
        this.bids[actId].push({
            playerId: playerId,
            coins: coins,
            timestamp: Date.now()
        });

        // Mark act as selected if it's a regular act
        const act = this.availableActs.find(a => a.id === actId);
        if (act && !this.selectedActs.includes(actId)) {
            this.selectedActs.push(actId);
        }
    }

    /**
     * Get bids for an act
     */
    getBids(actId) {
        return this.bids[actId] || [];
    }

    /**
     * Get total coins bid on an act
     */
    getTotalBids(actId) {
        const bids = this.getBids(actId);
        return bids.reduce((total, bid) => total + bid.coins, 0);
    }

    /**
     * Get all selected acts (acts that received bids)
     */
    getSelectedActs() {
        return this.selectedActs.map(actId => {
            const regularAct = this.availableActs.find(a => a.id === actId);
            if (regularAct) return regularAct;
            
            const executionAct = Object.values(this.config.finalActs).find(a => a.id === actId);
            return executionAct;
        }).filter(Boolean);
    }

    /**
     * Resolve an act - award rewards and move tracks
     */
    resolveAct(actId, gameState) {
        // Find the act
        let act = this.availableActs.find(a => a.id === actId);
        if (!act) {
            act = Object.values(this.config.finalActs).find(a => a.id === actId);
        }
        
        if (!act) {
            return { success: false, error: 'Act not found' };
        }

        const bids = this.getBids(actId);
        if (bids.length === 0) {
            return { success: false, error: 'No bids on this act' };
        }

        const participants = bids.map(bid => {
            const player = gameState.players.find(p => p.id === bid.playerId);
            return { player, bid: bid.coins };
        }).filter(p => p.player !== undefined);

        // Check if players have required resources
        const validParticipants = [];
        for (const { player, bid } of participants) {
            let hasResources = true;
            if (act.resourceCost) {
                for (const [resourceType, amount] of Object.entries(act.resourceCost)) {
                    if ((player.getResource(resourceType) || 0) < amount) {
                        hasResources = false;
                        break;
                    }
                }
            }
            
            // Check coin cost (separate from bid)
            if (act.coinCost && (player.getResource('coins') || 0) < act.coinCost) {
                hasResources = false;
            }

            if (hasResources) {
                validParticipants.push({ player, bid });
            }
        }

        if (validParticipants.length === 0) {
            return { success: false, error: 'No valid participants' };
        }

        // Determine winner if act has one
        let winner = null;
        let diceResults = null;
        if (act.hasWinner && validParticipants.length > 1) {
            // Dice roll competition - no ties allowed
            diceResults = this.rollDiceCompetition(validParticipants.map(p => p.player));
            winner = diceResults.winner;
        } else if (act.hasWinner && validParticipants.length === 1) {
            winner = validParticipants[0].player;
        }

        // Resolve for each participant
        const results = [];
        for (const { player, bid } of validParticipants) {
            const isWinner = winner && winner.id === player.id;
            
            // Pay coin cost (separate from bid)
            if (act.coinCost) {
                player.removeResource('coins', act.coinCost);
            }

            // Consume or return resources
            if (act.resourceCost) {
                if (act.consumesResources) {
                    if (act.hasWinner) {
                        // Only loser consumes resources
                        if (!isWinner) {
                            for (const [resourceType, amount] of Object.entries(act.resourceCost)) {
                                player.removeResource(resourceType, amount);
                            }
                        }
                    } else {
                        // All participants consume
                        for (const [resourceType, amount] of Object.entries(act.resourceCost)) {
                            player.removeResource(resourceType, amount);
                        }
                    }
                }
                // If not consuming, resources are returned (no action needed)
            }

            // Award coins (all participants get this)
            if (act.coinReward) {
                let coinAmount = 0;
                if (typeof act.coinReward === 'string') {
                    // Handle special coin reward types
                    if (act.coinReward === 'perAnimal') {
                        // Cavalry Display: 1 coin per animal owned
                        coinAmount = player.getResource('animals') || 0;
                    } else {
                        // Unknown string value, default to 0
                        console.warn(`Unknown coinReward string: ${act.coinReward}`);
                        coinAmount = 0;
                    }
                } else {
                    // Regular numeric coin reward
                    coinAmount = act.coinReward;
                }
                if (coinAmount > 0) {
                    player.addResource('coins', coinAmount);
                }
            }

            // Award track movement (only winner if hasWinner, all if not)
            if (act.tracks) {
                if (!act.hasWinner || isWinner) {
                    for (const [trackName, amount] of Object.entries(act.tracks)) {
                        // Check if track is blocked
                        if (!gameState.blockedTracks || !gameState.blockedTracks.includes(trackName)) {
                            player.modifyTrack(trackName, amount);
                        }
                    }
                }
            }

            results.push({
                playerId: player.id,
                isWinner: isWinner,
                coinsGained: act.coinReward || 0,
                tracksMoved: (!act.hasWinner || isWinner) ? act.tracks : {}
            });
        }

        // Apply non-participant penalties
        const participantIds = validParticipants.map(p => p.player.id);
        gameState.players.forEach(player => {
            if (!participantIds.includes(player.id) && act.nonParticipantPenalty) {
                for (const [trackName, amount] of Object.entries(act.nonParticipantPenalty)) {
                    if (!gameState.blockedTracks || !gameState.blockedTracks.includes(trackName)) {
                        player.modifyTrack(trackName, amount);
                    }
                }
            }
        });

        return {
            success: true,
            act: act,
            winner: winner,
            diceResults: diceResults,
            results: results
        };
    }

    /**
     * Roll dice competition between players - re-rolls on ties until clear winner
     * @param {Player[]} players - Array of players competing
     * @returns {object} { winner, rolls: [{player, roll}], rerollCount }
     */
    rollDiceCompetition(players) {
        let rerollCount = 0;
        const maxRerolls = 10; // Safety limit
        
        while (rerollCount < maxRerolls) {
            // Roll d6 for each player
            const rolls = players.map(player => ({
                player,
                roll: Math.floor(Math.random() * 6) + 1
            }));
            
            // Sort by roll descending
            rolls.sort((a, b) => b.roll - a.roll);
            
            // Check if highest roll is unique (no tie for first)
            const highestRoll = rolls[0].roll;
            const tiedForFirst = rolls.filter(r => r.roll === highestRoll);
            
            if (tiedForFirst.length === 1) {
                // Clear winner
                return {
                    winner: rolls[0].player,
                    rolls: rolls,
                    rerollCount: rerollCount
                };
            }
            
            // Tie - re-roll only among tied players
            players = tiedForFirst.map(r => r.player);
            rerollCount++;
        }
        
        // Fallback after max rerolls - pick randomly from remaining tied
        const finalRolls = players.map(player => ({
            player,
            roll: Math.floor(Math.random() * 6) + 1
        }));
        finalRolls.sort((a, b) => b.roll - a.roll);
        
        return {
            winner: finalRolls[0].player,
            rolls: finalRolls,
            rerollCount: rerollCount
        };
    }

    /**
     * Clear bids for cleanup
     */
    clearBids() {
        this.bids = {};
    }

    /**
     * Serialize for save/load
     */
    serialize() {
        return {
            availableActs: this.availableActs,
            actPool: this.actPool,
            selectedActs: this.selectedActs,
            bids: this.bids,
            mandatoryExecutionAct: this.mandatoryExecutionAct
        };
    }

    /**
     * Deserialize from save data
     */
    deserialize(data) {
        this.availableActs = data.availableActs || [];
        this.actPool = data.actPool || [];
        this.selectedActs = data.selectedActs || [];
        this.bids = data.bids || {};
        this.mandatoryExecutionAct = data.mandatoryExecutionAct || null;
    }
}
