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
        
        // Track AI players
        this.aiPlayers = [];
    }

    /**
     * Start a new game
     */
    startGame(players) {
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
        document.getElementById('game-play').classList.add('active');
        
        this.updateDisplay();
        
        // Check if first player is AI
        const currentPlayer = this.gameEngine.state.getCurrentPlayer();
        if (currentPlayer && currentPlayer.isAI) {
            this.handleAITurn();
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
        const decision = await aiPlayer.makeDecision(this.gameEngine.state);
        
        if (decision) {
            const result = this.gameEngine.executeAction(decision);
            
            if (result.success) {
                if (result.gameOver) {
                    this.showGameEnd(result.winner);
                } else {
                    this.gameEngine.endTurn();
                    this.updateDisplay();
                    
                    // Check if next player is also AI
                    setTimeout(() => {
                        const nextPlayer = this.gameEngine.state.getCurrentPlayer();
                        if (nextPlayer && nextPlayer.isAI) {
                            this.handleAITurn();
                        }
                    }, 1000);
                }
            } else {
                // AI made invalid move, skip turn
                this.gameEngine.endTurn();
                this.updateDisplay();
            }
        } else {
            // AI couldn't decide, pass
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
}
