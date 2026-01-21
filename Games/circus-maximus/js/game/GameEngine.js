/**
 * GameEngine - Core game loop and game management
 * 
 * Manages turn order, phase transitions, and game flow
 */

import { GameState } from './GameState.js';
import { Board } from './Board.js';
import { Player } from './Player.js';
import { Phases } from './Phases.js';
import { SimpleMarket } from './Market.js';
import { EventCardManager } from './EventCardManager.js';
import { ActCardManager } from './ActCardManager.js';
import { CONFIG } from '../utils/config.js';

export class GameEngine {
    constructor(config = CONFIG) {
        this.config = config;
        this.state = new GameState(config);
        this.board = new Board(config);
        this.phases = new Phases(config);
        this.markets = new SimpleMarket();
        this.events = new EventCardManager(config);
        this.acts = new ActCardManager(config);
        this.state.board = this.board;
        this.initialized = false;
    }

    /**
     * Initialize a new game with players
     */
    initializeGame(players) {
        try {
            if (!players || players.length === 0) {
                throw new Error('No players provided to initializeGame');
            }

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
            
            // Announce event and mandatory execution act
            this.announceRoundStart();
            
            // Set initial phase
            const initialPhase = this.phases.getCurrentPhase();
            if (!initialPhase) {
                throw new Error('No initial phase available after reset');
            }
            
            this.state.setPhase(initialPhase.id);
            this.phases.onPhaseStart(this.state);
            
            this.initialized = true;
        } catch (error) {
            console.error('Error in initializeGame:', error);
            console.error('Stack:', error.stack);
            this.initialized = false;
            throw error;
        }
    }

    /**
     * Announce event and mandatory execution act at round start
     */
    announceRoundStart() {
        const event = this.events.getCurrentEvent();
        const executionAct = this.acts.getMandatoryExecutionAct();
        
        let message = `Round ${this.state.round} begins! `;
        
        if (event) {
            message += `Event: ${event.name}. `;
        }
        
        if (executionAct) {
            message += `Mandatory Execution: ${executionAct.name}.`;
        }
        
        this.state.setMessage(message, 'info');
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
            mandatoryExecutionAct: this.acts.getMandatoryExecutionAct(),
            availableActs: this.acts.getAvailableActs(),
            blockedTracks: this.state.blockedTracks,
            disabledLocations: this.state.disabledLocations,
            workerCostModifier: this.state.workerCostModifier || 0,
            marketPriceModifier: this.state.marketPriceModifier || 0,
            resourceSupply: this.state.resourceSupply,
            temporaryTrackMovements: this.state.temporaryTrackMovements,
            marketQueues: this.state.marketQueues || {},
            currentMarket: this.state.currentMarket,
            message: this.state.message,
            messageHistory: this.state.messageHistory,
            lastActResults: this.state.lastActResults || [],
            turnOrder: this.state.turnOrder,
            passedPlayers: this.state.passedPlayers,
            currentPlayerIndex: this.state.currentPlayerIndex
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
                        // Player has acted, remove from passed list if they were there
                        this.state.unmarkPlayerPassed();
                        this.state.setMessage(`${currentPlayer.name} bid ${action.coins} coin(s) on ${action.actId}`);
                    } else {
                        return { success: false, error: 'Insufficient coins' };
                    }
                }
                break;
            case 'pass':
                // Mark player as passed
                this.state.markPlayerPassed();
                this.state.setMessage(`${currentPlayer.name} passed`);
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
                    
                    // Try to place worker on board
                    const playerCount = this.state.players.length;
                    const placeResult = this.board.placeWorker(action.locationId, currentPlayer.id, playerCount);
                    if (!placeResult.success) {
                        return { success: false, error: placeResult.reason || 'Cannot place worker at this location' };
                    }
                    
                    // Get location config
                    const location = this.config.locations[action.locationId];
                    if (!location) {
                        return { success: false, error: 'Invalid location' };
                    }
                    
                    // Handle location-specific effects BEFORE deducting cost
                    // (Some effects like coin flips may refund cost)
                    const effectResult = this.handleLocationEffect(action.locationId, location, currentPlayer);
                    if (!effectResult.success) {
                        // Effect failed - remove worker from board
                        this.board.removeWorker(action.locationId, currentPlayer.id);
                        // Remove from market queue if this was a market location
                        this.removePlayerFromMarketQueue(action.locationId, currentPlayer.id);
                        return { success: false, error: effectResult.error || 'Location effect failed' };
                    }
                    
                    // Handle worker death (coin flip tails)
                    if (effectResult.workerDied) {
                        // Worker died - remove from board, return to supply, don't deduct cost
                        this.board.removeWorker(action.locationId, currentPlayer.id);
                        // Remove from market queue if this was a market location
                        this.removePlayerFromMarketQueue(action.locationId, currentPlayer.id);
                        // Worker already returned to supply in handleCoinFlipEffect
                        // Don't deduct cost, don't place worker
                        // Space is now available again (worker removed from board)
                    } else {
                        // Normal success - deduct cost and place worker
                        if (effectResult.shouldDeductCost !== false) {
                            currentPlayer.removeResource('coins', workerCost);
                        }
                        if (effectResult.shouldPlaceWorker !== false) {
                            currentPlayer.placeWorker();
                        }
                        
                        // Track market queues for market locations - ONLY if worker successfully placed
                        if (location.type === 'market' && location.marketType) {
                            // Verify worker is still on board before adding to queue
                            const workerCount = this.board.getPlayerWorkersOnSpace(action.locationId, currentPlayer.id);
                            if (workerCount > 0) {
                                // Ensure queue exists
                                if (!this.state.marketQueues[location.marketType]) {
                                    this.state.marketQueues[location.marketType] = [];
                                }
                                const queue = this.state.marketQueues[location.marketType];
                                // Only add if not already in queue (avoid duplicates)
                                if (!queue.includes(currentPlayer.id)) {
                                    queue.push(currentPlayer.id);
                                }
                            }
                        }
                    }
                    
                    // Set message based on what happened
                    if (effectResult.workerDied) {
                        this.state.setMessage(`${currentPlayer.name} sent worker to ${location.name} - worker died!`, 'warning');
                    } else {
                        this.state.setMessage(`${currentPlayer.name} placed worker at ${location.name}`);
                    }
                    
                    // Player has acted, remove from passed list if they were there
                    this.state.unmarkPlayerPassed();
                }
                break;
            case 'buyResource':
                if (currentPhase === 'buyResources') {
                    // Safety check: Ensure this is the current market being resolved
                    if (this.state.currentMarket !== action.resourceType) {
                        return { success: false, error: `You can only buy from ${this.state.currentMarket || 'the current'} market right now. Markets are resolved one at a time.` };
                    }
                    
                    // Safety check: Ensure player has worker in market (validation should catch this, but add safety check)
                    const marketQueue = this.state.marketQueues[action.resourceType];
                    if (!marketQueue || !marketQueue.includes(currentPlayer.id)) {
                        return { success: false, error: `You must have a worker in ${action.resourceType} market to buy this resource` };
                    }
                    
                    const priceModifier = this.state.marketPriceModifier || 0;
                    const result = this.markets.buy(action.resourceType, currentPlayer, priceModifier);
                    if (!result.success) {
                        return { success: false, error: result.error || 'Cannot buy resource' };
                    }
                    this.state.setMessage(`${currentPlayer.name} bought ${action.resourceType} for ${result.price} coin(s)`);
                    
                    // Player has acted, remove from passed list if they were there
                    // NOTE: Do NOT remove player from queue - they can buy multiple resources before passing
                    this.state.unmarkPlayerPassed();
                    
                    // After buying, advance to next player in market queue or next market
                    // Don't auto-advance turn here - let endTurn() handle it based on phase logic
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
        const shouldEnd = this.phases.shouldEndPhase(this.state);
        if (shouldEnd) {
            const currentPhaseId = this.state.currentPhase;
            
            // Handle phase-specific logic
            if (currentPhaseId === 'performActs') {
                // Resolve all selected acts and store results
                const selectedActs = this.acts.getSelectedActs();
                const resolutionResults = [];
                
                // Track which players participated in at least one act
                const participatingPlayerIds = new Set();
                
                for (const act of selectedActs) {
                    const result = this.acts.resolveAct(act.id, this.state);
                    if (result.success) {
                        resolutionResults.push(result);
                        
                        // Track participants
                        result.results.forEach(r => participatingPlayerIds.add(r.playerId));
                        
                        // Set message for winner
                        if (result.winner) {
                            const winnerName = result.winner.name || `Player ${result.winner.id}`;
                            let msg = `${act.name}: ${winnerName} wins!`;
                            if (result.diceResults) {
                                const rollsStr = result.diceResults.rolls
                                    .map(r => `${r.player.name || 'P' + r.player.id}: ${r.roll}`)
                                    .join(', ');
                                msg += ` (Rolls: ${rollsStr})`;
                            }
                            this.state.setMessage(msg, 'success');
                        } else {
                            this.state.setMessage(`${act.name} resolved - all participants rewarded`);
                        }
                    }
                }
                
                // Apply non-participant penalties to players who didn't participate in ANY act
                this.state.players.forEach(player => {
                    if (!participatingPlayerIds.has(player.id)) {
                        // Apply penalty from each selected act
                        for (const act of selectedActs) {
                            if (act.nonParticipantPenalty) {
                                for (const [trackName, amount] of Object.entries(act.nonParticipantPenalty)) {
                                    if (!this.state.blockedTracks || !this.state.blockedTracks.includes(trackName)) {
                                        player.modifyTrack(trackName, amount);
                                    }
                                }
                            }
                        }
                        this.state.setMessage(`${player.name} did not participate - penalties applied`, 'warning');
                    }
                });
                
                // Store results for UI display
                this.state.lastActResults = resolutionResults;
                
                // Check for win conditions after acts resolve (tracks may have changed)
                if (this.state.checkGameOver()) {
                    const winner = this.state.determineWinner();
                    this.state.endGame(winner);
                    return; // Game over, stop processing
                }
            }
            
            // Restock markets during cleanup phase (before phase end)
            if (currentPhaseId === 'cleanup') {
                this.markets.restock();
                
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
                
                // Announce new round's event and execution act
                this.announceRoundStart();
            }
            
            this.phases.onPhaseEnd(this.state);
            
            // Special handling: if we just finished cleanup, always start new round
            if (currentPhaseId === 'cleanup') {
                // All phases complete - start new round
                // Explicitly reset phase index to ensure we start from the beginning
                this.phases.reset();
                
                // Verify reset worked
                if (this.phases.currentPhaseIndex !== 0) {
                    console.warn(`Phase index after reset is ${this.phases.currentPhaseIndex}, expected 0. Forcing reset.`);
                    this.phases.currentPhaseIndex = 0;
                }
                
                const firstPhase = this.phases.getCurrentPhase();
                if (firstPhase) {
                    // Ensure phase is set correctly - do this BEFORE onPhaseStart
                    this.state.setPhase(firstPhase.id);
                    
                    // Clear passed players before starting new phase
                    this.state.clearPassedPlayers();
                    
                    // Rebuild market queues from board state before buyResources phase starts
                    // This ensures queues match actual worker placements (Fix Issue 6)
                    const nextPhase = this.phases.getCurrentPhase();
                    if (nextPhase && nextPhase.id === 'buyResources') {
                        this.rebuildMarketQueuesFromBoard();
                    }
                    
                    // Initialize the new phase - this sets up turn order
                    this.phases.onPhaseStart(this.state);
                    
                    // Double-check that phase is still set correctly after onPhaseStart
                    if (this.state.currentPhase !== firstPhase.id) {
                        console.warn(`Phase mismatch: expected ${firstPhase.id}, got ${this.state.currentPhase}. Correcting...`);
                        this.state.setPhase(firstPhase.id);
                    }
                    
                    // Check for win conditions after round increment (round limit check)
                    if (this.state.checkGameOver()) {
                        const winner = this.state.determineWinner();
                        this.state.endGame(winner);
                        return; // Game over, stop processing
                    }
                } else {
                    // No phase available - this shouldn't happen but handle it
                    console.error('No first phase available after reset. Phases array:', this.phases.phases);
                    console.error('Phase index:', this.phases.currentPhaseIndex);
                }
            } else {
                // Move to next phase (not cleanup)
                if (this.phases.nextPhase()) {
                    const nextPhase = this.phases.getCurrentPhase();
                    if (nextPhase) {
                        this.state.setPhase(nextPhase.id);
                        this.state.clearPassedPlayers(); // Clear passed players before starting new phase
                        
                        // Rebuild market queues from board state before buyResources phase starts
                        // This ensures queues match actual worker placements (Fix Issue 6)
                        if (nextPhase.id === 'buyResources') {
                            this.rebuildMarketQueuesFromBoard();
                        }
                        
                        this.phases.onPhaseStart(this.state);
                        
                        // For automatic phases (performActs, cleanup), immediately check if they should end
                        // and process them if needed
                        if (nextPhase.id === 'performActs') {
                            // performActs is automatic - acts are resolved when shouldEndPhase is checked
                            // It should end immediately after acts are resolved
                            // Don't process here - wait for endTurn() call
                        } else if (nextPhase.id === 'cleanup') {
                            // cleanup is automatic - should end immediately
                            // Since cleanup has no player actions, we need to process it immediately
                            // Check if it should end (it should, since all players are marked as passed in onPhaseStart)
                            const shouldEnd = this.phases.shouldEndPhase(this.state);
                            if (shouldEnd) {
                                // Process cleanup immediately by calling endTurn() recursively
                                // This will detect cleanup phase and process it
                                this.endTurn();
                                return; // Exit early after processing cleanup
                            }
                        }
                    } else {
                        console.error('nextPhase() returned true but getCurrentPhase() returned null');
                    }
                } else {
                    // This shouldn't happen for non-cleanup phases, but handle it
                    console.warn(`Phase ${currentPhaseId} ended but nextPhase() returned false. Resetting to first phase.`);
                    this.phases.reset();
                    const firstPhase = this.phases.getCurrentPhase();
                    if (firstPhase) {
                        this.state.setPhase(firstPhase.id);
                        this.state.clearPassedPlayers();
                        this.phases.onPhaseStart(this.state);
                    }
                }
            }
            
            // After phase transition, return early - don't advance turn
            // onPhaseStart() has already set the current player correctly
            return; // Don't advance turn after phase transition
        }

        // Special handling for Buy Resources phase - markets resolved sequentially
        if (this.state.currentPhase === 'buyResources' && this.state.currentMarket) {
            // Check if all players in current market have passed
            const currentMarketQueue = this.state.marketQueues[this.state.currentMarket] || [];
            const allPassedInMarket = currentMarketQueue.length > 0 && currentMarketQueue.every(playerId => {
                const playerIndex = this.state.players.findIndex(p => p.id === playerId);
                return playerIndex >= 0 && this.state.hasPlayerPassed(playerIndex);
            });
            
            if (allPassedInMarket) {
                // Move to next market
                const marketOrder = ['mummers', 'animals', 'slaves'];
                const currentMarketIndex = marketOrder.indexOf(this.state.currentMarket);
                let nextMarket = null;
                
                // Find next market with players in queue
                for (let i = currentMarketIndex + 1; i < marketOrder.length; i++) {
                    const marketType = marketOrder[i];
                    if (this.state.marketQueues[marketType] && this.state.marketQueues[marketType].length > 0) {
                        nextMarket = marketType;
                        break;
                    }
                }
                
                if (nextMarket) {
                    // Move to next market
                    this.state.currentMarket = nextMarket;
                    this.state.clearPassedPlayers(); // Clear passed players for new market
                    this.phases.setTurnOrder(this.state, 'market');
                    // Set current player to first in new market's queue
                    const newTurnOrder = this.state.turnOrder || [];
                    if (newTurnOrder.length > 0) {
                        this.state.currentPlayerIndex = newTurnOrder[0];
                    }
                    this.state.turn++;
                    return;
                } else {
                    // No more markets - phase should end
                    // This will be handled by shouldEndPhase check
                }
            }
        }
        
        // Move to next non-passed player in turn order
        // Skip players who have already passed
        const turnOrder = this.state.turnOrder || this.state.players.map((_, idx) => idx);
        const currentIndexInOrder = turnOrder.indexOf(this.state.currentPlayerIndex);
        
        // Find next non-passed player
        let nextPlayerIndex = null;
        for (let i = 1; i < turnOrder.length; i++) {
            const nextIndex = turnOrder[(currentIndexInOrder + i) % turnOrder.length];
            if (!this.state.hasPlayerPassed(nextIndex)) {
                nextPlayerIndex = nextIndex;
                break;
            }
        }
        
        // Clear temporary track movements for the previous player (currentPlayerIndex before change)
        // Rulebook says track movements are "for this turn only"
        const previousPlayerIndex = this.state.currentPlayerIndex;
        if (this.state.temporaryTrackMovements[previousPlayerIndex]) {
            delete this.state.temporaryTrackMovements[previousPlayerIndex];
        }
        
        if (nextPlayerIndex !== null) {
            // Found a non-passed player, move to them
            this.state.currentPlayerIndex = nextPlayerIndex;
            this.state.turn++;
        } else {
            // All players have passed - phase should have ended, but if we get here,
            // force phase end check again as safety
            if (this.phases.shouldEndPhase(this.state)) {
                // Phase should end - this shouldn't happen but handle it
                const currentPhaseId = this.state.currentPhase;
                this.phases.onPhaseEnd(this.state);
                if (this.phases.nextPhase()) {
                    const nextPhase = this.phases.getCurrentPhase();
                    this.state.setPhase(nextPhase.id);
                    this.phases.onPhaseStart(this.state);
                }
            } else {
                // Edge case: all passed but phase shouldn't end (shouldn't happen)
                // Just increment turn to prevent infinite loop
                this.state.turn++;
            }
        }
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
        this.markets = new SimpleMarket();
        this.state.board = this.board;
        this.initialized = false;
    }

    /**
     * Handle location-specific effects when a worker is placed
     * @param {string} locationId - ID of the location
     * @param {object} location - Location config object
     * @param {Player} player - Player placing the worker
     * @returns {object} { success: boolean, error?: string, shouldDeductCost?: boolean, shouldPlaceWorker?: boolean }
     */
    handleLocationEffect(locationId, location, player) {
        if (!location.effectType) {
            // No effect - default behavior
            return { success: true, shouldDeductCost: true, shouldPlaceWorker: true };
        }

        switch (location.effectType) {
            case 'gainResource':
                // Prison: Gain 1 prisoner from supply
                return this.handleGainResourceEffect(location, player);
            
            case 'coinFlip':
                // Port, War, Forest: Coin flip for resources or worker death
                return this.handleCoinFlipEffect(location, player);
            
            case 'trackMovement':
                // Town Square, Palace, Pantheon: Move track up
                return this.handleTrackMovementEffect(location, player);
            
            case 'resourceConversion':
                // Guildhall: Slave + coins = worker
                return this.handleResourceConversionEffect(location, player);
            
            case 'information':
                // Oracle: Animal = peek event deck
                return this.handleInformationEffect(location, player);
            
            case 'market':
                // Market locations: Just track queue, no immediate effect
                return { success: true, shouldDeductCost: true, shouldPlaceWorker: true };
            
            case 'betting':
                // Gamblers Den: Not implemented
                return { success: false, error: 'Gamblers Den not yet implemented' };
            
            default:
                // Unknown effect type - default behavior
                return { success: true, shouldDeductCost: true, shouldPlaceWorker: true };
        }
    }

    /**
     * Handle gainResource location effect (Prison)
     */
    handleGainResourceEffect(location, player) {
        if (!location.resourceGain) {
            return { success: false, error: 'Location missing resourceGain config' };
        }

        // Gain resources from supply
        for (const [resourceType, amount] of Object.entries(location.resourceGain)) {
            const taken = this.state.takeFromSupply(resourceType, amount);
            if (taken > 0) {
                player.addResource(resourceType, taken);
            } else {
                // Supply empty - but Prison can still be used (may have unlimited supply)
                // For now, allow it but don't give resources
                // TODO: Check rulebook - is Prison supply unlimited?
            }
        }

        return { success: true, shouldDeductCost: true, shouldPlaceWorker: true };
    }

    /**
     * Handle coinFlip location effect (Port, War, Forest)
     * Returns early if tails (worker dies) - cost not deducted, worker returned
     */
    handleCoinFlipEffect(location, player) {
        // Flip coin (true = heads, false = tails)
        const isHeads = this.flipCoin();

        if (!isHeads) {
            // Tails: Worker dies
            // Return worker to supply, don't deduct cost, remove from board
            this.state.returnWorkerToSupply();
            // Note: Worker already placed on board, will be removed by caller
            return { 
                success: true, 
                shouldDeductCost: false, 
                shouldPlaceWorker: false,
                workerDied: true 
            };
        }

        // Heads: Success - gain resources
        if (location.coinFlipReward) {
            for (const [resourceType, amount] of Object.entries(location.coinFlipReward)) {
                const taken = this.state.takeFromSupply(resourceType, amount);
                if (taken > 0) {
                    player.addResource(resourceType, taken);
                }
            }
        }

        return { success: true, shouldDeductCost: true, shouldPlaceWorker: true };
    }

    /**
     * Handle trackMovement location effect (Town Square, Palace, Pantheon)
     */
    handleTrackMovementEffect(location, player) {
        if (!location.trackMovement) {
            return { success: false, error: 'Location missing trackMovement config' };
        }

        // Check if tracks are blocked
        for (const track of Object.keys(location.trackMovement)) {
            if (this.state.blockedTracks && this.state.blockedTracks.includes(track)) {
                return { success: false, error: `${track} track is blocked this round` };
            }
        }

        // Apply temporary track movements
        if (!this.state.temporaryTrackMovements[player.id]) {
            this.state.temporaryTrackMovements[player.id] = {};
        }

        for (const [track, amount] of Object.entries(location.trackMovement)) {
            // Store temporary movement
            this.state.temporaryTrackMovements[player.id][track] = 
                (this.state.temporaryTrackMovements[player.id][track] || 0) + amount;
            
            // Also apply to actual track (temporary movements are additive)
            const currentValue = player.getTrack(track);
            const newValue = Math.min(
                currentValue + amount,
                this.config.victoryTracks[track].max
            );
            player.updateTrack(track, newValue - currentValue);
        }

        // Palace special: Check if player is now first on Empire track
        if (location.setsFirstPlayer && location.trackMovement.empire) {
            // Check if player is now first on Empire track
            const playerEmpireTrack = player.getTrack('empire');
            const isFirst = this.state.players.every(p => 
                p.id === player.id || p.getTrack('empire') <= playerEmpireTrack
            );
            if (isFirst) {
                // Player is first on Empire track - set flag to go first next round
                this.state.palaceFirstPlayer = player.id;
            }
        }

        return { success: true, shouldDeductCost: true, shouldPlaceWorker: true };
    }

    /**
     * Handle resourceConversion location effect (Guildhall)
     */
    handleResourceConversionEffect(location, player) {
        if (!location.conversionCost || !location.conversionReward) {
            return { success: false, error: 'Location missing conversion config' };
        }

        // Validate player has required resources
        for (const [resourceType, amount] of Object.entries(location.conversionCost)) {
            if (resourceType === 'coins') {
                if (player.getResource('coins') < amount) {
                    return { success: false, error: `Insufficient ${resourceType}` };
                }
            } else {
                if (player.getResource(resourceType) < amount) {
                    return { success: false, error: `Insufficient ${resourceType}` };
                }
            }
        }

        // Check worker supply for Guildhall
        if (location.conversionReward.workers) {
            if (this.state.getSupplyAmount('workers') < location.conversionReward.workers) {
                return { success: false, error: 'No workers available in supply' };
            }
        }

        // Remove conversion costs
        for (const [resourceType, amount] of Object.entries(location.conversionCost)) {
            if (resourceType === 'coins') {
                player.removeResource('coins', amount);
            } else {
                // Return resource to supply
                player.removeResource(resourceType, amount);
                this.state.addToSupply(resourceType, amount);
            }
        }

        // Give conversion rewards
        for (const [resourceType, amount] of Object.entries(location.conversionReward)) {
            if (resourceType === 'workers') {
                // Take worker from supply and add to player's available workers
                if (this.state.takeWorkerFromSupply()) {
                    player.workers.available += amount;
                } else {
                    return { success: false, error: 'Failed to get worker from supply' };
                }
            } else {
                player.addResource(resourceType, amount);
            }
        }

        return { success: true, shouldDeductCost: true, shouldPlaceWorker: true };
    }

    /**
     * Handle information location effect (Oracle)
     */
    handleInformationEffect(location, player) {
        if (!location.informationCost) {
            return { success: false, error: 'Location missing informationCost config' };
        }

        // Validate player has required resources
        for (const [resourceType, amount] of Object.entries(location.informationCost)) {
            if (player.getResource(resourceType) < amount) {
                return { success: false, error: `Insufficient ${resourceType}` };
            }
        }

        // Remove cost (return to supply)
        for (const [resourceType, amount] of Object.entries(location.informationCost)) {
            player.removeResource(resourceType, amount);
            this.state.addToSupply(resourceType, amount);
        }

        // Peek at top event card
        const peekedEvent = this.events.peekTopEvent();
        if (peekedEvent) {
            // Store in state for UI to display
            if (!this.state.oraclePeekedEvents) {
                this.state.oraclePeekedEvents = {};
            }
            this.state.oraclePeekedEvents[player.id] = peekedEvent;
        }

        return { success: true, shouldDeductCost: true, shouldPlaceWorker: true };
    }

    /**
     * Flip a coin (random true/false)
     * @returns {boolean} True for heads, false for tails
     */
    flipCoin() {
        return Math.random() >= 0.5;
    }

    /**
     * Remove player from market queue if location is a market
     * Called when worker is removed from a market location
     * @param {string} locationId - The location ID
     * @param {number} playerId - The player ID
     */
    removePlayerFromMarketQueue(locationId, playerId) {
        const location = this.config.locations[locationId];
        if (location && location.type === 'market' && location.marketType) {
            const queue = this.state.marketQueues[location.marketType];
            if (queue) {
                const index = queue.indexOf(playerId);
                if (index >= 0) {
                    queue.splice(index, 1);
                }
            }
        }
    }

    /**
     * Rebuild market queues from board state
     * Validates and syncs queues with actual worker placements
     * Should be called at start of buyResources phase
     */
    rebuildMarketQueuesFromBoard() {
        // Clear existing queues
        this.state.marketQueues = {
            mummers: [],
            animals: [],
            slaves: []
        };

        // Rebuild queues from board state
        const marketLocationIds = {
            'mummersMarket': 'mummers',
            'animalsMarket': 'animals',
            'slavesMarket': 'slaves'
        };

        for (const [locationId, marketType] of Object.entries(marketLocationIds)) {
            const workers = this.board.getWorkersOnSpace(locationId);
            for (const worker of workers) {
                if (worker.count > 0) {
                    const queue = this.state.marketQueues[marketType];
                    if (!queue.includes(worker.playerId)) {
                        queue.push(worker.playerId);
                    }
                }
            }
        }
    }
}
