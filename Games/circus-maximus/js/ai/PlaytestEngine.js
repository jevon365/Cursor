/**
 * PlaytestEngine - Automated playtesting system
 * 
 * Runs AI vs AI games to collect balance data
 */

import { GameEngine } from '../game/GameEngine.js';
import { AIPlayer } from './AIPlayer.js';
import { BasicStrategy } from './strategies/BasicStrategy.js';
import { CONFIG } from '../utils/config.js';

export class PlaytestEngine {
    constructor(config = CONFIG) {
        this.config = config;
        this.results = [];
        this.debug = false; // Set to true for console logging
        this.actionLog = []; // Last N actions for debugging
        this.actionLogLimit = 10; // How many actions to keep
    }

    /**
     * Run a single playtest game
     */
    async runGame(playerCount = 2, difficulty = 'medium') {
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
        
        // Create AIPlayer instances for each player
        const aiPlayers = {};
        for (const player of game.state.players) {
            const strategy = new BasicStrategy(difficulty);
            aiPlayers[player.id] = new AIPlayer(player, strategy, difficulty);
        }
        
        const startTime = Date.now();
        let turns = 0;
        let actions = 0;
        const maxTurns = 1000; // Safety limit
        const maxActions = 5000; // Safety limit for actions
        this.actionLog = []; // Reset action log for this game
        
        // Run game until completion
        while (!game.state.gameOver && turns < maxTurns && actions < maxActions) {
            const currentPlayer = game.state.getCurrentPlayer();
            const currentPhase = game.state.currentPhase;
            
            // Safety check: if phase is null or undefined, something went wrong
            if (!currentPhase) {
                if (this.debug) {
                    console.warn(`No current phase detected (Round ${game.state.round}), attempting to recover...`);
                }
                // Try to get current phase from Phases object
                const phaseObj = game.phases.getCurrentPhase();
                if (phaseObj) {
                    game.state.setPhase(phaseObj.id);
                    game.state.clearPassedPlayers();
                    game.phases.onPhaseStart(game.state);
                    if (this.debug) {
                        console.log(`Recovered phase: ${phaseObj.id}`);
                    }
                } else {
                    // No phase available - try resetting phases
                    console.warn('No phase available, attempting phase reset...');
                    game.phases.reset();
                    const firstPhase = game.phases.getCurrentPhase();
                    if (firstPhase) {
                        game.state.setPhase(firstPhase.id);
                        game.state.clearPassedPlayers();
                        game.phases.onPhaseStart(game.state);
                        if (this.debug) {
                            console.log(`Reset to phase: ${firstPhase.id}`);
                        }
                    } else {
                        // No phase available, break to prevent infinite loop
                        console.error('Cannot recover phase state, ending game');
                        break;
                    }
                }
                continue;
            }
            
            // Skip automatic phases - these advance on their own
            if (currentPhase === 'performActs' || currentPhase === 'cleanup') {
                // For automatic phases, call endTurn() which will handle phase transitions
                // These phases should always end immediately (shouldEndPhase returns true)
                const phaseBefore = game.state.currentPhase;
                const roundBefore = game.state.round;
                game.endTurn();
                const phaseAfter = game.state.currentPhase;
                const roundAfter = game.state.round;
                
                if (this.debug) {
                    console.log(`Phase transition: ${phaseBefore} (R${roundBefore}) -> ${phaseAfter} (R${roundAfter})`);
                }
                
                // After cleanup, we should transition to bidOnActs
                // If we just finished cleanup and phase is null or wrong, fix it
                if (phaseBefore === 'cleanup' && (!phaseAfter || phaseAfter !== 'bidOnActs')) {
                    console.warn(`After cleanup, phase is ${phaseAfter}, expected bidOnActs. Attempting to fix...`);
                    game.phases.reset();
                    const firstPhase = game.phases.getCurrentPhase();
                    if (firstPhase && firstPhase.id === 'bidOnActs') {
                        game.state.setPhase('bidOnActs');
                        game.state.clearPassedPlayers();
                        game.phases.onPhaseStart(game.state);
                        if (this.debug) {
                            console.log(`Fixed phase to: ${game.state.currentPhase}`);
                        }
                    }
                }
                
                turns++;
                // After endTurn(), the phase should have transitioned
                // Continue to next iteration to check the new phase
                continue;
            }
            
            if (currentPlayer && currentPlayer.isAI) {
                const ai = aiPlayers[currentPlayer.id];
                
                if (ai) {
                    try {
                        // Get AI decision (without delay for faster testing)
                        const gameState = game.getState();
                        // Add the full gameState properties needed by strategy
                        gameState.getCurrentPlayer = () => currentPlayer;
                        
                        const decision = ai.strategy.decide(gameState, currentPlayer, this.config);
                        
                        // Log action to rolling buffer
                        this.logAction(currentPhase, currentPlayer.name, decision, game.state.round);
                        
                        if (this.debug) {
                            console.log(`[${currentPhase}] ${currentPlayer.name}: ${JSON.stringify(decision)}`);
                        }
                        
                        if (decision && decision.type) {
                            if (decision.type === 'pass') {
                                // Execute pass action - this advances to next player or phase
                                const result = game.executeAction({ type: 'pass' });
                                if (!result.success && this.debug) {
                                    console.log(`  Pass failed: ${result.error}`);
                                }
                            } else {
                                // Execute the AI's chosen action
                                const result = game.executeAction(decision);
                                if (!result.success) {
                                    if (this.debug) {
                                        console.log(`  Action failed: ${result.error}, falling back to pass`);
                                    }
                                    // If action failed, try to pass instead
                                    game.executeAction({ type: 'pass' });
                                }
                            }
                            actions++;
                        } else {
                            // No valid decision, pass
                            game.executeAction({ type: 'pass' });
                            actions++;
                        }
                    } catch (error) {
                        if (this.debug) {
                            console.error(`AI error for ${currentPlayer.name}:`, error);
                        }
                        // On error, pass to prevent infinite loop
                        game.executeAction({ type: 'pass' });
                        actions++;
                    }
                } else {
                    // No AI for this player, just pass
                    game.executeAction({ type: 'pass' });
                    actions++;
                }
            } else {
                // Non-AI player or no current player, pass to advance
                game.executeAction({ type: 'pass' });
                actions++;
            }
            
            // Small delay to prevent blocking (every 100 actions)
            if (actions % 100 === 0) {
                await new Promise(resolve => setTimeout(resolve, 1));
            }
        }
        
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        // Determine winner
        let winner = null;
        if (game.state.winner) {
            winner = game.state.winner.name;
        } else if (game.state.gameOver) {
            // Game ended by round limit - find winner by total track score
            let maxScore = -Infinity;
            for (const player of game.state.players) {
                const totalScore = player.getTrack('empire') + player.getTrack('population') + player.getTrack('church');
                if (totalScore > maxScore) {
                    maxScore = totalScore;
                    winner = player.name;
                }
            }
        }
        
        // Collect results
        const result = {
            gameId: this.results.length + 1,
            playerCount: playerCount,
            difficulty: difficulty,
            winner: winner,
            duration: duration,
            turns: turns,
            actions: actions,
            rounds: game.state.round,
            finalScores: game.state.players.map(p => ({
                name: p.name,
                empire: p.getTrack('empire'),
                population: p.getTrack('population'),
                church: p.getTrack('church'),
                totalTrack: p.getTrack('empire') + p.getTrack('population') + p.getTrack('church'),
                coins: p.getResource('coins'),
                resources: {
                    mummers: p.getResource('mummers'),
                    animals: p.getResource('animals'),
                    slaves: p.getResource('slaves'),
                    prisoners: p.getResource('prisoners')
                }
            })),
            completed: game.state.gameOver,
            hitMaxTurns: turns >= maxTurns,
            hitMaxActions: actions >= maxActions,
            lastActions: [...this.actionLog] // Copy of last N actions
        };
        
        this.results.push(result);
        return result;
    }

    /**
     * Log an action to the rolling buffer
     */
    logAction(phase, playerName, decision, round) {
        const entry = {
            round,
            phase,
            player: playerName,
            action: decision?.type || 'unknown',
            details: decision
        };
        
        this.actionLog.push(entry);
        
        // Keep only last N actions
        if (this.actionLog.length > this.actionLogLimit) {
            this.actionLog.shift();
        }
    }

    /**
     * Get the last N actions from the most recent game
     */
    getLastActions() {
        return this.actionLog;
    }

    /**
     * Print last actions to console
     */
    printLastActions() {
        console.log('\n=== Last Actions ===');
        for (const entry of this.actionLog) {
            console.log(`[R${entry.round}][${entry.phase}] ${entry.player}: ${entry.action}`, entry.details);
        }
    }

    /**
     * Run multiple playtest games
     */
    async runBatch(count = 10, playerCount = 2, difficulty = 'medium') {
        console.log(`Running ${count} playtest games with ${playerCount} players (${difficulty} difficulty)...`);
        
        for (let i = 0; i < count; i++) {
            const result = await this.runGame(playerCount, difficulty);
            console.log(`Game ${i + 1}/${count}: Winner=${result.winner || 'none'}, Rounds=${result.rounds}, Actions=${result.actions}, Completed=${result.completed}`);
        }
        
        const stats = this.getStatistics();
        console.log('\n=== Statistics ===');
        console.log(`Total Games: ${stats.totalGames}`);
        console.log(`Completed: ${stats.completedGames} (${((stats.completedGames / stats.totalGames) * 100).toFixed(1)}%)`);
        console.log(`Avg Duration: ${stats.averageDuration.toFixed(0)}ms`);
        console.log(`Avg Rounds: ${stats.averageRounds.toFixed(1)}`);
        console.log(`Avg Actions: ${stats.averageActions.toFixed(0)}`);
        console.log('Win Distribution:', stats.winDistribution);
        
        return stats;
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
            completedGames: 0,
            averageDuration: 0,
            averageTurns: 0,
            averageActions: 0,
            averageRounds: 0,
            winDistribution: {},
            hitMaxTurns: 0,
            hitMaxActions: 0
        };
        
        let totalDuration = 0;
        let totalTurns = 0;
        let totalActions = 0;
        let totalRounds = 0;
        
        this.results.forEach(result => {
            totalDuration += result.duration;
            totalTurns += result.turns;
            totalActions += result.actions || 0;
            totalRounds += result.rounds;
            
            if (result.completed) {
                stats.completedGames++;
            }
            if (result.hitMaxTurns) {
                stats.hitMaxTurns++;
            }
            if (result.hitMaxActions) {
                stats.hitMaxActions++;
            }
            
            if (result.winner) {
                stats.winDistribution[result.winner] = 
                    (stats.winDistribution[result.winner] || 0) + 1;
            }
        });
        
        stats.averageDuration = totalDuration / this.results.length;
        stats.averageTurns = totalTurns / this.results.length;
        stats.averageActions = totalActions / this.results.length;
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

    /**
     * Enable debug logging
     */
    enableDebug() {
        this.debug = true;
    }

    /**
     * Disable debug logging
     */
    disableDebug() {
        this.debug = false;
    }
}
