/**
 * GameState - Manages the current state of the game
 * 
 * The game state is pure and serializable for save/load functionality.
 */

import { Player } from './Player.js';

export class GameState {
    constructor(config) {
        this.config = config;
        this.players = [];
        this.currentPlayerIndex = 0;
        this.currentPhase = null;
        this.round = 1;
        this.turn = 1;
        this.gameOver = false;
        this.winner = null;
        this.history = []; // Action history for replay/debugging
        this.board = null; // Will be set by Board class
        this.turnOrder = null; // Current turn order for phase (array of player indices)
        this.passedPlayers = []; // Player indices who have passed in current phase
        // Event and act card state
        this.blockedTracks = []; // Tracks blocked by current event
        this.disabledLocations = []; // Locations disabled by current event
        this.marketPriceModifier = 0; // Price modifier from events
        this.workerCostModifier = 0; // Worker cost modifier from events
        // Resource Supply - separate from markets, resources come from here for some locations
        this.resourceSupply = { ...config.setup.resourceSupply || {} };
        // Track temporary track movements (from Town Square, Palace, Pantheon)
        this.temporaryTrackMovements = {}; // playerId -> { track: amount }
        // Market queues - track order of workers placed at markets
        this.marketQueues = {
            mummers: [],
            animals: [],
            slaves: []
        };
        // Current market being resolved in Buy Resources phase
        this.currentMarket = null; // 'mummers', 'animals', 'slaves', or null
        // Oracle peeked events - store events peeked by players
        this.oraclePeekedEvents = {}; // playerId -> event card
        // Palace first player flag - player who used Palace and is first on Empire track
        this.palaceFirstPlayer = null; // playerId who should go first next round
    }

    /**
     * Initialize game state with players
     */
    initialize(players) {
        this.players = players;
        this.currentPlayerIndex = 0;
        this.round = 1;
        this.turn = 1;
        this.gameOver = false;
        this.winner = null;
        this.history = [];
        this.turnOrder = null;
        this.passedPlayers = [];
        
        // Initialize resource supply from config
        this.resourceSupply = { ...this.config.setup.resourceSupply || {} };
        this.temporaryTrackMovements = {};
        this.marketQueues = {
            mummers: [],
            animals: [],
            slaves: []
        };
        this.currentMarket = null;
        this.oraclePeekedEvents = {};
        this.palaceFirstPlayer = null;
        
        // Initialize player resources and tracks from config
        this.players.forEach(player => {
            player.initialize(
                this.config.setup.startingResources,
                this.config.setup.startingTracks
            );
        });
    }

    /**
     * Get current player
     */
    getCurrentPlayer() {
        return this.players[this.currentPlayerIndex];
    }

    /**
     * Advance to next player in turn order
     */
    nextPlayer() {
        // Use turn order if available, otherwise use sequential order
        if (this.turnOrder && this.turnOrder.length > 0) {
            const currentIndexInOrder = this.turnOrder.indexOf(this.currentPlayerIndex);
            if (currentIndexInOrder >= 0 && currentIndexInOrder < this.turnOrder.length - 1) {
                // Move to next player in turn order
                this.currentPlayerIndex = this.turnOrder[currentIndexInOrder + 1];
            } else {
                // Reached end of turn order, wrap to beginning
                this.currentPlayerIndex = this.turnOrder[0];
            }
        } else {
            // Fallback to sequential order
            this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
        }
        
        this.turn++;
        
        // Round counting is handled by phase transitions, not here
        // (Rounds increment when all phases complete, not when all players act)
    }

    /**
     * Mark current player as passed
     * @param {boolean} force - Force mark even if validation would prevent it (for safety)
     */
    markPlayerPassed(force = false) {
        // Safety check: first player in bidOnActs shouldn't be marked as passed
        // UNLESS they have already placed at least one bid
        // (validation should prevent this, but add safety check)
        if (!force && this.currentPhase === 'bidOnActs' && this.turnOrder && this.turnOrder.length > 0) {
            const firstPlayerIndex = this.turnOrder[0];
            if (this.currentPlayerIndex === firstPlayerIndex) {
                // Check if first player has already placed a bid
                const currentPlayer = this.getCurrentPlayer();
                const hasBid = currentPlayer.bids && currentPlayer.bids.length > 0;
                
                if (!hasBid) {
                    console.warn('Attempted to mark first player as passed in bidOnActs before placing a bid - prevented');
                    return false;
                }
                // First player has bid, so they can pass
            }
        }
        
        if (!this.passedPlayers.includes(this.currentPlayerIndex)) {
            this.passedPlayers.push(this.currentPlayerIndex);
            return true;
        }
        return false;
    }

    /**
     * Unmark player as passed (when they take an action after passing)
     */
    unmarkPlayerPassed() {
        const index = this.passedPlayers.indexOf(this.currentPlayerIndex);
        if (index >= 0) {
            this.passedPlayers.splice(index, 1);
        }
    }

    /**
     * Check if current player has passed
     */
    hasPlayerPassed(playerIndex) {
        return this.passedPlayers.includes(playerIndex);
    }

    /**
     * Clear passed players (called at phase start)
     */
    clearPassedPlayers() {
        this.passedPlayers = [];
    }

    /**
     * Set current phase
     */
    setPhase(phase) {
        this.currentPhase = phase;
    }

    /**
     * Record an action in history
     */
    recordAction(action) {
        this.history.push({
            round: this.round,
            turn: this.turn,
            player: this.currentPlayerIndex,
            phase: this.currentPhase,
            action: action,
            timestamp: Date.now()
        });
    }

    /**
     * Check if game is over
     */
    checkGameOver() {
        const config = this.config;
        
        // Check track victory condition
        for (const player of this.players) {
            for (const trackName of ['empire', 'population', 'church']) {
                if (player.getTrack(trackName) >= config.winConditions.trackVictory.threshold) {
                    return true;
                }
            }
        }
        
        // Check round limit
        if (this.round > config.winConditions.roundLimit.maxRounds) {
            return true;
        }
        
        return false;
    }

    /**
     * Determine winner based on win conditions
     */
    determineWinner() {
        const config = this.config;
        
        // Check for track victory first
        for (const player of this.players) {
            for (const trackName of ['empire', 'population', 'church']) {
                if (player.getTrack(trackName) >= config.winConditions.trackVictory.threshold) {
                    return player;
                }
            }
        }
        
        // Round limit reached - highest total tracks wins
        let winner = this.players[0];
        let maxTotal = winner.getTotalTracks();
        
        for (const player of this.players) {
            const total = player.getTotalTracks();
            if (total > maxTotal) {
                maxTotal = total;
                winner = player;
            } else if (total === maxTotal) {
                // Tiebreaker: most resources
                if (player.getTotalResources() > winner.getTotalResources()) {
                    winner = player;
                }
            }
        }
        
        return winner;
    }

    /**
     * End game and set winner
     */
    endGame(winner = null) {
        this.gameOver = true;
        this.winner = winner || this.determineWinner();
    }

    /**
     * Serialize game state for saving
     */
    serialize() {
        return JSON.stringify({
            players: this.players.map(p => p.serialize()),
            currentPlayerIndex: this.currentPlayerIndex,
            currentPhase: this.currentPhase,
            round: this.round,
            turn: this.turn,
            gameOver: this.gameOver,
            winner: this.winner,
            history: this.history,
            board: this.board ? this.board.serialize() : null,
            turnOrder: this.turnOrder,
            passedPlayers: this.passedPlayers,
            blockedTracks: this.blockedTracks,
            disabledLocations: this.disabledLocations,
            marketPriceModifier: this.marketPriceModifier,
            workerCostModifier: this.workerCostModifier,
            resourceSupply: this.resourceSupply,
            temporaryTrackMovements: this.temporaryTrackMovements,
            marketQueues: this.marketQueues,
            currentMarket: this.currentMarket,
            oraclePeekedEvents: this.oraclePeekedEvents || {},
            palaceFirstPlayer: this.palaceFirstPlayer
        });
    }

    /**
     * Deserialize game state from saved data
     */
    deserialize(data) {
        const state = JSON.parse(data);
        this.currentPlayerIndex = state.currentPlayerIndex;
        this.currentPhase = state.currentPhase;
        this.round = state.round;
        this.turn = state.turn;
        this.gameOver = state.gameOver;
        this.winner = state.winner;
        this.history = state.history;
        this.turnOrder = state.turnOrder || null;
        this.passedPlayers = state.passedPlayers || [];
        this.blockedTracks = state.blockedTracks || [];
        this.disabledLocations = state.disabledLocations || [];
        this.marketPriceModifier = state.marketPriceModifier || 0;
        this.workerCostModifier = state.workerCostModifier || 0;
        this.resourceSupply = state.resourceSupply || { ...this.config.setup.resourceSupply || {} };
        this.temporaryTrackMovements = state.temporaryTrackMovements || {};
        this.marketQueues = state.marketQueues || {
            mummers: [],
            animals: [],
            slaves: []
        };
        this.currentMarket = state.currentMarket || null;
        this.oraclePeekedEvents = state.oraclePeekedEvents || {};
        this.palaceFirstPlayer = state.palaceFirstPlayer || null;
        
        // Reconstruct players
        this.players = state.players.map(pData => {
            const player = new Player(pData.id, pData.name, pData.isAI);
            player.deserialize(pData);
            return player;
        });
        
        // Reconstruct board if needed
        if (state.board && this.board) {
            this.board.deserialize(state.board);
        }
    }

    /**
     * Validate current state
     */
    validate() {
        const errors = [];

        if (!this.players || this.players.length < this.config.setup.minPlayers) {
            errors.push('Not enough players');
        }

        if (this.currentPlayerIndex < 0 || this.currentPlayerIndex >= this.players.length) {
            errors.push('Invalid current player index');
        }

        // TODO: Add more validation based on rulebook

        return {
            valid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * Resource Supply Management Methods
     */

    /**
     * Get amount of a resource in supply
     * @param {string} resourceType - Type of resource (mummers, animals, slaves, prisoners, workers)
     * @returns {number} Amount available in supply
     */
    getSupplyAmount(resourceType) {
        return this.resourceSupply[resourceType] || 0;
    }

    /**
     * Take resources from supply
     * @param {string} resourceType - Type of resource to take
     * @param {number} amount - Amount requested
     * @returns {number} Actual amount taken (may be less if supply is low)
     */
    takeFromSupply(resourceType, amount) {
        const available = this.getSupplyAmount(resourceType);
        const taken = Math.min(amount, available);
        
        if (taken > 0) {
            this.resourceSupply[resourceType] = available - taken;
        }
        
        return taken;
    }

    /**
     * Add resources to supply
     * @param {string} resourceType - Type of resource to add
     * @param {number} amount - Amount to add
     */
    addToSupply(resourceType, amount) {
        if (!this.resourceSupply[resourceType]) {
            this.resourceSupply[resourceType] = 0;
        }
        this.resourceSupply[resourceType] += amount;
    }

    /**
     * Take a worker from supply
     * @returns {boolean} True if worker was available and taken, false otherwise
     */
    takeWorkerFromSupply() {
        if (this.getSupplyAmount('workers') > 0) {
            this.takeFromSupply('workers', 1);
            return true;
        }
        return false;
    }

    /**
     * Return a worker to supply
     */
    returnWorkerToSupply() {
        this.addToSupply('workers', 1);
    }
}
