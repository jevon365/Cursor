/**
 * AIPlayer - AI player implementation
 * 
 * Wraps a strategy to make AI decisions during gameplay
 */

import { BasicStrategy } from './strategies/BasicStrategy.js';
import { CONFIG } from '../utils/config.js';

export class AIPlayer {
    constructor(player, strategy = null, difficulty = 'medium') {
        this.player = player;
        this.difficulty = difficulty;
        this.strategy = strategy || new BasicStrategy(difficulty);
        
        // Configure strategy from config
        if (CONFIG.ai && CONFIG.ai.difficulty && CONFIG.ai.difficulty[difficulty]) {
            const config = CONFIG.ai.difficulty[difficulty];
            this.strategy.lookAhead = config.lookAhead;
            this.strategy.randomness = config.randomness;
        }
    }

    /**
     * Make a decision for the AI player
     */
    async makeDecision(gameState) {
        // Small delay to make AI feel more natural
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const decision = this.strategy.decide(gameState, this.player);
        return decision;
    }

    /**
     * Check if this AI should make a move (for async handling)
     */
    shouldAct(gameState) {
        const currentPlayer = gameState.getCurrentPlayer();
        return currentPlayer && currentPlayer.id === this.player.id && !gameState.gameOver;
    }
}
