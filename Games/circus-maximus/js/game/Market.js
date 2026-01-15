/**
 * SimpleMarket - Array-based market system
 * 
 * Uses a simple array of prices where buying shifts from the front (cheapest).
 * This replaces the overcomplicated MarketManager with tracking flags.
 */

export class SimpleMarket {
    constructor() {
        // Each market is an array of prices, sorted ascending
        // Buying removes from the front (cheapest first)
        this.markets = {
            mummers: [1, 1, 2, 2, 3, 3, 4, 4, 5, 5],
            animals: [1, 1, 2, 2, 3, 3, 4, 4, 5, 5],
            slaves:  [1, 1, 2, 2, 3, 3, 4, 4, 5, 5]
        };
    }

    /**
     * Get current price for a resource type (cheapest available)
     * @param {string} resourceType - 'mummers', 'animals', or 'slaves'
     * @returns {number|null} Price or null if sold out
     */
    getPrice(resourceType) {
        const market = this.markets[resourceType];
        return market && market.length > 0 ? market[0] : null;
    }

    /**
     * Buy a resource from the market
     * @param {string} resourceType - 'mummers', 'animals', or 'slaves'
     * @param {object} player - Player object with coins and resources
     * @param {number} priceModifier - Optional modifier to price (from events)
     * @returns {object} { success: boolean, price?: number, error?: string }
     */
    buy(resourceType, player, priceModifier = 0) {
        const basePrice = this.getPrice(resourceType);
        
        if (basePrice === null) {
            return { success: false, error: 'Sold out' };
        }
        
        const finalPrice = Math.max(1, basePrice + priceModifier);
        
        if (!player.hasResource('coins', finalPrice)) {
            return { success: false, error: 'Insufficient coins' };
        }
        
        // Deduct coins and add resource
        player.removeResource('coins', finalPrice);
        player.addResource(resourceType, 1);
        
        // Remove from market (shift removes first element)
        this.markets[resourceType].shift();
        
        return { success: true, price: finalPrice };
    }

    /**
     * Get number of available resources in a market
     * @param {string} resourceType
     * @returns {number}
     */
    getAvailableCount(resourceType) {
        return this.markets[resourceType]?.length || 0;
    }

    /**
     * Restock all markets during cleanup
     * Fills to 2 of each price tier, max 3 new items per market
     */
    restock() {
        ['mummers', 'animals', 'slaves'].forEach(type => {
            let added = 0;
            // Add from highest price to lowest (5 down to 1)
            for (let price = 5; price >= 1 && added < 3; price--) {
                const currentCount = this.markets[type].filter(p => p === price).length;
                const toAdd = Math.min(2 - currentCount, 3 - added);
                
                for (let i = 0; i < toAdd; i++) {
                    // Insert in sorted position to maintain ascending order
                    const insertIdx = this.markets[type].findIndex(p => p > price);
                    if (insertIdx === -1) {
                        this.markets[type].push(price);
                    } else {
                        this.markets[type].splice(insertIdx, 0, price);
                    }
                    added++;
                }
            }
        });
    }

    /**
     * Add resources to a market (from events)
     * @param {string} resourceType
     * @param {number} amount
     */
    addResources(resourceType, amount) {
        if (!this.markets[resourceType]) return;
        
        // Add at price 3 (middle tier) and sort
        for (let i = 0; i < amount; i++) {
            this.markets[resourceType].push(3);
        }
        this.markets[resourceType].sort((a, b) => a - b);
    }

    /**
     * Remove resources from a market (from events)
     * @param {string} resourceType
     * @param {number} amount
     */
    removeResources(resourceType, amount) {
        if (!this.markets[resourceType]) return;
        
        // Remove from the end (most expensive first)
        for (let i = 0; i < amount && this.markets[resourceType].length > 0; i++) {
            this.markets[resourceType].pop();
        }
    }

    /**
     * Get all market states for display
     */
    getAllStates() {
        const states = {};
        ['mummers', 'animals', 'slaves'].forEach(type => {
            states[type] = {
                resourceType: type,
                name: `${type.charAt(0).toUpperCase() + type.slice(1)} Market`,
                available: this.markets[type].length,
                currentPrice: this.getPrice(type),
                prices: [...this.markets[type]]
            };
        });
        return states;
    }

    /**
     * Serialize market state for save/load
     */
    serialize() {
        return JSON.stringify(this.markets);
    }

    /**
     * Deserialize market state from save data
     */
    deserialize(data) {
        if (typeof data === 'string') {
            this.markets = JSON.parse(data);
        } else {
            this.markets = data;
        }
    }
}

// Alias for backwards compatibility with existing code
export const MarketManager = SimpleMarket;
