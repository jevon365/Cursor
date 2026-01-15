/**
 * AIPlayer - AI player implementation
 * 
 * Wraps a strategy to make AI decisions during gameplay
 */

import { BasicStrategy } from './strategies/BasicStrategy.js';
import { CONFIG } from '../utils/config.js';

export class AIPlayer {
    constructor(player, strategy = null, difficulty = 'medium', config = CONFIG) {
        this.player = player;
        this.difficulty = difficulty;
        this.config = config;
        this.strategy = strategy || new BasicStrategy(difficulty);
        
        // Configure strategy from config
        if (config.ai && config.ai.difficulty && config.ai.difficulty[difficulty]) {
            const difficultyConfig = config.ai.difficulty[difficulty];
            this.strategy.lookAhead = difficultyConfig.lookAhead;
            this.strategy.randomness = difficultyConfig.randomness;
        }
    }

    /**
     * Make a decision for the AI player
     */
    async makeDecision(gameState) {
        // Small delay to make AI feel more natural
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const decision = this.strategy.decide(gameState, this.player, this.config);
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
