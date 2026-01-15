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
     * Returns action objects that UI can use to build interactive controls
     */
    getAvailableActions(gameState) {
        const currentPhase = this.getCurrentPhase();
        if (!currentPhase) {
            return [];
        }

        const actions = [];
        const turnOrder = gameState.turnOrder || gameState.players.map((_, idx) => idx);
        const firstPlayerIndex = turnOrder[0];
        const currentPlayerIndex = gameState.currentPlayerIndex;
        
        switch (currentPhase.id) {
            case 'bidOnActs':
                // Players can bid on act cards or pass
                // First player must bid initially, but can pass after placing their first bid
                const currentPlayer = gameState.getCurrentPlayer();
                const isFirstPlayer = currentPlayerIndex === firstPlayerIndex;
                
                // Check if first player has already placed a bid
                let firstPlayerHasBid = false;
                if (isFirstPlayer) {
                    // Check if first player has any bids (bids is an array)
                    firstPlayerHasBid = currentPlayer.bids && currentPlayer.bids.length > 0;
                }
                
                const canPass = !isFirstPlayer || firstPlayerHasBid;
                
                actions.push({
                    type: 'bid',
                    name: 'Bid on Act',
                    description: 'Place a bid on an act card',
                    requiresSelection: true, // UI needs to show act selection
                    selectionType: 'act'
                });
                if (canPass) {
                    actions.push({
                        type: 'pass',
                        name: 'Pass',
                        description: 'Skip bidding this turn'
                    });
                }
                break;
            case 'placeWorkers':
                // Players can place workers at locations
                actions.push({
                    type: 'placeWorker',
                    name: 'Place Worker',
                    description: 'Place a worker at a location',
                    requiresSelection: true,
                    selectionType: 'location'
                });
                actions.push({
                    type: 'pass',
                    name: 'Pass',
                    description: 'Skip placing workers this turn'
                });
                break;
            case 'buyResources':
                // Players can buy resources from markets
                actions.push({
                    type: 'buyResource',
                    name: 'Buy Resource',
                    description: 'Purchase a resource from the market',
                    requiresSelection: true,
                    selectionType: 'resource'
                });
                actions.push({
                    type: 'pass',
                    name: 'Pass',
                    description: 'Skip buying resources this turn'
                });
                break;
            case 'performActs':
                // Automatic phase - just show pass to advance
                actions.push({
                    type: 'pass',
                    name: 'Continue',
                    description: 'Continue to cleanup phase'
                });
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
                // Clear passed players
                gameState.clearPassedPlayers();
                // Set turn order based on empire track leader
                // BUT: If Palace first player flag is set, use that player first
                if (gameState.palaceFirstPlayer !== null) {
                    // Place Palace player first in turn order
                    const palacePlayerIndex = gameState.players.findIndex(p => p.id === gameState.palaceFirstPlayer);
                    if (palacePlayerIndex >= 0) {
                        // Create turn order with Palace player first
                        const otherPlayers = gameState.players
                            .map((p, idx) => ({ player: p, index: idx }))
                            .filter(item => item.index !== palacePlayerIndex)
                            .sort((a, b) => {
                                const diff = b.player.getTrack('empire') - a.player.getTrack('empire');
                                return diff !== 0 ? diff : a.index - b.index;
                            })
                            .map(item => item.index);
                        gameState.turnOrder = [palacePlayerIndex, ...otherPlayers];
                        gameState.currentPlayerIndex = palacePlayerIndex;
                        // Clear the flag after using it
                        gameState.palaceFirstPlayer = null;
                    } else {
                        // Palace player not found - fall back to normal turn order
                        this.setTurnOrder(gameState, 'empire');
                    }
                } else {
                    // Normal turn order based on empire track
                    this.setTurnOrder(gameState, 'empire');
                }
                break;
            case 'placeWorkers':
                // Clear passed players
                gameState.clearPassedPlayers();
                // Set turn order based on population track leader
                this.setTurnOrder(gameState, 'population');
                break;
            case 'buyResources':
                // Clear passed players
                gameState.clearPassedPlayers();
                // Initialize first market (mummers, then animals, then slaves)
                const marketOrder = ['mummers', 'animals', 'slaves'];
                // Find first market with players in queue
                let firstMarket = null;
                for (const marketType of marketOrder) {
                    if (gameState.marketQueues[marketType] && gameState.marketQueues[marketType].length > 0) {
                        firstMarket = marketType;
                        break;
                    }
                }
                gameState.currentMarket = firstMarket;
                // Set turn order based on current market queue order
                this.setTurnOrder(gameState, 'market');
                break;
            case 'performActs':
                // Clear passed players (though this phase is automatic)
                gameState.clearPassedPlayers();
                // Resolve acts in bid order
                this.setTurnOrder(gameState, 'bid');
                break;
            case 'cleanup':
                // Automatic cleanup - no turn order needed
                gameState.clearPassedPlayers();
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
            // Order based on current market queue
            // Only include players who have workers in the current market being resolved
            const currentMarket = gameState.currentMarket;
            
            if (!currentMarket) {
                // No current market - use default order
                orderedIndices = players.map((_, idx) => idx);
            } else {
                const marketQueue = gameState.marketQueues[currentMarket] || [];
                
                if (marketQueue.length === 0) {
                    // No players in current market - use default order
                    orderedIndices = players.map((_, idx) => idx);
                } else {
                    // Order players by their position in the current market's queue
                    orderedIndices = marketQueue
                        .map(playerId => {
                            const playerIndex = players.findIndex(p => p.id === playerId);
                            return playerIndex;
                        })
                        .filter(index => index >= 0); // Only include valid player indices
                }
            }
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
                // Clear market queues for next round (they'll be rebuilt in placeWorkers phase)
                // Actually, don't clear here - they're cleared in cleanup phase
                // Reset current market
                gameState.currentMarket = null;
                break;
            case 'performActs':
                // Acts resolved, ready for cleanup
                break;
            case 'cleanup':
                // Cleanup complete, ready for next round
                // Reset workers and bids
                gameState.board.clearWorkers();
                gameState.players.forEach(p => {
                    // 1. Calculate feeding costs (1 coin per resource)
                    const totalResources = (p.getResource('mummers') || 0) + 
                                           (p.getResource('animals') || 0) + 
                                           (p.getResource('slaves') || 0) + 
                                           (p.getResource('prisoners') || 0);
                    const feedingCost = totalResources * (this.config.economy?.feedingCostPerResource || 1);
                    
                    // 2. Calculate income (sum of tracks, minimum floor)
                    const trackIncome = p.getTrack('empire') + p.getTrack('population') + p.getTrack('church');
                    const minimumIncome = this.config.economy?.minimumIncome || 3;
                    const income = Math.max(trackIncome, minimumIncome);
                    
                    // 3. Apply feeding cost and income
                    const netChange = income - feedingCost;
                    if (netChange >= 0) {
                        p.addResource('coins', netChange);
                    } else {
                        p.removeResource('coins', Math.abs(netChange));
                    }
                    
                    // Return placed workers to available before resetting
                    p.workers.available += p.workers.placed;
                    p.workers.placed = 0;
                    p.clearBids();
                });
                // Clear market queues for next round
                gameState.marketQueues = {
                    mummers: [],
                    animals: [],
                    slaves: []
                };
                gameState.currentMarket = null;
                // Increment round counter
                gameState.round++;
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
            case 'placeWorkers':
                // Phase ends when all players in turn order have passed
                // For bidOnActs: first player must bid (can't pass), so phase ends when all others have passed
                // For other phases: all players can pass, phase ends when all have passed
                const turnOrder = gameState.turnOrder || gameState.players.map((_, idx) => idx);
                
                if (turnOrder.length === 0) {
                    return true; // No players, phase should end
                }
                
                // Count how many players have passed
                const passedCount = turnOrder.filter(idx => gameState.hasPlayerPassed(idx)).length;
                
                if (currentPhase.id === 'bidOnActs') {
                    // First player must bid, so phase ends when all OTHER players have passed
                    // (first player can't pass, so we check if all except first have passed)
                    // Safety: also check that first player hasn't passed (shouldn't happen)
                    const firstPlayerIndex = turnOrder[0];
                    const firstPlayerPassed = gameState.hasPlayerPassed(firstPlayerIndex);
                    if (firstPlayerPassed) {
                        // Edge case: first player somehow passed - end phase immediately
                        console.warn('First player passed in bidOnActs - ending phase');
                        return true;
                    }
                    return passedCount >= turnOrder.length - 1;
                } else {
                    // All players can pass, phase ends when all have passed
                    return passedCount >= turnOrder.length;
                }
                
            case 'buyResources':
                // Phase ends when all markets have been resolved
                // Markets are resolved sequentially: mummers, then animals, then slaves
                const marketOrder = ['mummers', 'animals', 'slaves'];
                
                // If no current market, check if any markets have players
                if (!gameState.currentMarket) {
                    const hasAnyMarkets = marketOrder.some(marketType => {
                        const queue = gameState.marketQueues[marketType] || [];
                        return queue.length > 0;
                    });
                    // If no markets have players, phase ends immediately
                    return !hasAnyMarkets;
                }
                
                // Check if all markets have been resolved
                const currentMarketIndex = marketOrder.indexOf(gameState.currentMarket);
                
                // Check if current market is done (all players passed)
                const currentMarketQueue = gameState.marketQueues[gameState.currentMarket] || [];
                const allPassedInCurrentMarket = currentMarketQueue.length > 0 && 
                    currentMarketQueue.every(playerId => {
                        const playerIndex = gameState.players.findIndex(p => p.id === playerId);
                        return playerIndex >= 0 && gameState.hasPlayerPassed(playerIndex);
                    });
                
                if (allPassedInCurrentMarket) {
                    // Check if there are more markets to resolve
                    for (let i = currentMarketIndex + 1; i < marketOrder.length; i++) {
                        const marketType = marketOrder[i];
                        const queue = gameState.marketQueues[marketType] || [];
                        if (queue.length > 0) {
                            // There's another market to resolve - phase continues
                            return false;
                        }
                    }
                    // No more markets - phase ends
                    return true;
                }
                
                // Current market still has players who haven't passed
                return false;
                
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
                    // First player must bid initially (cannot pass on first turn)
                    // But after placing their first bid, they can pass
                    const turnOrder = gameState.turnOrder || gameState.players.map((_, idx) => idx);
                    const isFirstPlayer = gameState.currentPlayerIndex === turnOrder[0];
                    
                    if (isFirstPlayer) {
                        // Check if first player has already placed at least one bid
                        const currentPlayer = gameState.getCurrentPlayer();
                        const hasBid = currentPlayer.bids && currentPlayer.bids.length > 0;
                        
                        if (!hasBid) {
                            return { valid: false, reason: 'First player must place at least one bid before passing' };
                        }
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
                    if (!action.locationId) {
                        return { valid: false, reason: 'No location specified' };
                    }
                    // Check if location exists and is available
                    const space = gameState.board.getSpace(action.locationId);
                    if (!space) {
                        return { valid: false, reason: 'Invalid location' };
                    }
                    // Check if location is disabled
                    if (gameState.disabledLocations && gameState.disabledLocations.includes(action.locationId)) {
                        return { valid: false, reason: 'Location is disabled this round' };
                    }
                    // Check worker cost
                    const workerCost = this.config.limits.workerDeployCost + (gameState.workerCostModifier || 0);
                    if (currentPlayer.getResource('coins') < workerCost) {
                        return { valid: false, reason: 'Insufficient coins to deploy worker' };
                    }
                    // Check if player can place more workers at this location
                    const availableSpaces = gameState.board.getAvailableSpaces(currentPlayer.id);
                    if (!availableSpaces.find(s => s.id === action.locationId)) {
                        return { valid: false, reason: 'Cannot place worker at this location (max reached or stock depleted)' };
                    }
                    
                    // Location-specific validation
                    const location = this.config.locations[action.locationId];
                    if (location) {
                        // Oracle: Must have animal
                        if (location.id === 'oracle' || action.locationId === 'oracle') {
                            if (currentPlayer.getResource('animals') < 1) {
                                return { valid: false, reason: 'Oracle requires 1 animal to use' };
                            }
                        }
                        
                        // Guildhall: Must have slave + 5 coins + worker supply not empty
                        if (location.id === 'guildhall' || action.locationId === 'guildhall') {
                            if (currentPlayer.getResource('slaves') < 1) {
                                return { valid: false, reason: 'Guildhall requires 1 slave to use' };
                            }
                            if (currentPlayer.getResource('coins') < workerCost + 5) {
                                return { valid: false, reason: 'Guildhall requires 5 coins (in addition to worker cost) to use' };
                            }
                            if (gameState.getSupplyAmount('workers') < 1) {
                                return { valid: false, reason: 'No workers available in supply for Guildhall' };
                            }
                        }
                        
                        // Prison: Check supply has prisoners (though may be unlimited, check anyway)
                        if (location.id === 'prison' || action.locationId === 'prison') {
                            // Prison can still be used even if supply is empty (may be unlimited)
                            // But we'll check and warn if supply is empty
                            // Note: This is informational - Prison may still work if supply is unlimited
                            // The actual effect handler will handle taking what's available
                        }
                    }
                }
                break;
            case 'buyResources':
                if (action.type === 'buyResource') {
                    // Validate resource purchase
                    if (!action.resourceType) {
                        return { valid: false, reason: 'No resource type specified' };
                    }
                    
                    // Check if this is the current market being resolved
                    if (gameState.currentMarket !== action.resourceType) {
                        return { valid: false, reason: `You can only buy from ${gameState.currentMarket || 'the current'} market right now. Markets are resolved one at a time.` };
                    }
                    
                    // Check if player has worker in the market for this resource
                    const marketQueue = gameState.marketQueues[action.resourceType];
                    if (!marketQueue || !marketQueue.includes(currentPlayer.id)) {
                        return { valid: false, reason: `You must have a worker in ${action.resourceType} market to buy this resource` };
                    }
                    // TODO: Check market availability and pricing
                }
                break;
        }
        
        return { valid: true };
    }
}
