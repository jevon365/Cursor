/**
 * Player - Represents a player in the game
 * Supports both human and AI players
 */

export class Player {
    constructor(id, name, isAI = false) {
        this.id = id;
        this.name = name;
        this.isAI = isAI;
        this.resources = {};
        this.workers = {
            available: 0,
            placed: 0
        };
        // Three victory tracks: Empire, Population, Church
        this.victoryTracks = {
            empire: 0,
            population: 0,
            church: 0
        };
        this.actions = [];
        this.bids = []; // Bids placed on act cards this round
    }

    /**
     * Initialize player with starting resources and tracks
     */
    initialize(startingResources, startingTracks = {}) {
        this.resources = { ...startingResources };
        
        // Initialize workers if specified
        if (startingResources.workers !== undefined) {
            this.workers.available = startingResources.workers;
            this.workers.placed = 0;
        }
        
        // Initialize victory tracks
        this.victoryTracks = {
            empire: startingTracks.empire || 0,
            population: startingTracks.population || 0,
            church: startingTracks.church || 0
        };
        
        this.actions = [];
        this.bids = [];
    }

    /**
     * Add resources to player
     */
    addResource(resourceType, amount) {
        if (!this.resources[resourceType]) {
            this.resources[resourceType] = 0;
        }
        this.resources[resourceType] += amount;
    }

    /**
     * Remove resources from player (returns false if insufficient)
     */
    removeResource(resourceType, amount) {
        if (!this.resources[resourceType] || this.resources[resourceType] < amount) {
            return false;
        }
        this.resources[resourceType] -= amount;
        return true;
    }

    /**
     * Check if player has enough resources
     */
    hasResource(resourceType, amount) {
        return this.resources[resourceType] >= amount;
    }

    /**
     * Get resource amount
     */
    getResource(resourceType) {
        return this.resources[resourceType] || 0;
    }

    /**
     * Place a worker
     */
    placeWorker() {
        if (this.workers.available > 0) {
            this.workers.available--;
            this.workers.placed++;
            return true;
        }
        return false;
    }

    /**
     * Return a worker
     */
    returnWorker() {
        if (this.workers.placed > 0) {
            this.workers.placed--;
            this.workers.available++;
            return true;
        }
        return false;
    }

    /**
     * Update a victory track
     */
    updateTrack(trackName, amount) {
        if (this.victoryTracks.hasOwnProperty(trackName)) {
            this.victoryTracks[trackName] += amount;
            // Clamp to min/max if needed (handled by game engine)
            return this.victoryTracks[trackName];
        }
        return null;
    }

    /**
     * Get track value
     */
    getTrack(trackName) {
        return this.victoryTracks[trackName] || 0;
    }

    /**
     * Get total of all tracks (for win condition)
     */
    getTotalTracks() {
        return this.victoryTracks.empire + 
               this.victoryTracks.population + 
               this.victoryTracks.church;
    }

    /**
     * Get leader on a specific track (compared to other players)
     */
    isLeaderOnTrack(trackName, allPlayers) {
        const myValue = this.getTrack(trackName);
        return allPlayers.every(p => p.id === this.id || p.getTrack(trackName) <= myValue);
    }

    /**
     * Place a bid on an act card
     */
    placeBid(actId, coins) {
        if (this.resources.coins >= coins) {
            this.bids.push({ actId, coins });
            this.removeResource('coins', coins);
            return true;
        }
        return false;
    }

    /**
     * Clear bids (for cleanup phase)
     */
    clearBids() {
        this.bids = [];
    }

    /**
     * Get total resources (for AI evaluation and tiebreaker)
     */
    getTotalResources() {
        return Object.values(this.resources).reduce((sum, val) => sum + val, 0);
    }

    /**
     * Serialize player state
     */
    serialize() {
        return {
            id: this.id,
            name: this.name,
            isAI: this.isAI,
            resources: { ...this.resources },
            workers: { ...this.workers },
            victoryTracks: { ...this.victoryTracks },
            actions: [...this.actions],
            bids: [...this.bids]
        };
    }

    /**
     * Deserialize player state
     */
    deserialize(data) {
        this.resources = data.resources;
        this.workers = data.workers;
        this.victoryTracks = data.victoryTracks || { empire: 0, population: 0, church: 0 };
        this.actions = data.actions;
        this.bids = data.bids || [];
    }

    /**
     * Get player summary for display
     */
    getSummary() {
        return {
            name: this.name,
            resources: { ...this.resources },
            workers: { ...this.workers },
            victoryTracks: { ...this.victoryTracks },
            totalTracks: this.getTotalTracks()
        };
    }
}
