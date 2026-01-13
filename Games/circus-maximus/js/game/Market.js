/**
 * Market - Manages supply/demand market system for resources
 * 
 * Markets use a left-to-right pricing system where resources are bought
 * from leftmost (cheapest) to rightmost (most expensive) positions.
 */

export class Market {
    constructor(config, resourceType) {
        this.config = config;
        this.resourceType = resourceType;
        this.marketConfig = config.markets[resourceType];
        this.supply = []; // Array of resources, left to right
        this.initialize();
    }

    /**
     * Initialize market with starting supply
     */
    initialize() {
        this.supply = [];
        for (let i = 0; i < this.marketConfig.startingSupply; i++) {
            this.supply.push({
                price: this.getPriceForPosition(i),
                available: true
            });
        }
    }

    /**
     * Get price for a position (left to right, ascending)
     */
    getPriceForPosition(position) {
        const tierIndex = Math.min(position, this.marketConfig.priceTiers.length - 1);
        return this.marketConfig.priceTiers[tierIndex];
    }

    /**
     * Get current price for next available resource
     */
    getCurrentPrice() {
        const availableIndex = this.supply.findIndex(r => r.available);
        if (availableIndex === -1) {
            return null; // No resources available
        }
        return this.supply[availableIndex].price;
    }

    /**
     * Buy a resource from the market
     * Returns the price paid, or null if unavailable
     */
    buyResource() {
        const availableIndex = this.supply.findIndex(r => r.available);
        if (availableIndex === -1) {
            return null; // No resources available
        }
        
        const resource = this.supply[availableIndex];
        resource.available = false;
        
        return resource.price;
    }

    /**
     * Get number of available resources
     */
    getAvailableCount() {
        return this.supply.filter(r => r.available).length;
    }

    /**
     * Restock market during cleanup
     */
    restock(playerCount) {
        const restockAmount = this.marketConfig.restockRate * playerCount;
        
        // Add new resources at the rightmost (highest) price tier
        const highestPrice = this.marketConfig.priceTiers[this.marketConfig.priceTiers.length - 1];
        
        for (let i = 0; i < restockAmount; i++) {
            this.supply.push({
                price: highestPrice,
                available: true
            });
        }
        
        // Note: Do NOT reset sold resources to available
        // Only newly added resources are available
    }

    /**
     * Get market state for display
     */
    getState() {
        return {
            resourceType: this.resourceType,
            name: this.marketConfig.name,
            available: this.getAvailableCount(),
            total: this.supply.length,
            currentPrice: this.getCurrentPrice(),
            priceTiers: [...this.marketConfig.priceTiers]
        };
    }

    /**
     * Serialize market state
     */
    serialize() {
        return {
            resourceType: this.resourceType,
            supply: [...this.supply]
        };
    }

    /**
     * Deserialize market state
     */
    deserialize(data) {
        this.supply = data.supply || [];
    }
}

/**
 * MarketManager - Manages all markets in the game
 */
export class MarketManager {
    constructor(config) {
        this.config = config;
        this.markets = {};
        this.initializeMarkets();
    }

    /**
     * Initialize all markets
     */
    initializeMarkets() {
        for (const resourceType of ['mummers', 'animals', 'slaves']) {
            this.markets[resourceType] = new Market(this.config, resourceType);
        }
    }

    /**
     * Get market for a resource type
     */
    getMarket(resourceType) {
        return this.markets[resourceType];
    }

    /**
     * Buy a resource from a market
     */
    buyResource(resourceType, player) {
        const market = this.getMarket(resourceType);
        if (!market) {
            return { success: false, reason: 'Invalid market' };
        }
        
        const price = market.getCurrentPrice();
        if (price === null) {
            return { success: false, reason: 'No resources available' };
        }
        
        if (!player.hasResource('coins', price)) {
            return { success: false, reason: 'Insufficient coins' };
        }
        
        // Deduct coins and add resource
        player.removeResource('coins', price);
        player.addResource(resourceType, 1);
        
        market.buyResource();
        
        return { success: true, price: price };
    }

    /**
     * Restock all markets during cleanup
     */
    restockAll(playerCount) {
        Object.values(this.markets).forEach(market => {
            market.restock(playerCount);
        });
    }

    /**
     * Get all market states
     */
    getAllStates() {
        const states = {};
        Object.entries(this.markets).forEach(([type, market]) => {
            states[type] = market.getState();
        });
        return states;
    }

    /**
     * Serialize all markets
     */
    serialize() {
        const data = {};
        Object.entries(this.markets).forEach(([type, market]) => {
            data[type] = market.serialize();
        });
        return data;
    }

    /**
     * Deserialize all markets
     */
    deserialize(data) {
        Object.entries(data).forEach(([type, marketData]) => {
            if (this.markets[type]) {
                this.markets[type].deserialize(marketData);
            }
        });
    }
}
