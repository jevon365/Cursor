/**
 * BasicStrategy - Random AI strategy for playtesting
 * 
 * Makes random but valid decisions to enable quick game testing.
 * Based on reference TSX patterns.
 */

export class BasicStrategy {
    constructor(difficulty = 'medium') {
        this.difficulty = difficulty;
        // Probabilities for random decisions
        this.bidChance = 0.4;
        this.placeWorkerChance = 0.7;
        this.buyResourceChance = 0.6;
    }

    /**
     * Decide whether and how to bid on an act
     * @param {object} gameState - Current game state
     * @param {object} player - AI player
     * @returns {object} { type: 'bid'|'pass', actId?, coins? }
     */
    decideBid(gameState, player) {
        const shouldBid = Math.random() < this.bidChance && player.coins >= 1;
        
        if (!shouldBid) {
            return { type: 'pass' };
        }
        
        // Get available acts
        const availableActs = gameState.availableActs;
        const allActs = [
            ...(availableActs?.regular || []),
            ...(availableActs?.execution || [])
        ];
        
        if (allActs.length === 0) {
            return { type: 'pass' };
        }
        
        // Pick a random act
        const randomAct = allActs[Math.floor(Math.random() * allActs.length)];
        
        // Bid 1-3 coins randomly (but not more than player has)
        const maxBid = Math.min(3, player.coins);
        const bidAmount = Math.floor(Math.random() * maxBid) + 1;
        
        return {
            type: 'bid',
            actId: randomAct.id,
            coins: bidAmount
        };
    }

    /**
     * Decide whether and where to place a worker
     * @param {object} gameState - Current game state
     * @param {object} player - AI player
     * @param {object} config - Game config
     * @returns {object} { type: 'placeWorker'|'pass', locationId? }
     */
    decideWorkerPlacement(gameState, player, config) {
        const shouldPlace = Math.random() < this.placeWorkerChance;
        
        if (!shouldPlace) {
            return { type: 'pass' };
        }
        
        // Check if player can afford to place a worker
        const workerCost = (config?.limits?.workerDeployCost || 1) + (gameState.workerCostModifier || 0);
        if (player.coins < workerCost) {
            return { type: 'pass' };
        }
        
        // Check if player has available workers
        if (!player.workers || player.workers.available <= 0) {
            return { type: 'pass' };
        }
        
        // Get valid locations
        const validLocations = this.getValidLocations(gameState, player, config);
        
        if (validLocations.length === 0) {
            return { type: 'pass' };
        }
        
        // Pick a random valid location
        const randomLocation = validLocations[Math.floor(Math.random() * validLocations.length)];
        
        return {
            type: 'placeWorker',
            locationId: randomLocation
        };
    }

    /**
     * Decide whether to buy a resource from the market
     * @param {object} gameState - Current game state
     * @param {object} player - AI player
     * @returns {object} { type: 'buyResource'|'pass', resourceType? }
     */
    decideMarketPurchase(gameState, player) {
        // Check if player is in current market queue
        const currentMarket = gameState.currentMarket;
        if (!currentMarket) {
            return { type: 'pass' };
        }
        
        const queue = gameState.marketQueues?.[currentMarket] || [];
        if (!queue.includes(player.id)) {
            return { type: 'pass' };
        }
        
        const shouldBuy = Math.random() < this.buyResourceChance;
        
        if (!shouldBuy) {
            return { type: 'pass' };
        }
        
        // Check if player can afford
        const markets = gameState.markets;
        const marketState = markets?.[currentMarket];
        const price = marketState?.currentPrice;
        
        if (!price || player.coins < price) {
            return { type: 'pass' };
        }
        
        return {
            type: 'buyResource',
            resourceType: currentMarket
        };
    }

    /**
     * Get list of valid location IDs for worker placement
     * @param {object} gameState - Current game state
     * @param {object} player - AI player
     * @param {object} config - Game config
     * @returns {string[]} Array of valid location IDs
     */
    getValidLocations(gameState, player, config) {
        const validLocations = [];
        const locations = config?.locations || {};
        const disabledLocations = gameState.disabledLocations || [];
        const board = gameState.board || {};
        const workerPlacements = board.workerPlacements || {};
        
        for (const [locationId, location] of Object.entries(locations)) {
            // Skip disabled locations
            if (disabledLocations.includes(locationId)) {
                continue;
            }
            
            // Skip Gamblers Den (not implemented)
            if (location.effectType === 'betting') {
                continue;
            }
            
            // Check max workers per player
            const placementsAtLocation = workerPlacements[locationId] || [];
            const playerWorkersHere = placementsAtLocation.filter(p => p.playerId === player.id).length;
            
            if (location.maxWorkersPerPlayer && playerWorkersHere >= location.maxWorkersPerPlayer) {
                continue;
            }
            
            // Check max workers total (e.g., Prison)
            if (location.maxWorkersTotal && placementsAtLocation.length >= location.maxWorkersTotal) {
                continue;
            }
            
            // Check resource requirements for conversion locations (Guildhall)
            if (location.effectType === 'resourceConversion' && location.conversionCost) {
                let hasResources = true;
                for (const [resource, amount] of Object.entries(location.conversionCost)) {
                    const playerAmount = resource === 'coins' ? player.coins : (player.resources?.[resource] || 0);
                    if (playerAmount < amount) {
                        hasResources = false;
                        break;
                    }
                }
                if (!hasResources) continue;
            }
            
            // Check resource requirements for information locations (Oracle)
            if (location.effectType === 'information' && location.informationCost) {
                let hasResources = true;
                for (const [resource, amount] of Object.entries(location.informationCost)) {
                    const playerAmount = player.resources?.[resource] || 0;
                    if (playerAmount < amount) {
                        hasResources = false;
                        break;
                    }
                }
                if (!hasResources) continue;
            }
            
            validLocations.push(locationId);
        }
        
        return validLocations;
    }

    /**
     * Main decision method - returns action based on current phase
     * @param {object} gameState - Current game state
     * @param {object} player - AI player
     * @param {object} config - Game config
     * @returns {object} Action to execute
     */
    decide(gameState, player, config) {
        const phase = gameState.currentPhase;
        
        switch (phase) {
            case 'bidOnActs':
                return this.decideBid(gameState, player);
            
            case 'placeWorkers':
                return this.decideWorkerPlacement(gameState, player, config);
            
            case 'buyResources':
                return this.decideMarketPurchase(gameState, player);
            
            default:
                return { type: 'pass' };
        }
    }
}
