/**
 * PlaytestEngine - Automated playtesting system
 * 
 * Runs AI vs AI games to collect balance data
 */

import { GameEngine } from '../game/GameEngine.js';
import { CONFIG } from '../utils/config.js';

export class PlaytestEngine {
    constructor(config = CONFIG) {
        this.config = config;
        this.results = [];
    }

    /**
     * Run a single playtest game
     */
    async runGame(playerCount = 2) {
        const game = new GameEngine(this.config);
        
        // Create all AI players
        const players = [];
        for (let i = 0; i < playerCount; i++) {
            players.push({
                name: `AI Player ${i + 1}`,
                isAI: true
            });
        }
        
        game.initializeGame(players);
        
        const startTime = Date.now();
        let turns = 0;
        const maxTurns = 1000; // Safety limit
        
        // Run game until completion
        while (!game.state.gameOver && turns < maxTurns) {
            const currentPlayer = game.state.getCurrentPlayer();
            
            if (currentPlayer.isAI) {
                // TODO: Get AI decision and execute
                // This will be implemented after AI is complete
                // For now, just pass
                game.endTurn();
            } else {
                game.endTurn();
            }
            
            turns++;
            
            // Small delay to prevent blocking
            if (turns % 10 === 0) {
                await new Promise(resolve => setTimeout(resolve, 1));
            }
        }
        
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        // Collect results
        const result = {
            gameId: this.results.length + 1,
            playerCount: playerCount,
            winner: game.state.winner ? game.state.winner.name : null,
            duration: duration,
            turns: turns,
            rounds: game.state.round,
            finalScores: game.state.players.map(p => ({
                name: p.name,
                victoryPoints: p.victoryPoints,
                resources: { ...p.resources }
            })),
            completed: game.state.gameOver
        };
        
        this.results.push(result);
        return result;
    }

    /**
     * Run multiple playtest games
     */
    async runBatch(count = 10, playerCount = 2) {
        console.log(`Running ${count} playtest games with ${playerCount} players...`);
        
        for (let i = 0; i < count; i++) {
            await this.runGame(playerCount);
            console.log(`Completed game ${i + 1}/${count}`);
        }
        
        return this.getStatistics();
    }

    /**
     * Get statistics from playtest results
     */
    getStatistics() {
        if (this.results.length === 0) {
            return null;
        }
        
        const stats = {
            totalGames: this.results.length,
            averageDuration: 0,
            averageTurns: 0,
            averageRounds: 0,
            winDistribution: {},
            averageScores: {}
        };
        
        let totalDuration = 0;
        let totalTurns = 0;
        let totalRounds = 0;
        
        this.results.forEach(result => {
            totalDuration += result.duration;
            totalTurns += result.turns;
            totalRounds += result.rounds;
            
            if (result.winner) {
                stats.winDistribution[result.winner] = 
                    (stats.winDistribution[result.winner] || 0) + 1;
            }
        });
        
        stats.averageDuration = totalDuration / this.results.length;
        stats.averageTurns = totalTurns / this.results.length;
        stats.averageRounds = totalRounds / this.results.length;
        
        return stats;
    }

    /**
     * Clear results
     */
    clearResults() {
        this.results = [];
    }

    /**
     * Export results as JSON
     */
    exportResults() {
        return JSON.stringify({
            results: this.results,
            statistics: this.getStatistics(),
            timestamp: Date.now()
        }, null, 2);
    }
}
