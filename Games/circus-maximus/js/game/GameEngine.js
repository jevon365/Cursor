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
import { EventCardManager } from './EventCardManager.js';
import { ActCardManager } from './ActCardManager.js';
import { CONFIG } from '../utils/config.js';

export class GameEngine {
    constructor(config = CONFIG) {
        this.config = config;
        this.state = new GameState(config);
        this.board = new Board(config);
        this.phases = new Phases(config);
        this.markets = new MarketManager(config);
        this.events = new EventCardManager(config);
        this.acts = new ActCardManager(config);
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
        this.events.initializeDeck();
        this.acts.initializeActPool();
        this.acts.setupRound();
        
        // Draw and resolve first event
        this.events.drawEvent();
        this.events.resolveEvent(this.state, this.markets);
        
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
            markets: this.markets.getAllStates(),
            currentEvent: this.events.getCurrentEvent(),
            availableActs: this.acts.getAvailableActs(),
            blockedTracks: this.state.blockedTracks,
            disabledLocations: this.state.disabledLocations
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
        const currentPhase = this.state.currentPhase;
        
        // Validate action with phase rules
        const validation = this.phases.validateAction(action, this.state);
        if (!validation.valid) {
            return { success: false, error: validation.reason };
        }

        // Execute the action based on action type
        switch (action.type) {
            case 'bid':
                if (currentPhase === 'bidOnActs') {
                    const result = currentPlayer.placeBid(action.actId, action.coins);
                    if (result) {
                        this.acts.placeBid(currentPlayer.id, action.actId, action.coins);
                    } else {
                        return { success: false, error: 'Insufficient coins' };
                    }
                }
                break;
            case 'pass':
                // Pass action - no execution needed
                break;
            case 'placeWorker':
                if (currentPhase === 'placeWorkers') {
                    // Check if location is disabled
                    if (this.state.disabledLocations && this.state.disabledLocations.includes(action.locationId)) {
                        return { success: false, error: 'Location is disabled this round' };
                    }
                    // Check worker cost
                    const workerCost = this.config.limits.workerDeployCost + (this.state.workerCostModifier || 0);
                    if (currentPlayer.getResource('coins') < workerCost) {
                        return { success: false, error: 'Insufficient coins to deploy worker' };
                    }
                    if (currentPlayer.workers.available <= 0) {
                        return { success: false, error: 'No available workers' };
                    }
                    currentPlayer.removeResource('coins', workerCost);
                    currentPlayer.placeWorker();
                    this.board.placeWorker(currentPlayer.id, action.locationId);
                }
                break;
            case 'buyResource':
                if (currentPhase === 'buyResources') {
                    const priceModifier = this.state.marketPriceModifier || 0;
                    const result = this.markets.buyResource(action.resourceType, currentPlayer, priceModifier);
                    if (!result.success) {
                        return { success: false, error: result.error || 'Cannot buy resource' };
                    }
                }
                break;
            default:
                return { success: false, error: 'Unknown action type' };
        }
        
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
            
            // Handle phase-specific logic
            if (currentPhaseId === 'performActs') {
                // Resolve all selected acts
                const selectedActs = this.acts.getSelectedActs();
                for (const act of selectedActs) {
                    this.acts.resolveAct(act.id, this.state);
                }
            }
            
            // Restock markets during cleanup phase (before phase end)
            if (currentPhaseId === 'cleanup') {
                this.markets.restockAll(this.state.players.length);
                
                // Clear event effects and draw new event for next round
                const eventEffects = this.events.endRound();
                this.state.blockedTracks = eventEffects.blockedTracks;
                this.state.disabledLocations = eventEffects.disabledLocations;
                this.state.marketPriceModifier = eventEffects.marketPriceModifier;
                this.state.workerCostModifier = eventEffects.workerCostModifier;
                
                // Setup next round
                this.acts.setupRound();
                this.events.drawEvent();
                this.events.resolveEvent(this.state, this.markets);
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
            events: this.events.serialize(),
            acts: this.acts.serialize(),
            markets: this.markets.serialize(),
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
            if (data.events) {
                this.events.deserialize(data.events);
            }
            if (data.acts) {
                this.acts.deserialize(data.acts);
            }
            if (data.markets) {
                this.markets.deserialize(data.markets);
            }
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
