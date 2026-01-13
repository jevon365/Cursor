/**
 * Board - Manages the game board and worker placement spaces
 */

export class Board {
    constructor(config) {
        this.config = config;
        this.spaces = [];
        this.workerPlacements = {}; // spaceId -> [playerId, playerId, ...]
        this.initializeSpaces();
    }

    /**
     * Initialize board spaces from config
     */
    initializeSpaces() {
        this.spaces = Object.entries(this.config.locations).map(([id, locationData]) => ({
            id: id,
            ...locationData
        }));
        
        // Initialize worker placements tracking
        this.workerPlacements = {};
        this.spaces.forEach(space => {
            this.workerPlacements[space.id] = {};
        });
    }

    /**
     * Get all available spaces for worker placement
     */
    getAvailableSpaces(playerId) {
        return this.spaces.filter(space => {
            const playerPlacements = this.workerPlacements[space.id]?.[playerId] || 0;
            
            // Check if player has already placed max workers at this location
            if (space.maxWorkersPerPlayer !== null && playerPlacements >= space.maxWorkersPerPlayer) {
                return false;
            }
            
            // Check if location has stock (for prison)
            if (space.type === 'stock' && (!space.stock || space.stock <= 0)) {
                return false;
            }
            
            return true;
        });
    }

    /**
     * Place a worker on a space
     */
    placeWorker(spaceId, playerId) {
        const space = this.getSpace(spaceId);
        if (!space) {
            return { success: false, reason: 'Invalid space' };
        }
        
        // Initialize tracking if needed
        if (!this.workerPlacements[spaceId]) {
            this.workerPlacements[spaceId] = {};
        }
        
        const playerPlacements = this.workerPlacements[spaceId][playerId] || 0;
        
        // Check max workers per player (except prison)
        if (space.maxWorkersPerPlayer !== null && playerPlacements >= space.maxWorkersPerPlayer) {
            return { success: false, reason: 'Max workers already placed at this location' };
        }
        
        // Check stock for stock-based locations (prison)
        if (space.type === 'stock') {
            if (!space.stock || space.stock <= 0) {
                return { success: false, reason: 'Location stock depleted' };
            }
            space.stock--;
        }
        
        // Place worker
        this.workerPlacements[spaceId][playerId] = (playerPlacements || 0) + 1;
        
        return { success: true, stock: space.stock };
    }

    /**
     * Remove a worker from a space
     */
    removeWorker(spaceId, playerId) {
        if (!this.workerPlacements[spaceId] || !this.workerPlacements[spaceId][playerId]) {
            return false;
        }
        
        const space = this.getSpace(spaceId);
        if (space && space.type === 'stock') {
            // Return stock if it's a stock location
            space.stock = (space.stock || 0) + 1;
        }
        
        this.workerPlacements[spaceId][playerId] = Math.max(0, (this.workerPlacements[spaceId][playerId] || 0) - 1);
        
        if (this.workerPlacements[spaceId][playerId] === 0) {
            delete this.workerPlacements[spaceId][playerId];
        }
        
        return true;
    }

    /**
     * Get workers on a space (all players)
     */
    getWorkersOnSpace(spaceId) {
        const placements = this.workerPlacements[spaceId] || {};
        return Object.entries(placements).map(([playerId, count]) => ({
            playerId: parseInt(playerId),
            count: count
        }));
    }

    /**
     * Get worker count for a specific player on a space
     */
    getPlayerWorkersOnSpace(spaceId, playerId) {
        return this.workerPlacements[spaceId]?.[playerId] || 0;
    }

    /**
     * Get space by ID
     */
    getSpace(spaceId) {
        return this.spaces.find(s => s.id === spaceId);
    }

    /**
     * Clear all workers (for phase transitions or game reset)
     */
    clearWorkers() {
        this.workerPlacements = {};
        // Reset stock locations
        this.spaces.forEach(space => {
            if (space.type === 'stock' && this.config.locations[space.id]) {
                space.stock = this.config.locations[space.id].stock || 0;
            }
        });
    }

    /**
     * Serialize board state
     */
    serialize() {
        return {
            spaces: this.spaces,
            workerPlacements: this.workerPlacements
        };
    }

    /**
     * Deserialize board state
     */
    deserialize(data) {
        this.spaces = data.spaces;
        this.workerPlacements = data.workerPlacements;
    }
}
