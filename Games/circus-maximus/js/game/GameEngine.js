/**
 * GameEngine - Core game loop and game management
 * 
 * Manages turn order, phase transitions, and game flow
 */

import { GameState } from './GameState.js';
import { Board } from './Board.js';
import { Player } from './Player.js';
import { Phases } from './Phases.js';
import { MarketManager } from './Market.js';
import { CONFIG } from '../utils/config.js';

export class GameEngine {
    constructor(config = CONFIG) {
        this.config = config;
        this.state = new GameState(config);
        this.board = new Board(config);
        this.phases = new Phases(config);
        this.markets = new MarketManager(config);
        this.state.board = this.board;
        this.initialized = false;
    }

    /**
     * Initialize a new game with players
     */
    initializeGame(players) {
        // Create Player objects if needed
        const playerObjects = players.map((p, index) => {
            if (p instanceof Player) {
                return p;
            }
            return new Player(index, p.name || `Player ${index + 1}`, p.isAI || false);
        });

        this.state.initialize(playerObjects);
        this.board.clearWorkers();
        this.phases.reset();
        
        // Set initial phase
        const initialPhase = this.phases.getCurrentPhase();
        if (initialPhase) {
            this.state.setPhase(initialPhase.id);
            this.phases.onPhaseStart(this.state);
        }
        
        this.initialized = true;
    }

    /**
     * Get current game state (read-only for UI)
     */
    getState() {
        return {
            players: this.state.players.map(p => p.getSummary()),
            currentPlayer: this.state.getCurrentPlayer().getSummary(),
            currentPhase: this.state.currentPhase,
            round: this.state.round,
            turn: this.state.turn,
            gameOver: this.state.gameOver,
            winner: this.state.winner,
            board: {
                spaces: this.board.spaces,
                workerPlacements: this.board.workerPlacements
            },
            markets: this.markets.getAllStates()
        };
    }

    /**
     * Get available actions for current player
     */
    getAvailableActions() {
        if (!this.initialized || this.state.gameOver) {
            return [];
        }

        const currentPhase = this.phases.getCurrentPhase();
        if (!currentPhase) {
            return [];
        }

        // Get phase-specific actions
        const phaseActions = this.phases.getAvailableActions(this.state);
        
        // TODO: Add general game actions (place worker, pass, etc.)
        
        return phaseActions;
    }

    /**
     * Execute a player action
     */
    executeAction(action) {
        if (!this.initialized) {
            return { success: false, error: 'Game not initialized' };
        }

        if (this.state.gameOver) {
            return { success: false, error: 'Game is over' };
        }

        const currentPlayer = this.state.getCurrentPlayer();
        
        // Validate action with phase rules
        const validation = this.phases.validateAction(action, this.state);
        if (!validation.valid) {
            return { success: false, error: validation.reason };
        }

        // TODO: Execute the action based on action type
        // This will be implemented after rulebook analysis
        
        // Record action
        this.state.recordAction(action);

        // Check for win conditions
        if (this.state.checkGameOver()) {
            const winner = this.state.determineWinner();
            this.state.endGame(winner);
            return { success: true, gameOver: true, winner: winner };
        }

        return { success: true };
    }

    /**
     * End current player's turn
     */
    endTurn() {
        if (!this.initialized || this.state.gameOver) {
            return;
        }

        // Check if phase should end
        if (this.phases.shouldEndPhase(this.state)) {
            const currentPhaseId = this.state.currentPhase;
            
            // Restock markets during cleanup phase (before phase end)
            if (currentPhaseId === 'cleanup') {
                this.markets.restockAll(this.state.players.length);
            }
            
            this.phases.onPhaseEnd(this.state);
            
            // Move to next phase
            if (this.phases.nextPhase()) {
                const nextPhase = this.phases.getCurrentPhase();
                this.state.setPhase(nextPhase.id);
                this.phases.onPhaseStart(this.state);
            } else {
                // All phases complete - start new round
                this.phases.reset();
                const firstPhase = this.phases.getCurrentPhase();
                if (firstPhase) {
                    this.state.setPhase(firstPhase.id);
                    this.phases.onPhaseStart(this.state);
                }
            }
        }

        // Move to next player
        this.state.nextPlayer();
    }

    /**
     * Save game state
     */
    saveGame() {
        const saveData = {
            state: this.state.serialize(),
            config: this.config,
            version: '1.0.0'
        };
        return JSON.stringify(saveData);
    }

    /**
     * Load game state
     */
    loadGame(saveData) {
        try {
            const data = JSON.parse(saveData);
            this.state.deserialize(data.state);
            this.initialized = true;
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Reset game
     */
    reset() {
        this.state = new GameState(this.config);
        this.board = new Board(this.config);
        this.phases = new Phases(this.config);
        this.state.board = this.board;
        this.initialized = false;
    }
}
