/**
 * Phases - Manages game phases and phase-specific logic
 * 
 * Handles phase transitions, phase-specific rules, and phase actions
 */

export class Phases {
    constructor(config) {
        this.config = config;
        this.phases = [];
        this.currentPhaseIndex = 0;
        this.initializePhases();
    }

    /**
     * Initialize phases from config
     */
    initializePhases() {
        this.phases = Object.entries(this.config.phases)
            .sort((a, b) => a[1].order - b[1].order)
            .map(([id, phaseData]) => ({
                id: id,
                ...phaseData
            }));
    }

    /**
     * Get current phase
     */
    getCurrentPhase() {
        return this.phases[this.currentPhaseIndex] || null;
    }

    /**
     * Get phase by ID
     */
    getPhase(phaseId) {
        return this.phases.find(p => p.id === phaseId);
    }

    /**
     * Advance to next phase
     */
    nextPhase() {
        if (this.currentPhaseIndex < this.phases.length - 1) {
            this.currentPhaseIndex++;
            return true;
        }
        return false; // No more phases
    }

    /**
     * Reset to first phase
     */
    reset() {
        this.currentPhaseIndex = 0;
    }

    /**
     * Get available actions for current phase
     */
    getAvailableActions(gameState) {
        const currentPhase = this.getCurrentPhase();
        if (!currentPhase) {
            return [];
        }

        const actions = [];
        
        switch (currentPhase.id) {
            case 'bidOnActs':
                // Players can bid on act cards or pass
                actions.push('bid', 'pass');
                break;
            case 'placeWorkers':
                // Players can place workers at locations
                actions.push('placeWorker', 'pass');
                break;
            case 'buyResources':
                // Players can buy resources from markets
                actions.push('buyResource', 'pass');
                break;
            case 'performActs':
                // Automatic phase - no player actions
                actions.push('pass');
                break;
            case 'cleanup':
                // Automatic phase - no player actions
                break;
        }
        
        return actions;
    }

    /**
     * Execute phase transition logic
     */
    onPhaseStart(gameState) {
        const currentPhase = this.getCurrentPhase();
        if (!currentPhase) {
            return;
        }

        switch (currentPhase.id) {
            case 'bidOnActs':
                // Clear previous bids
                gameState.players.forEach(p => p.clearBids());
                // Set turn order based on empire track leader
                this.setTurnOrder(gameState, 'empire');
                break;
            case 'placeWorkers':
                // Set turn order based on population track leader
                this.setTurnOrder(gameState, 'population');
                break;
            case 'buyResources':
                // Set turn order based on market queue order
                this.setTurnOrder(gameState, 'market');
                break;
            case 'performActs':
                // Resolve acts in bid order
                this.setTurnOrder(gameState, 'bid');
                break;
            case 'cleanup':
                // Automatic cleanup - no turn order needed
                break;
        }
    }

    /**
     * Set turn order based on phase rules
     * Returns ordered list of player indices without mutating players array
     */
    setTurnOrder(gameState, method) {
        const players = gameState.players;
        let orderedIndices = [];
        
        if (method === 'empire') {
            // Sort by empire track (descending), then by player order
            orderedIndices = players
                .map((p, idx) => ({ player: p, index: idx }))
                .sort((a, b) => {
                    const diff = b.player.getTrack('empire') - a.player.getTrack('empire');
                    return diff !== 0 ? diff : a.index - b.index;
                })
                .map(item => item.index);
        } else if (method === 'population') {
            // Sort by population track (descending)
            orderedIndices = players
                .map((p, idx) => ({ player: p, index: idx }))
                .sort((a, b) => {
                    const diff = b.player.getTrack('population') - a.player.getTrack('population');
                    return diff !== 0 ? diff : a.index - b.index;
                })
                .map(item => item.index);
        } else if (method === 'market') {
            // Order based on when workers were queued at markets
            // TODO: Implement market queue order tracking
            // For now, keep current order
            orderedIndices = players.map((_, idx) => idx);
        } else if (method === 'bid') {
            // Order based on bid order (first bidder first)
            // TODO: Track bid order
            // For now, keep current order
            orderedIndices = players.map((_, idx) => idx);
        } else {
            // Default: keep current order
            orderedIndices = players.map((_, idx) => idx);
        }
        
        // Store turn order for this phase
        gameState.turnOrder = orderedIndices;
        gameState.currentPlayerIndex = orderedIndices[0] || 0;
    }

    /**
     * Execute phase end logic
     */
    onPhaseEnd(gameState) {
        const currentPhase = this.getCurrentPhase();
        if (!currentPhase) {
            return;
        }

        switch (currentPhase.id) {
            case 'bidOnActs':
                // Bids are finalized, ready for act performance
                break;
            case 'placeWorkers':
                // Workers are placed, ready for resource buying
                break;
            case 'buyResources':
                // Resources purchased, ready for act performance
                break;
            case 'performActs':
                // Acts resolved, ready for cleanup
                break;
            case 'cleanup':
                // Cleanup complete, ready for next round
                // Reset workers and bids
                gameState.board.clearWorkers();
                gameState.players.forEach(p => {
                    // Return placed workers to available before resetting
                    p.workers.available += p.workers.placed;
                    p.workers.placed = 0;
                    p.clearBids();
                });
                break;
        }
    }

    /**
     * Check if phase should end
     */
    shouldEndPhase(gameState) {
        const currentPhase = this.getCurrentPhase();
        if (!currentPhase) {
            return true;
        }

        switch (currentPhase.id) {
            case 'bidOnActs':
                // Phase ends when all players have passed
                // First player must bid, others can pass
                // TODO: Track passed players
                return false; // Placeholder
            case 'placeWorkers':
                // Phase ends when all players have passed
                // TODO: Track passed players
                return false; // Placeholder
            case 'buyResources':
                // Phase ends when all players have passed
                // TODO: Track passed players
                return false; // Placeholder
            case 'performActs':
                // Automatic phase - ends after acts are resolved
                return true;
            case 'cleanup':
                // Automatic phase - ends after cleanup is complete
                return true;
        }
        
        return false;
    }

    /**
     * Get phase-specific rules for a player action
     */
    validateAction(action, gameState) {
        const currentPhase = this.getCurrentPhase();
        if (!currentPhase) {
            return { valid: false, reason: 'No active phase' };
        }

        const currentPlayer = gameState.getCurrentPlayer();
        
        switch (currentPhase.id) {
            case 'bidOnActs':
                if (action.type === 'pass') {
                    // First player must bid (cannot pass)
                    const turnOrder = gameState.turnOrder || gameState.players.map((_, idx) => idx);
                    if (gameState.currentPlayerIndex === turnOrder[0]) {
                        return { valid: false, reason: 'First player must bid' };
                    }
                } else if (action.type === 'bid') {
                    // Validate bid
                    if (!action.actId) {
                        return { valid: false, reason: 'No act specified' };
                    }
                    if (!action.coins || action.coins < this.config.limits.minBid) {
                        return { valid: false, reason: 'Bid too low' };
                    }
                    if (currentPlayer.getResource('coins') < action.coins) {
                        return { valid: false, reason: 'Insufficient coins' };
                    }
                }
                break;
            case 'placeWorkers':
                if (action.type === 'placeWorker') {
                    // Validate worker placement
                    if (currentPlayer.workers.available <= 0) {
                        return { valid: false, reason: 'No available workers' };
                    }
                    // TODO: Check location limits
                }
                break;
            case 'buyResources':
                if (action.type === 'buyResource') {
                    // Validate resource purchase
                    // TODO: Check market availability and pricing
                }
                break;
        }
        
        return { valid: true };
    }
}
