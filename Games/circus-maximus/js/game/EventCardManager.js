/**
 * EventCardManager - Manages event cards deck and resolution
 */

export class EventCardManager {
    constructor(config) {
        this.config = config;
        this.deck = [];
        this.discard = [];
        this.currentEvent = null;
        this.initializeDeck();
    }

    /**
     * Initialize event deck from config
     */
    initializeDeck() {
        const eventCards = this.config.eventCards;
        this.deck = Object.keys(eventCards).map(id => ({
            id: id,
            ...eventCards[id]
        }));
        this.shuffleDeck();
    }

    /**
     * Shuffle deck using Fisher-Yates algorithm
     */
    shuffleDeck() {
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }
    }

    /**
     * Draw an event card for the round
     */
    drawEvent() {
        // If deck is empty, shuffle discard into deck
        if (this.deck.length === 0) {
            if (this.discard.length > 0) {
                this.deck = [...this.discard];
                this.discard = [];
                this.shuffleDeck();
            } else {
                // No events available (shouldn't happen)
                return null;
            }
        }

        const event = this.deck.shift();
        this.currentEvent = event;
        return event;
    }

    /**
     * Resolve current event effects
     */
    resolveEvent(gameState, markets) {
        if (!this.currentEvent || !this.currentEvent.effects) {
            return;
        }

        const effects = this.currentEvent.effects;

        // Track blocking
        if (effects.trackBlocked) {
            gameState.blockedTracks = effects.trackBlocked;
        }

        // Location disabling
        if (effects.locationDisabled) {
            gameState.disabledLocations = effects.locationDisabled;
        }

        // Market modifications
        if (effects.marketModify) {
            for (const [resourceType, amount] of Object.entries(effects.marketModify)) {
                if (amount > 0) {
                    markets.addResources(resourceType, amount);
                } else if (amount < 0) {
                    markets.removeResources(resourceType, Math.abs(amount));
                }
            }
        }

        // Player costs
        if (effects.playerCost) {
            gameState.players.forEach(player => {
                if (effects.playerCost.coins) {
                    const cost = effects.playerCost.coins;
                    const playerCoins = player.getResource('coins') || 0;
                    if (playerCoins >= cost) {
                        player.removeResource('coins', cost);
                    } else if (effects.playerCost.alternative && effects.playerCost.alternative.resourceLoss) {
                        // Player loses 1 resource of their choice (AI chooses first available)
                        const resourceTypes = ['mummers', 'animals', 'slaves', 'prisoners'];
                        for (const type of resourceTypes) {
                            if (player.getResource(type) > 0) {
                                player.removeResource(type, 1);
                                break;
                            }
                        }
                    }
                }
            });
        }

        // Player gains
        if (effects.playerGain) {
            if (effects.playerGain.coins === 'trackBased') {
                // Imperial Bounty - coins based on Empire track
                gameState.players.forEach(player => {
                    const empireTrack = player.getTrack('empire');
                    const coins = Math.max(1, empireTrack);
                    player.addResource('coins', coins);
                });
            } else if (typeof effects.playerGain.coins === 'number') {
                gameState.players.forEach(player => {
                    player.addResource('coins', effects.playerGain.coins);
                });
            }
        }

        // Track modifications
        if (effects.trackModify) {
            for (const [trackName, amount] of Object.entries(effects.trackModify)) {
                gameState.players.forEach(player => {
                    player.modifyTrack(trackName, amount);
                });
            }
        }

        // Market price modifications
        if (effects.marketPriceModify) {
            if (typeof effects.marketPriceModify === 'number') {
                gameState.marketPriceModifier = effects.marketPriceModify;
            }
        }

        // Worker cost modifications
        if (effects.workerCostModify) {
            gameState.workerCostModifier = effects.workerCostModify;
        }

        // Draw another event (New Age)
        if (effects.drawAnotherEvent) {
            // Shuffle discard into deck
            if (this.discard.length > 0) {
                this.deck = [...this.deck, ...this.discard];
                this.discard = [];
                this.shuffleDeck();
            }
            // Draw another event (but don't resolve it yet - it will be resolved next round)
            // Actually, per rulebook, we draw and resolve immediately
            const nextEvent = this.drawEvent();
            if (nextEvent && nextEvent.id !== 'new_age') {
                // Resolve the new event immediately
                this.resolveEvent(gameState, markets);
            }
        }
    }

    /**
     * End of round - discard current event and return cleared effects
     */
    endRound() {
        if (this.currentEvent) {
            this.discard.push(this.currentEvent);
            this.currentEvent = null;
        }
        // Return cleared event effects (will be applied to gameState)
        return {
            blockedTracks: [],
            disabledLocations: [],
            marketPriceModifier: 0,
            workerCostModifier: 0
        };
    }

    /**
     * Get current event
     */
    getCurrentEvent() {
        return this.currentEvent;
    }

    /**
     * Serialize for save/load
     */
    serialize() {
        return {
            deck: this.deck,
            discard: this.discard,
            currentEvent: this.currentEvent
        };
    }

    /**
     * Deserialize from save data
     */
    deserialize(data) {
        this.deck = data.deck || [];
        this.discard = data.discard || [];
        this.currentEvent = data.currentEvent || null;
    }
}
