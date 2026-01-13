/**
 * Circus Maximus - Game Configuration
 * 
 * All game numbers and balance values are stored here for easy adjustment.
 * Values are organized by phase/mechanic and linked to rulebook sections.
 * 
 * Note: Many values are defaults subject to playtesting and adjustment
 */

export const CONFIG = {
    // Game Setup
    setup: {
        minPlayers: 2,
        maxPlayers: 4,
        startingResources: {
            coins: 5, // Starting coins per player
            workers: 3, // Starting workers per player
            mummers: 0,
            animals: 0,
            slaves: 0,
            prisoners: 0
        },
        startingTracks: {
            empire: 0,
            population: 0,
            church: 0
        }
    },

    // Victory Tracks
    victoryTracks: {
        empire: {
            name: "Empire",
            min: -10, // Minimum track value
            max: 20   // Maximum track value (win threshold)
        },
        population: {
            name: "Population",
            min: -10,
            max: 20
        },
        church: {
            name: "Church",
            min: -10,
            max: 20
        }
    },

    // Phase Configuration
    phases: {
        bidOnActs: {
            name: "Bid on Acts",
            order: 1,
            turnOrder: "empire", // Leader on empire track goes first
            description: "Players bid coins on act cards they want to perform"
        },
        placeWorkers: {
            name: "Place Workers",
            order: 2,
            turnOrder: "population", // Leader on population track goes first
            description: "Players place workers at locations"
        },
        buyResources: {
            name: "Buy Resources",
            order: 3,
            turnOrder: "market", // Order based on when workers were queued at markets
            description: "Players purchase resources from markets using supply/demand pricing"
        },
        performActs: {
            name: "Perform Acts",
            order: 4,
            turnOrder: "bid", // Order based on bid order
            description: "Resolve act cards, award coins and track movement"
        },
        cleanup: {
            name: "Cleanup and Reset",
            order: 5,
            turnOrder: "none", // No player actions
            description: "Reset workers and bids, restock markets, check win conditions"
        }
    },

    // Worker Placement Locations
    // Note: Locations and effects subject to rulebook confirmation
    locations: {
        prison: {
            name: "Prison",
            maxWorkersPerPlayer: null, // Unlimited until stock depleted
            type: "stock", // Has a stock of prisoners
            stock: 10, // Starting stock of prisoners
            description: "Acquire prisoners for final execution acts"
        },
        arena: {
            name: "Arena",
            maxWorkersPerPlayer: 1,
            type: "action",
            description: "Train gladiators and prepare for combat acts"
        },
        temple: {
            name: "Temple",
            maxWorkersPerPlayer: 1,
            type: "action",
            description: "Gain favor with the church"
        },
        palace: {
            name: "Palace",
            maxWorkersPerPlayer: 1,
            type: "action",
            description: "Gain favor with the empire"
        },
        forum: {
            name: "Forum",
            maxWorkersPerPlayer: 1,
            type: "action",
            description: "Gain favor with the population"
        },
        trainingGrounds: {
            name: "Training Grounds",
            maxWorkersPerPlayer: 1,
            type: "action",
            description: "Train performers and gain resources"
        },
        slums: {
            name: "Slums",
            maxWorkersPerPlayer: 1,
            type: "action",
            description: "Recruit workers from the common people"
        },
        barracks: {
            name: "Barracks",
            maxWorkersPerPlayer: 1,
            type: "action",
            description: "Recruit military personnel"
        }
    },

    // Resource Types
    resources: {
        coins: {
            name: "Coins",
            description: "Currency for bidding and purchasing"
        },
        workers: {
            name: "Workers",
            description: "Placed at locations to perform actions"
        },
        mummers: {
            name: "Mummers",
            description: "Performers for circus acts"
        },
        animals: {
            name: "Animals",
            description: "Animals for circus acts"
        },
        slaves: {
            name: "Slaves",
            description: "Slaves for circus acts"
        },
        prisoners: {
            name: "Prisoners",
            description: "Used in final execution acts"
        }
    },

    // Market System (Supply/Demand)
    markets: {
        mummers: {
            name: "Mummers Market",
            priceTiers: [1, 2, 3, 4, 5], // Prices from left to right
            startingSupply: 8, // Starting resources in market
            restockRate: 3 // Resources added during cleanup (per player count)
        },
        animals: {
            name: "Animals Market",
            priceTiers: [2, 3, 4, 5, 6],
            startingSupply: 6,
            restockRate: 2
        },
        slaves: {
            name: "Slaves Market",
            priceTiers: [3, 4, 5, 6, 7],
            startingSupply: 5,
            restockRate: 2
        }
    },

    // Act Cards Structure
    // Note: Specific acts will be created by another agent
    // This is the structure they should follow
    actCardStructure: {
        // Example structure:
        // id: "animal_show",
        // name: "Animal Show",
        // cost: { mummers: 1, animals: 2 }, // Resources needed to participate
        // tracks: {
        //     empire: 2,    // +2 to empire track
        //     population: 1, // +1 to population track
        //     church: -1    // -1 to church track
        // },
        // hasWinner: false, // Some acts have winners, some don't
        // consumesResources: true, // Whether resources are consumed or returned
        // coinReward: 3, // Coins awarded to participants
        // nonParticipantPenalty: { population: -1 } // Track penalty for not participating
    },

    // Final Act Types (one selected each round)
    finalActs: {
        torture: {
            name: "Torture",
            track: "empire" // Advances empire track
        },
        militaryExecution: {
            name: "Military Execution",
            track: "population" // Advances population track
        },
        crucifixion: {
            name: "Crucifixion",
            track: "church" // Advances church track
        }
    },

    // Win Conditions
    winConditions: {
        trackVictory: {
            type: "track",
            threshold: 20, // Reach this on any track to win
            description: "Reach threshold on any victory track"
        },
        roundLimit: {
            type: "rounds",
            maxRounds: 10, // Game ends after this many rounds
            description: "Game ends after max rounds, highest total wins"
        },
        tiebreaker: {
            type: "resources",
            description: "In case of tie, player with most total resources wins"
        }
    },

    // Game Limits
    limits: {
        maxWorkersPerLocation: 1, // One worker per location per player (except prison)
        maxBidPerAct: null, // No maximum bid
        minBid: 1 // Minimum bid is 1 coin
    },

    // Bidding Rules
    bidding: {
        firstPlayerMustBid: true, // First player cannot pass
        canBidMultipleCoins: true,
        canPass: true, // After first player, others can pass
        continuesUntilAllPass: true
    },

    // AI Configuration
    ai: {
        difficulty: {
            easy: {
                lookAhead: 1,
                randomness: 0.3
            },
            medium: {
                lookAhead: 2,
                randomness: 0.1
            },
            hard: {
                lookAhead: 3,
                randomness: 0.05
            }
        }
    }
};

/**
 * Validate configuration
 * Ensures all required values are present and valid
 */
export function validateConfig() {
    const errors = [];
    
    // TODO: Add validation logic once rulebook is analyzed
    // Check that all phases are defined
    // Check that all spaces are defined
    // Check that win conditions are defined
    // Check that numeric values are valid
    
    if (errors.length > 0) {
        console.warn('Configuration validation errors:', errors);
        return false;
    }
    
    return true;
}

// Validate on load
validateConfig();
