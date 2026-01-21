/**
 * UIManager - Manages the overall UI and coordinates between components
 */

import { GameDisplay } from './GameDisplay.js';
import { GameControls } from './GameControls.js';
import { AIPlayer } from '../ai/AIPlayer.js';

export class UIManager {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.display = new GameDisplay(gameEngine);
        this.controls = new GameControls(gameEngine, this);
        window.gameControls = this.controls; // For action button callbacks
        window.uiManager = this; // For ActionPanel access
        
        // Track AI players
        this.aiPlayers = [];
    }

    /**
     * Log an action to the action log
     */
    logAction(message, type = 'info', playerId = null) {
        if (this.display && this.display.logAction) {
            this.display.logAction(message, type, playerId);
        }
    }

    /**
     * Start a new game
     */
    startGame(players) {
        try {

            if (!players || players.length === 0) {
                console.error('startGame called with invalid players:', players);
                alert('Error: No players provided');
                return;
            }

            this.gameEngine.initializeGame(players);
            
            // Create AI player wrappers
            this.aiPlayers = [];
            players.forEach((p, index) => {
                if (p.isAI) {
                    const playerObj = this.gameEngine.state.players[index];
                    const aiPlayer = new AIPlayer(playerObj, null, 'medium');
                    this.aiPlayers.push(aiPlayer);
                }
            });
            
            // Switch to game play screen
            document.getElementById('game-setup').classList.remove('active');
            const gamePlayScreen = document.getElementById('game-play');
            if (!gamePlayScreen) {
                console.error('game-play screen not found!');
                return;
            }
            gamePlayScreen.classList.add('active');
            
            // Add class to main and app for CSS styling
            const mainElement = document.querySelector('main');
            const appElement = document.getElementById('app');
            if (mainElement) mainElement.classList.add('game-play-active');
            if (appElement) appElement.classList.add('game-play-active');
            
            // Use setTimeout to ensure DOM is updated before rendering
            setTimeout(() => {
                try {
                    this.updateDisplay();
                } catch (error) {
                    console.error('Error in updateDisplay:', error);
                    alert('Error updating display: ' + error.message);
                }
            }, 0);
            
            // Check if first player is AI
            try {
                const currentPlayer = this.gameEngine.state.getCurrentPlayer();
                if (currentPlayer && currentPlayer.isAI) {
                    this.handleAITurn();
                }
            } catch (error) {
                console.error('Error getting current player or handling AI turn:', error);
                // Continue anyway - game should still work for human players
            }
        } catch (error) {
            console.error('Error in startGame:', error);
            console.error('Stack:', error.stack);
            alert('Error starting game: ' + error.message + '\n\nCheck console for details.');
        }
    }

    /**
     * Update the game display
     */
    updateDisplay() {
        this.display.update();
    }

    /**
     * Handle AI player's turn
     */
    async handleAITurn() {
        const currentPlayer = this.gameEngine.state.getCurrentPlayer();
        if (!currentPlayer || !currentPlayer.isAI) {
            return;
        }
        
        // Find AI player wrapper
        const aiPlayer = this.aiPlayers.find(ai => ai.player.id === currentPlayer.id);
        if (!aiPlayer) {
            // No AI for this player, skip turn
            this.gameEngine.endTurn();
            this.updateDisplay();
            return;
        }
        
        // Get AI decision
        const gameStateForAI = this.gameEngine.getState();
        const decision = await aiPlayer.makeDecision(gameStateForAI);
        
        if (decision) {
            // Log AI action before executing
            const actionMessage = this.formatAIActionMessage(decision, currentPlayer);
            this.logAction(actionMessage, 'info', currentPlayer.id);
            
            const result = this.gameEngine.executeAction(decision);
            
            if (result.success) {
                if (result.gameOver) {
                    this.showGameEnd(result.winner);
                } else {
                    this.gameEngine.endTurn();
                    this.updateDisplay();
                    
                    // Check if next player is also AI
                    // Note: Automatic phases (performActs, cleanup) will be handled by their own endTurn() calls
                    // Don't skip phases - let normal flow handle phase transitions
                    setTimeout(() => {
                        const nextPlayer = this.gameEngine.state.getCurrentPlayer();
                        const currentPhase = this.gameEngine.state.currentPhase;
                        
                        // For automatic phases, they should end automatically
                        // Only advance if we're still in a player-action phase
                        if (currentPhase === 'performActs' || currentPhase === 'cleanup') {
                            // These phases are automatic - they end automatically when shouldEndPhase returns true
                            // The endTurn() call above should have already handled phase transition
                            // Just check if next player is AI after transition completes
                            setTimeout(() => {
                                const afterPhasePlayer = this.gameEngine.state.getCurrentPlayer();
                                if (afterPhasePlayer && afterPhasePlayer.isAI) {
                                    this.handleAITurn();
                                }
                            }, 500);
                        } else if (nextPlayer && nextPlayer.isAI) {
                            // Normal phase with AI player
                            this.handleAITurn();
                        }
                    }, 1000);
                }
            } else {
                // AI made invalid move, log and skip turn
                this.logAction(`${currentPlayer.name} attempted invalid action: ${result.error}`, 'warning', currentPlayer.id);
                this.gameEngine.endTurn();
                this.updateDisplay();
            }
        } else {
            // AI couldn't decide, pass
            this.logAction(`${currentPlayer.name} passed`, 'info', currentPlayer.id);
            this.gameEngine.endTurn();
            this.updateDisplay();
        }
    }

    /**
     * Show game end
     */
    showGameEnd(winner) {
        this.display.showGameEnd(winner);
    }

    /**
     * Show error message
     */
    showError(message) {
        this.display.showError(message);
    }

    /**
     * Show success message
     */
    showMessage(message, type) {
        this.display.showMessage(message, type);
    }
    
    /**
     * Format AI action message for logging
     */
    formatAIActionMessage(action, player) {
        if (!action || !player) return 'Unknown action';
        
        switch (action.type) {
            case 'bid':
                const act = this.gameEngine.acts?.getAvailableActs();
                const allActs = [...(act?.regular || []), ...(act?.execution || [])];
                const actCard = allActs.find(a => a.id === action.actId);
                const actName = actCard?.name || action.actId;
                return `${player.name} bid ${action.coins} coin(s) on ${actName}`;
            case 'placeWorker':
                const location = this.gameEngine.config?.locations?.[action.locationId];
                const locationName = location?.name || action.locationId;
                return `${player.name} placed a worker at ${locationName}`;
            case 'buyResource':
                return `${player.name} bought ${action.resourceType}`;
            case 'pass':
                return `${player.name} passed`;
            default:
                return `${player.name} performed ${action.type}`;
        }
    }
}
