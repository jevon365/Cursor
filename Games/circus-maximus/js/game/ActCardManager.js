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
     * Set up available acts for the round (5 regular + 3 execution)
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
    }

    /**
     * Get all available acts (regular + execution)
     */
    getAvailableActs() {
        const executionActs = Object.values(this.config.finalActs).map(act => ({
            id: act.id,
            ...act
        }));

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
        if (act.hasWinner && validParticipants.length > 1) {
            // Random selection among participants
            const randomIndex = Math.floor(Math.random() * validParticipants.length);
            winner = validParticipants[randomIndex].player;
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
                player.addResource('coins', act.coinReward);
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
            results: results
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
            bids: this.bids
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
    }
}
