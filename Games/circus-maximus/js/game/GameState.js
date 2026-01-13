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
     * Advance to next player
     */
    nextPlayer() {
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
        this.turn++;
        
        // Check if we've completed a round (all players have gone)
        if (this.currentPlayerIndex === 0) {
            this.round++;
        }
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
            board: this.board ? this.board.serialize() : null
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
}
