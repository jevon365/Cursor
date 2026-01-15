/**
 * Rules - Centralized rule validation and game rule logic
 * 
 * Contains all validation functions for game actions and state.
 * Imported by Phases.js and GameEngine.js.
 */

/**
 * Validate a bid action
 * @param {object} action - The bid action { type: 'bid', actId, coins }
 * @param {object} gameState - Current game state
 * @param {object} config - Game config
 * @returns {object} { valid: boolean, reason?: string }
 */
export function validateBid(action, gameState, config) {
    const currentPlayer = gameState.getCurrentPlayer();
    const turnOrder = gameState.turnOrder || gameState.players.map((_, idx) => idx);
    const isFirstPlayer = gameState.currentPlayerIndex === turnOrder[0];
    
    if (action.type === 'pass') {
        // First player must bid initially (cannot pass on first turn)
        if (isFirstPlayer) {
            const hasBid = currentPlayer.bids && currentPlayer.bids.length > 0;
            if (!hasBid) {
                return { valid: false, reason: 'First player must place at least one bid before passing' };
            }
        }
        return { valid: true };
    }
    
    if (action.type === 'bid') {
        if (!action.actId) {
            return { valid: false, reason: 'No act specified' };
        }
        if (!action.coins || action.coins < config.limits.minBid) {
            return { valid: false, reason: 'Bid too low' };
        }
        if (currentPlayer.getResource('coins') < action.coins) {
            return { valid: false, reason: 'Insufficient coins' };
        }
        return { valid: true };
    }
    
    return { valid: false, reason: 'Invalid action type for bidding phase' };
}

/**
 * Validate a worker placement action
 * @param {object} action - The action { type: 'placeWorker', locationId }
 * @param {object} gameState - Current game state
 * @param {object} config - Game config
 * @returns {object} { valid: boolean, reason?: string }
 */
export function validateWorkerPlacement(action, gameState, config) {
    const currentPlayer = gameState.getCurrentPlayer();
    
    if (action.type === 'pass') {
        return { valid: true };
    }
    
    if (action.type !== 'placeWorker') {
        return { valid: false, reason: 'Invalid action type for worker placement phase' };
    }
    
    // Check player has available workers
    if (currentPlayer.workers.available <= 0) {
        return { valid: false, reason: 'No available workers' };
    }
    
    // Check location specified
    if (!action.locationId) {
        return { valid: false, reason: 'No location specified' };
    }
    
    // Check location exists
    const space = gameState.board.getSpace(action.locationId);
    if (!space) {
        return { valid: false, reason: 'Invalid location' };
    }
    
    // Check location is not disabled by event
    if (gameState.disabledLocations && gameState.disabledLocations.includes(action.locationId)) {
        return { valid: false, reason: 'Location is disabled this round' };
    }
    
    // Check worker deployment cost
    const workerCost = config.limits.workerDeployCost + (gameState.workerCostModifier || 0);
    if (currentPlayer.getResource('coins') < workerCost) {
        return { valid: false, reason: 'Insufficient coins to deploy worker' };
    }
    
    // Check if player can place more workers at this location (capacity check)
    const availableSpaces = gameState.board.getAvailableSpaces(currentPlayer.id);
    if (!availableSpaces.find(s => s.id === action.locationId)) {
        return { valid: false, reason: 'Cannot place worker at this location (max reached or stock depleted)' };
    }
    
    // Location-specific validation
    const location = config.locations[action.locationId];
    if (location) {
        const locationValidation = validateLocationRequirements(action.locationId, location, currentPlayer, gameState, config);
        if (!locationValidation.valid) {
            return locationValidation;
        }
    }
    
    return { valid: true };
}

/**
 * Validate location-specific requirements
 * @param {string} locationId - Location ID
 * @param {object} location - Location config
 * @param {object} player - Current player
 * @param {object} gameState - Current game state
 * @param {object} config - Game config
 * @returns {object} { valid: boolean, reason?: string }
 */
export function validateLocationRequirements(locationId, location, player, gameState, config) {
    const workerCost = config.limits.workerDeployCost + (gameState.workerCostModifier || 0);
    
    // Oracle: Must have animal to sacrifice
    if (locationId === 'oracle') {
        if (player.getResource('animals') < 1) {
            return { valid: false, reason: 'Oracle requires 1 animal to use' };
        }
    }
    
    // Guildhall: Must have slave + 5 coins + worker supply not empty
    if (locationId === 'guildhall') {
        if (player.getResource('slaves') < 1) {
            return { valid: false, reason: 'Guildhall requires 1 slave to use' };
        }
        if (player.getResource('coins') < workerCost + 5) {
            return { valid: false, reason: 'Guildhall requires 5 coins (in addition to worker cost) to use' };
        }
        if (gameState.getSupplyAmount('workers') < 1) {
            return { valid: false, reason: 'No workers available in supply for Guildhall' };
        }
    }
    
    // Resource conversion locations - check conversion cost
    if (location.effectType === 'resourceConversion' && location.conversionCost) {
        for (const [resource, amount] of Object.entries(location.conversionCost)) {
            const playerAmount = resource === 'coins' ? player.getResource('coins') : player.getResource(resource);
            if ((playerAmount || 0) < amount) {
                return { valid: false, reason: `Insufficient ${resource} for ${location.name}` };
            }
        }
    }
    
    // Information locations - check information cost
    if (location.effectType === 'information' && location.informationCost) {
        for (const [resource, amount] of Object.entries(location.informationCost)) {
            if ((player.getResource(resource) || 0) < amount) {
                return { valid: false, reason: `${location.name} requires ${amount} ${resource}` };
            }
        }
    }
    
    return { valid: true };
}

/**
 * Validate a resource purchase action
 * @param {object} action - The action { type: 'buyResource', resourceType }
 * @param {object} gameState - Current game state
 * @param {object} config - Game config
 * @returns {object} { valid: boolean, reason?: string }
 */
export function validateResourcePurchase(action, gameState, config) {
    const currentPlayer = gameState.getCurrentPlayer();
    
    if (action.type === 'pass') {
        return { valid: true };
    }
    
    if (action.type !== 'buyResource') {
        return { valid: false, reason: 'Invalid action type for buy resources phase' };
    }
    
    // Check resource type specified
    if (!action.resourceType) {
        return { valid: false, reason: 'No resource type specified' };
    }
    
    // Check if this is the current market being resolved
    if (gameState.currentMarket !== action.resourceType) {
        return { 
            valid: false, 
            reason: `You can only buy from ${gameState.currentMarket || 'the current'} market right now. Markets are resolved one at a time.` 
        };
    }
    
    // Check if player has worker in the market queue
    const marketQueue = gameState.marketQueues[action.resourceType];
    if (!marketQueue || !marketQueue.includes(currentPlayer.id)) {
        return { valid: false, reason: `You must have a worker in ${action.resourceType} market to buy this resource` };
    }
    
    return { valid: true };
}

/**
 * Validate any action based on current phase
 * @param {object} action - The action to validate
 * @param {object} gameState - Current game state
 * @param {object} config - Game config
 * @returns {object} { valid: boolean, reason?: string }
 */
export function validateAction(action, gameState, config) {
    const currentPhase = gameState.currentPhase;
    
    if (!currentPhase) {
        return { valid: false, reason: 'No active phase' };
    }
    
    switch (currentPhase) {
        case 'bidOnActs':
            return validateBid(action, gameState, config);
        
        case 'placeWorkers':
            return validateWorkerPlacement(action, gameState, config);
        
        case 'buyResources':
            return validateResourcePurchase(action, gameState, config);
        
        case 'performActs':
        case 'cleanup':
            // Automatic phases - only pass is valid
            if (action.type === 'pass') {
                return { valid: true };
            }
            return { valid: false, reason: 'No player actions allowed in this phase' };
        
        default:
            return { valid: false, reason: 'Unknown phase' };
    }
}

/**
 * Check if a player can participate in an act
 * @param {object} player - Player to check
 * @param {object} act - Act card config
 * @returns {object} { canParticipate: boolean, reason?: string }
 */
export function canParticipateInAct(player, act) {
    // Check resource requirements
    if (act.resourceCost) {
        for (const [resourceType, amount] of Object.entries(act.resourceCost)) {
            if ((player.getResource(resourceType) || 0) < amount) {
                return { canParticipate: false, reason: `Insufficient ${resourceType}` };
            }
        }
    }
    
    // Check coin cost (separate from bid)
    if (act.coinCost && (player.getResource('coins') || 0) < act.coinCost) {
        return { canParticipate: false, reason: 'Insufficient coins for act cost' };
    }
    
    return { canParticipate: true };
}

/**
 * Check win conditions for a player
 * @param {object} player - Player to check
 * @param {object} config - Game config
 * @returns {object} { won: boolean, condition?: string }
 */
export function checkWinConditions(player, config) {
    const threshold = config.winConditions.trackVictory.threshold;
    
    // Check each victory track
    for (const trackName of ['empire', 'population', 'church']) {
        if (player.getTrack(trackName) >= threshold) {
            return { 
                won: true, 
                condition: `${trackName} track victory (reached ${threshold})` 
            };
        }
    }
    
    return { won: false };
}

/**
 * Check if game should end (any win condition met or round limit reached)
 * @param {object} gameState - Current game state
 * @param {object} config - Game config
 * @returns {object} { gameOver: boolean, reason?: string }
 */
export function checkGameOver(gameState, config) {
    // Check track victory for each player
    for (const player of gameState.players) {
        const winCheck = checkWinConditions(player, config);
        if (winCheck.won) {
            return { gameOver: true, reason: winCheck.condition, winner: player };
        }
    }
    
    // Check round limit
    if (gameState.round > config.winConditions.roundLimit.maxRounds) {
        return { gameOver: true, reason: 'Round limit reached' };
    }
    
    return { gameOver: false };
}

/**
 * Validate game state consistency
 * @param {object} gameState - Game state to validate
 * @param {object} config - Game config
 * @returns {object} { valid: boolean, errors: string[] }
 */
export function validateGameState(gameState, config) {
    const errors = [];
    
    // Check player count
    if (!gameState.players || gameState.players.length < config.setup.minPlayers) {
        errors.push('Not enough players');
    }
    if (gameState.players && gameState.players.length > config.setup.maxPlayers) {
        errors.push('Too many players');
    }
    
    // Check current player index
    if (gameState.currentPlayerIndex < 0 || gameState.currentPlayerIndex >= gameState.players.length) {
        errors.push('Invalid current player index');
    }
    
    // Check round number
    if (gameState.round < 1) {
        errors.push('Invalid round number');
    }
    
    // Validate each player
    gameState.players.forEach((player, idx) => {
        // Check resources are non-negative
        if (player.getResource('coins') < 0) {
            errors.push(`Player ${idx} has negative coins`);
        }
        
        // Check workers
        if (player.workers.available < 0) {
            errors.push(`Player ${idx} has negative available workers`);
        }
        if (player.workers.placed < 0) {
            errors.push(`Player ${idx} has negative placed workers`);
        }
        
        // Check tracks are within bounds
        for (const trackName of ['empire', 'population', 'church']) {
            const trackConfig = config.victoryTracks[trackName];
            const value = player.getTrack(trackName);
            if (value < trackConfig.min || value > trackConfig.max) {
                errors.push(`Player ${idx} ${trackName} track out of bounds: ${value}`);
            }
        }
    });
    
    return {
        valid: errors.length === 0,
        errors: errors
    };
}

/**
 * Get valid locations for worker placement
 * @param {object} gameState - Current game state
 * @param {object} player - Player placing worker
 * @param {object} config - Game config
 * @returns {string[]} Array of valid location IDs
 */
export function getValidWorkerLocations(gameState, player, config) {
    const validLocations = [];
    const workerCost = config.limits.workerDeployCost + (gameState.workerCostModifier || 0);
    
    // Check basic requirements
    if (player.workers.available <= 0) {
        return [];
    }
    if (player.getResource('coins') < workerCost) {
        return [];
    }
    
    const availableSpaces = gameState.board.getAvailableSpaces(player.id);
    
    for (const space of availableSpaces) {
        // Skip disabled locations
        if (gameState.disabledLocations && gameState.disabledLocations.includes(space.id)) {
            continue;
        }
        
        // Check location-specific requirements
        const location = config.locations[space.id];
        if (location) {
            const validation = validateLocationRequirements(space.id, location, player, gameState, config);
            if (!validation.valid) {
                continue;
            }
        }
        
        validLocations.push(space.id);
    }
    
    return validLocations;
}
