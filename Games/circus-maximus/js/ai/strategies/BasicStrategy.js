/**
 * BasicStrategy - AI strategy with scoring heuristics, difficulty scaling, and edge case handling
 * 
 * Makes intelligent decisions based on game state evaluation.
 * Uses rules.js for all validation logic.
 * Difficulty affects decision quality through randomness parameter.
 * Handles all edge cases gracefully (no coins, no workers, first player rule, etc.)
 */

import { 
    validateBid, 
    validateResourcePurchase, 
    getValidWorkerLocations,
    canParticipateInAct
} from '../../utils/rules.js';

export class BasicStrategy {
    constructor(difficulty = 'medium') {
        this.difficulty = difficulty || 'medium';
        
        // Randomness affects decision quality
        // 0.0 = always pick best, 1.0 = always random
        // Set defaults, can be overridden by config
        this.randomness = this.getDefaultRandomness(this.difficulty);
        this.lookAhead = 1; // Not currently used, but available for future
    }

    /**
     * Get default randomness for difficulty level
     * @param {string} difficulty - easy, medium, or hard
     * @returns {number} Randomness value (0-1)
     */
    getDefaultRandomness(difficulty) {
        switch (difficulty) {
            case 'easy':
                return 0.8; // 80% random, picks suboptimal moves often
            case 'medium':
                return 0.4; // 40% random, balanced
            case 'hard':
                return 0.1; // 10% random, mostly optimal
            default:
                return 0.4;
        }
    }

    /**
     * Configure strategy from config settings
     * @param {object} config - Game config with ai.difficulty settings
     */
    configureFromConfig(config) {
        if (!config) return;
        
        try {
            if (config.ai?.difficulty?.[this.difficulty]) {
                const settings = config.ai.difficulty[this.difficulty];
                if (typeof settings.randomness === 'number') {
                    this.randomness = settings.randomness;
                }
                if (typeof settings.lookAhead === 'number') {
                    this.lookAhead = settings.lookAhead;
                }
            }
        } catch (e) {
            // Silently ignore config errors, use defaults
        }
    }

    /**
     * Safely get player resource amount
     * @param {object} player - Player object
     * @param {string} resourceName - Resource name
     * @returns {number} Resource amount (0 if undefined)
     */
    safeGetResource(player, resourceName) {
        if (!player || !resourceName) return 0;
        try {
            if (typeof player.getResource === 'function') {
                return player.getResource(resourceName) || 0;
            }
            return player.resources?.[resourceName] || player[resourceName] || 0;
        } catch (e) {
            return 0;
        }
    }

    /**
     * Safely get player track value
     * @param {object} player - Player object
     * @param {string} trackName - Track name
     * @returns {number} Track value (0 if undefined)
     */
    safeGetTrack(player, trackName) {
        if (!player || !trackName) return 0;
        try {
            if (typeof player.getTrack === 'function') {
                return player.getTrack(trackName) || 0;
            }
            return player.tracks?.[trackName] || 0;
        } catch (e) {
            return 0;
        }
    }

    /**
     * Safely get available workers count
     * @param {object} player - Player object
     * @returns {number} Available workers (0 if undefined)
     */
    safeGetAvailableWorkers(player) {
        if (!player) return 0;
        try {
            return player.workers?.available || 0;
        } catch (e) {
            return 0;
        }
    }

    /**
     * Check if player is first in turn order (for first player bidding rule)
     * @param {object} gameState - Current game state
     * @param {object} player - Player to check
     * @returns {boolean} True if player is first
     */
    isFirstPlayer(gameState, player) {
        if (!gameState || !player) return false;
        try {
            const turnOrder = gameState.turnOrder || [];
            if (turnOrder.length === 0) return false;
            
            // Compare player ID to first player in turn order
            return player.id === turnOrder[0];
        } catch (e) {
            return false;
        }
    }

    /**
     * Check if first player has made any bids yet
     * @param {object} player - Player to check
     * @returns {boolean} True if player has bids
     */
    hasPlayerBid(player) {
        if (!player) return false;
        try {
            const bids = player.bids;
            return bids && bids.length > 0;
        } catch (e) {
            return false;
        }
    }

    /**
     * Score an act for bidding decisions
     * @param {object} act - Act card to evaluate
     * @param {object} player - AI player
     * @param {object} gameState - Current game state
     * @returns {number} Score (higher is better)
     */
    scoreAct(act, player, gameState) {
        // Safety checks
        if (!act || !player) return -Infinity;
        
        let score = 0;
        
        // Check if we can participate (have required resources)
        // NOTE: For bidding, we don't need resources yet - we can bid and get resources later
        // So we don't disqualify acts entirely, just give them a lower score
        let canParticipate = false;
        try {
            const participation = canParticipateInAct(player, act);
            canParticipate = participation.canParticipate;
            // If we can't participate, reduce score but don't disqualify (we might get resources later)
            if (!canParticipate) {
                score -= 5; // Penalty for not having resources, but still allow bidding
            }
        } catch (e) {
            // If validation fails, assume we can't participate but still allow bidding
            score -= 5;
        }
        
        // Reward value - coins
        score += (act.rewards?.coins || 0) * 2;
        
        // Reward value - track movements
        const tracks = act.rewards?.tracks || act.trackRewards || {};
        for (const [track, amount] of Object.entries(tracks)) {
            const currentValue = this.safeGetTrack(player, track);
            // Higher value if close to winning (15 threshold)
            if (currentValue >= 12) {
                score += amount * 5; // Very valuable when close to winning
            } else if (currentValue >= 8) {
                score += amount * 3; // Moderately valuable
            } else {
                score += amount * 1.5; // Base value
            }
        }
        
        // Penalty for non-participation (if act has penalty)
        if (act.penalty || act.nonParticipantPenalty) {
            score += 4; // Incentive to participate to avoid penalty
        }
        
        // Cost consideration - resource costs reduce score
        if (act.resourceCost) {
            try {
                const totalCost = Object.values(act.resourceCost).reduce((a, b) => a + b, 0);
                score -= totalCost * 0.5;
            } catch (e) {
                // Ignore cost calculation errors
            }
        }
        
        // Execution acts need prisoners
        if (act.isExecution || act.type === 'execution') {
            const prisoners = this.safeGetResource(player, 'prisoners');
            if (prisoners < 1) {
                return -Infinity; // Can't do execution without prisoners
            }
            score += 3; // Execution acts are valuable
        }
        
        return score;
    }

    /**
     * Score a location for worker placement
     * @param {string} locationId - Location ID
     * @param {object} player - AI player
     * @param {object} gameState - Current game state
     * @param {object} config - Game config
     * @returns {number} Score (higher is better)
     */
    scoreLocation(locationId, player, gameState, config) {
        // Safety checks
        if (!locationId || !player) return 0;
        
        let score = 1; // Base score
        
        // Resource acquisition locations (coin flip - 50% success)
        const resourceLocations = {
            'port': 'mummers',
            'war': 'slaves', 
            'forest': 'animals'
        };
        
        if (resourceLocations[locationId]) {
            const resource = resourceLocations[locationId];
            const currentAmount = this.safeGetResource(player, resource);
            // Higher score if we need the resource
            if (currentAmount === 0) {
                score = 4; // High priority if we have none
            } else if (currentAmount < 2) {
                score = 3; // Good if we're low
            } else {
                score = 1.5; // Lower priority if we have some
            }
            // Reduce score if low on workers (risky)
            const availableWorkers = this.safeGetAvailableWorkers(player);
            if (availableWorkers <= 2) {
                score *= 0.5; // Risky when low on workers
            }
        }
        
        // Market positions - valuable for buying resources
        const marketLocations = {
            'mummersMarket': 'mummers',
            'animalsMarket': 'animals',
            'slavesMarket': 'slaves'
        };
        
        if (marketLocations[locationId]) {
            const resource = marketLocations[locationId];
            const currentAmount = this.safeGetResource(player, resource);
            if (currentAmount === 0) {
                score = 3.5; // High priority if we need it
            } else if (currentAmount < 2) {
                score = 2.5;
            } else {
                score = 1.5;
            }
        }
        
        // Track boosters - temporary +1
        const trackLocations = {
            'townSquare': 'population',
            'palace': 'empire',
            'pantheon': 'church'
        };
        
        if (trackLocations[locationId]) {
            const track = trackLocations[locationId];
            const value = this.safeGetTrack(player, track);
            if (value >= 13) {
                score = 6; // Could win!
            } else if (value >= 10) {
                score = 4; // Getting close
            } else {
                score = 2; // Moderate value
            }
            // Palace also affects turn order
            if (locationId === 'palace') {
                score += 0.5;
            }
        }
        
        // Prison - essential for execution acts
        if (locationId === 'prison') {
            const prisoners = this.safeGetResource(player, 'prisoners');
            if (prisoners === 0) {
                score = 3.5; // Need prisoners for execution acts
            } else if (prisoners < 2) {
                score = 2.5;
            } else {
                score = 1; // Have enough
            }
        }
        
        // Guildhall - convert slave to worker (expensive but valuable long-term)
        if (locationId === 'guildhall') {
            const slaves = this.safeGetResource(player, 'slaves');
            const coins = this.safeGetResource(player, 'coins');
            const availableWorkers = this.safeGetAvailableWorkers(player);
            if (slaves >= 1 && coins >= 6 && availableWorkers <= 2) {
                score = 3; // Good investment when low on workers
            } else {
                score = 1; // Lower priority otherwise
            }
        }
        
        // Oracle - information (situational)
        if (locationId === 'oracle') {
            score = 1.5; // Moderate value for information
        }
        
        // Gamblers Den - skip (not implemented)
        if (locationId === 'gamblersDen') {
            score = 0;
        }
        
        return score;
    }

    /**
     * Score a resource purchase decision
     * @param {string} resourceType - Resource type to buy
     * @param {object} player - AI player
     * @param {object} gameState - Current game state
     * @returns {number} Score (higher is better)
     */
    scoreResourcePurchase(resourceType, player, gameState) {
        // Safety checks
        if (!resourceType || !player) return 0;
        
        let score = 0;
        
        const currentAmount = this.safeGetResource(player, resourceType);
        
        // Base need score
        if (currentAmount === 0) {
            score = 5; // High priority
        } else if (currentAmount < 2) {
            score = 3;
        } else if (currentAmount < 4) {
            score = 1.5;
        } else {
            score = 0.5; // Low priority if we have plenty
        }
        
        // Check if any available acts need this resource
        try {
            const availableActs = gameState?.availableActs;
            const allActs = [
                ...(availableActs?.regular || []),
                ...(availableActs?.execution || [])
            ];
            
            for (const act of allActs) {
                const cost = act.resourceCost?.[resourceType] || 0;
                if (cost > 0 && currentAmount < cost) {
                    score += 2; // Bonus if we need it for an act
                }
            }
        } catch (e) {
            // Ignore errors in act checking
        }
        
        return score;
    }

    /**
     * Select option using weighted random based on scores and randomness
     * @param {Array} options - Array of {option, score} objects
     * @returns {*} Selected option or null
     */
    selectOption(options) {
        // Safety check
        if (!options || !Array.isArray(options) || options.length === 0) {
            return null;
        }
        
        // Filter out invalid options (score -Infinity or undefined)
        const validOptions = options.filter(o => 
            o && o.option !== undefined && o.score !== undefined && o.score > -Infinity
        );
        
        if (validOptions.length === 0) return null;
        
        // Sort by score descending
        validOptions.sort((a, b) => (b.score || 0) - (a.score || 0));
        
        // If randomness is 0, always pick best
        if (this.randomness <= 0) {
            return validOptions[0].option;
        }
        
        // If randomness is 1, pick completely random
        if (this.randomness >= 1) {
            const randomIndex = Math.floor(Math.random() * validOptions.length);
            return validOptions[randomIndex].option;
        }
        
        // Weighted random selection based on randomness
        // Lower randomness = higher chance of picking best option
        const roll = Math.random();
        
        if (roll > this.randomness) {
            // Pick best option
            return validOptions[0].option;
        } else {
            // Pick weighted random from all valid options
            // Use softmax-like weighting based on scores
            const minScore = Math.min(...validOptions.map(o => o.score || 0));
            const normalizedScores = validOptions.map(o => ({
                ...o,
                weight: Math.max(0.1, (o.score || 0) - minScore + 1) // Ensure positive weights
            }));
            
            const totalWeight = normalizedScores.reduce((sum, o) => sum + (o.weight || 0.1), 0);
            let randomValue = Math.random() * totalWeight;
            
            for (const option of normalizedScores) {
                randomValue -= (option.weight || 0.1);
                if (randomValue <= 0) {
                    return option.option;
                }
            }
            
            // Fallback to best option
            return validOptions[0].option;
        }
    }

    /**
     * Select best option (ignores randomness - for must-do actions)
     * @param {Array} options - Array of {option, score} objects
     * @returns {*} Best option or null
     */
    selectBestOption(options) {
        // Safety check
        if (!options || !Array.isArray(options) || options.length === 0) {
            return null;
        }
        
        // Filter out invalid options (score -Infinity or undefined)
        const validOptions = options.filter(o => 
            o && o.option !== undefined && o.score !== undefined && o.score > -Infinity
        );
        
        if (validOptions.length === 0) return null;
        
        // Sort by score descending
        validOptions.sort((a, b) => (b.score || 0) - (a.score || 0));
        
        // Return the best option
        return validOptions[0].option;
    }

    /**
     * Decide whether and how to bid on an act
     * @param {object} gameState - Current game state
     * @param {object} player - AI player
     * @param {object} config - Game config
     * @returns {object} { type: 'bid'|'pass', actId?, coins? }
     */
    decideBid(gameState, player, config) {
        // Safety: always return pass if invalid inputs
        if (!gameState || !player) {
            return { type: 'pass' };
        }
        
        // Configure from config if available
        this.configureFromConfig(config);
        
        // Get available acts
        const availableActs = gameState.availableActs;
        const allActs = [
            ...(availableActs?.regular || []),
            ...(availableActs?.execution || [])
        ];
        
        // Edge case: No acts available
        if (!allActs || allActs.length === 0) {
            return { type: 'pass' };
        }
        
        // Check if we have coins to bid
        const playerCoins = this.safeGetResource(player, 'coins');
        const minBid = config?.limits?.minBid || 1;
        
        // Edge case: No coins - check if we can pass
        if (playerCoins < minBid) {
            // Even if first player, can't bid without coins
            return { type: 'pass' };
        }
        
        // Check first player rule: first player MUST bid before passing
        const isFirst = this.isFirstPlayer(gameState, player);
        const hasBid = this.hasPlayerBid(player);
        const mustBid = isFirst && !hasBid;
        
        // AI should sometimes pass even if it could bid
        // This prevents infinite bidding loops
        // After placing at least one bid, AI has a chance to pass
        if (!mustBid && hasBid) {
            // Get number of bids already placed
            const bidCount = player.bids ? player.bids.length : 0;
            
            // Probability to pass increases with number of bids already placed
            // After 1 bid: 30% chance to pass
            // After 2 bids: 50% chance to pass
            // After 3+ bids: 70% chance to pass
            let passProbability = 0.3;
            if (bidCount >= 3) {
                passProbability = 0.7;
            } else if (bidCount >= 2) {
                passProbability = 0.5;
            }
            
            // Adjust based on difficulty - harder AI is more strategic (bids more)
            // Easy AI passes more often, hard AI bids more strategically
            if (this.randomness > 0.6) {
                // Easy: pass more often
                passProbability += 0.2;
            } else if (this.randomness < 0.3) {
                // Hard: pass less often (more strategic bidding)
                passProbability -= 0.1;
            }
            
            // Clamp probability
            passProbability = Math.max(0.1, Math.min(0.9, passProbability));
            
            if (Math.random() < passProbability) {
                return { type: 'pass' };
            }
        }
        
        // Score all acts
        const scoredActs = allActs.map(act => ({
            option: act,
            score: this.scoreAct(act, player, gameState)
        }));
        
        // Use weighted selection based on difficulty
        const selectedAct = this.selectOption(scoredActs);
        
        // Edge case: No valid acts to bid on
        if (!selectedAct) {
            if (mustBid) {
                // First player rule: MUST bid even if no good options
                // Pick any act with minimum bid
                const anyAct = allActs[0];
                if (anyAct && anyAct.id) {
                    return {
                        type: 'bid',
                        actId: anyAct.id,
                        coins: minBid
                    };
                }
            }
            return { type: 'pass' };
        }
        
        // Determine bid amount based on act value and difficulty
        const actScore = this.scoreAct(selectedAct, player, gameState);
        let bidAmount = minBid;
        
        // Hard AI bids more strategically, easy AI bids more randomly
        if (this.randomness < 0.3) {
            // Hard: precise bidding based on score
            if (actScore >= 8) {
                bidAmount = Math.min(3, playerCoins);
            } else if (actScore >= 4) {
                bidAmount = Math.min(2, playerCoins);
            }
        } else if (this.randomness < 0.6) {
            // Medium: somewhat strategic
            if (actScore >= 6) {
                bidAmount = Math.min(2 + Math.floor(Math.random() * 2), playerCoins);
            } else {
                bidAmount = Math.min(1 + Math.floor(Math.random() * 2), playerCoins);
            }
        } else {
            // Easy: random bidding 1-3
            bidAmount = Math.min(1 + Math.floor(Math.random() * 3), playerCoins);
        }
        
        // Ensure bid amount is valid
        bidAmount = Math.max(minBid, Math.min(bidAmount, playerCoins));
        
        // Build bid action
        const bidAction = {
            type: 'bid',
            actId: selectedAct.id,
            coins: bidAmount
        };
        
        // NOTE: gameState from getState() is a plain object, not GameState instance
        // So we can't use validateBid which expects gameState.getCurrentPlayer()
        // The actual validation will happen in GameEngine.executeAction() which has the real GameState
        // Just do basic sanity checks here
        if (!bidAction.actId) {
            if (mustBid && allActs[0]) {
                return {
                    type: 'bid',
                    actId: allActs[0].id,
                    coins: minBid
                };
            }
            return { type: 'pass' };
        }
        
        if (bidAmount < minBid || bidAmount > playerCoins) {
            if (mustBid && allActs[0]) {
                return {
                    type: 'bid',
                    actId: allActs[0].id,
                    coins: minBid
                };
            }
            return { type: 'pass' };
        }
        
        return bidAction;
    }

    /**
     * Decide whether and where to place a worker
     * @param {object} gameState - Current game state
     * @param {object} player - AI player
     * @param {object} config - Game config
     * @returns {object} { type: 'placeWorker'|'pass', locationId? }
     */
    decideWorkerPlacement(gameState, player, config) {
        // Safety: always return pass if invalid inputs
        if (!gameState || !player) {
            return { type: 'pass' };
        }
        
        // Configure from config if available
        this.configureFromConfig(config);
        
        // Edge case: No available workers
        const availableWorkers = this.safeGetAvailableWorkers(player);
        if (availableWorkers <= 0) {
            return { type: 'pass' };
        }
        
        // Edge case: No coins to pay worker cost
        const playerCoins = this.safeGetResource(player, 'coins');
        const workerCost = (config?.limits?.workerDeployCost || 1) + (gameState.workerCostModifier || 0);
        if (playerCoins < workerCost) {
            return { type: 'pass' };
        }
        
        // Use rules.js to get valid locations
        let validLocations = [];
        try {
            validLocations = getValidWorkerLocations(gameState, player, config) || [];
        } catch (e) {
            return { type: 'pass' };
        }
        
        // Edge case: No valid locations
        if (!validLocations || validLocations.length === 0) {
            return { type: 'pass' };
        }
        
        // Score all valid locations
        const scoredLocations = validLocations.map(locationId => ({
            option: locationId,
            score: this.scoreLocation(locationId, player, gameState, config)
        }));
        
        // Use weighted selection based on difficulty
        const selectedLocation = this.selectOption(scoredLocations);
        
        // Edge case: No location selected
        if (!selectedLocation) {
            return { type: 'pass' };
        }
        
        // Check if score is worth placing (threshold check)
        // Easy AI has lower threshold, more likely to place workers
        const threshold = this.randomness > 0.5 ? 0.5 : 1;
        const selectedScore = scoredLocations.find(s => s.option === selectedLocation)?.score || 0;
        if (selectedScore < threshold) {
            return { type: 'pass' };
        }
        
        return {
            type: 'placeWorker',
            locationId: selectedLocation
        };
    }

    /**
     * Decide whether to buy a resource from the market
     * @param {object} gameState - Current game state
     * @param {object} player - AI player
     * @param {object} config - Game config
     * @returns {object} { type: 'buyResource'|'pass', resourceType? }
     */
    decideMarketPurchase(gameState, player, config) {
        // Safety: always return pass if invalid inputs
        if (!gameState || !player) {
            return { type: 'pass' };
        }
        
        // Configure from config if available
        this.configureFromConfig(config);
        
        // Edge case: No current market
        const currentMarket = gameState.currentMarket;
        if (!currentMarket) {
            return { type: 'pass' };
        }
        
        // Edge case: Player not in market queue
        const queue = gameState.marketQueues?.[currentMarket] || [];
        if (!queue.includes(player.id)) {
            return { type: 'pass' };
        }
        
        // Edge case: No coins
        const playerCoins = this.safeGetResource(player, 'coins');
        if (playerCoins <= 0) {
            return { type: 'pass' };
        }
        
        // Edge case: Can't afford current price
        const markets = gameState.markets;
        const marketState = markets?.[currentMarket];
        const price = marketState?.currentPrice;
        
        if (!price || playerCoins < price) {
            return { type: 'pass' };
        }
        
        // Edge case: Market is empty (no resources available)
        if (marketState?.available === 0 || marketState?.stock === 0) {
            return { type: 'pass' };
        }
        
        // Score the purchase
        const purchaseScore = this.scoreResourcePurchase(currentMarket, player, gameState);
        
        // Decide based on score vs price
        // Easy AI is more likely to buy, hard AI is more selective
        const valueRatio = purchaseScore / price;
        const buyThreshold = this.randomness > 0.5 ? 0.3 : 0.5; // Easy: 0.3, Hard: 0.5
        
        // Add randomness to buy decision
        if (Math.random() < this.randomness) {
            // Random decision - 50% chance to buy if affordable
            if (Math.random() < 0.5) {
                return { type: 'pass' };
            }
        } else {
            // Strategic decision based on value ratio
            if (valueRatio < buyThreshold) {
                return { type: 'pass' };
            }
        }
        
        // Create buy action
        const buyAction = {
            type: 'buyResource',
            resourceType: currentMarket
        };
        
        // Validate the buy action
        try {
            const validation = validateResourcePurchase(buyAction, gameState, config);
            if (!validation.valid) {
                return { type: 'pass' };
            }
        } catch (e) {
            return { type: 'pass' };
        }
        
        return buyAction;
    }

    /**
     * Main decision method - returns action based on current phase
     * @param {object} gameState - Current game state
     * @param {object} player - AI player
     * @param {object} config - Game config
     * @returns {object} Action to execute
     */
    decide(gameState, player, config) {
        // Safety: always return pass if invalid inputs
        if (!gameState || !player) {
            return { type: 'pass' };
        }
        
        const phase = gameState.currentPhase;
        
        // Safety: return pass for unknown phases
        if (!phase) {
            return { type: 'pass' };
        }
        
        try {
            switch (phase) {
                case 'bidOnActs':
                    return this.decideBid(gameState, player, config);
                
                case 'placeWorkers':
                    return this.decideWorkerPlacement(gameState, player, config);
                
                case 'buyResources':
                    return this.decideMarketPurchase(gameState, player, config);
                
                default:
                    return { type: 'pass' };
            }
        } catch (e) {
            // Safety: return pass on any error
            return { type: 'pass' };
        }
    }
}
