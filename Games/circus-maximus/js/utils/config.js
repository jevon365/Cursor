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
            coins: 15, // Starting coins per player (updated from playtesting)
            workers: 5, // Starting workers per player (updated from playtesting)
            mummers: 0,
            animals: 0,
            slaves: 0,
            prisoners: 0
        },
        startingTracks: {
            empire: 3,
            population: 3,
            church: 3
        },
        // Resource Supply - separate from markets, resources come from here for some locations
        resourceSupply: {
            mummers: 50, // Starting supply of mummers (Port takes from here)
            animals: 50, // Starting supply of animals (Forest takes from here)
            slaves: 50, // Starting supply of slaves (War takes from here)
            prisoners: 50, // Starting supply of prisoners (Prison takes from here)
            workers: 20 // Starting supply of workers (Guildhall takes from here)
        }
    },

    // Victory Tracks
    victoryTracks: {
        empire: {
            name: "Empire",
            min: -10, // Minimum track value
            max: 15   // Maximum track value (win threshold)
        },
        population: {
            name: "Population",
            min: -10,
            max: 15
        },
        church: {
            name: "Church",
            min: -10,
            max: 15
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
    // Based on official rulebook - all 11 locations
    locations: {
        port: {
            name: "Port",
            maxWorkersPerPlayer: 1,
            type: "action",
            effectType: "coinFlip", // Port, War, Forest use coin flips
            coinFlipReward: { mummers: 2 }, // Heads: gain 2 mummers from supply
            coinFlipFailure: "workerDies", // Tails: worker dies
            description: "Adventure to Greece in hope of finding mummers"
        },
        war: {
            name: "War",
            maxWorkersPerPlayer: 1,
            type: "action",
            effectType: "coinFlip",
            coinFlipReward: { slaves: 2 }, // Heads: gain 2 slaves from supply
            coinFlipFailure: "workerDies", // Tails: worker dies
            description: "Join the legion to capture slaves for the circus"
        },
        gamblersDen: {
            name: "Gamblers Den",
            maxWorkersPerPlayer: 1,
            type: "action",
            effectType: "betting", // Not yet implemented
            description: "Play the odds on upcoming circus acts"
        },
        prison: {
            name: "Prison",
            maxWorkersTotal: 6, // Max 6 workers total (all players combined)
            type: "action",
            effectType: "gainResource", // Gain 1 prisoner from supply
            resourceGain: { prisoners: 1 },
            allowMultiplePerPlayer: true, // Can place multiple workers here per turn
            description: "Retrieve prisoners for final execution acts"
        },
        mummersMarket: {
            name: "Mummers Market",
            maxWorkersPerPlayer: 1,
            type: "market",
            marketType: "mummers",
            description: "Hold your place in line to buy mummers"
        },
        animalsMarket: {
            name: "Animals Market",
            maxWorkersPerPlayer: 1,
            type: "market",
            marketType: "animals",
            description: "Hold your place in line to buy animals"
        },
        slavesMarket: {
            name: "Slaves Market",
            maxWorkersPerPlayer: 1,
            type: "market",
            marketType: "slaves",
            description: "Hold your place in line to buy slaves"
        },
        forest: {
            name: "Forest",
            maxWorkersPerPlayer: 1,
            type: "action",
            effectType: "coinFlip",
            coinFlipReward: { animals: 2 }, // Heads: gain 2 animals from supply
            coinFlipFailure: "workerDies", // Tails: worker dies
            description: "Capture wild beasts for the circus"
        },
        townSquare: {
            name: "Town Square",
            maxWorkersPerPlayer: 1,
            type: "action",
            effectType: "trackMovement", // Move up 1 on Population track
            trackMovement: { population: 1 },
            description: "Talk to the citizens to gain favor"
        },
        palace: {
            name: "Palace",
            maxWorkersPerPlayer: 1,
            type: "action",
            effectType: "trackMovement", // Move up 1 on Empire track
            trackMovement: { empire: 1 },
            setsFirstPlayer: true, // If first on Empire track, go first next round
            description: "Speak to Caesar to gain favor with the empire"
        },
        pantheon: {
            name: "Pantheon",
            maxWorkersPerPlayer: 1,
            type: "action",
            effectType: "trackMovement", // Move up 1 on Church track
            trackMovement: { church: 1 },
            description: "Talk to the gods to gain favor with the church"
        },
        guildhall: {
            name: "Guildhall",
            maxWorkersPerPlayer: 1,
            type: "action",
            effectType: "resourceConversion", // Return 1 slave + 5 coins = gain 1 worker
            conversionCost: { slaves: 1, coins: 5 },
            conversionReward: { workers: 1 },
            description: "Free a slave with payment to gain a worker"
        },
        oracle: {
            name: "Oracle",
            maxWorkersPerPlayer: 1,
            type: "action",
            effectType: "information", // Return 1 animal = peek at event deck
            informationCost: { animals: 1 },
            description: "Learn the future by sacrificing an animal"
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

    // Act Cards - 15 Regular Acts (5 displayed per round, selected ones replaced in cleanup)
    // Structure: id, name, coinCost (paid during act performance, completely separate from bid), 
    // resourceCost (required to participate, purchased during buyResources phase),
    // tracks (winner gets full, all participants if no winner),
    // hasWinner, consumesResources (true = resources consumed, false = returned),
    //   - For acts with winners: loser's resources consumed, winner's returned
    //   - For acts without winners: all resources consumed if true, all returned if false
    // coinReward (all participants get this), nonParticipantPenalty (applied if not in ANY selected act)
    // Note: For acts with winners, only winner gets track advancement + coins. Losers get coins only.
    // Note: For acts without winners, all participants get track advancement + coins.
    // Note: Bidding uses coins only (not resources). coinCost is separate from bid.
    // Note: Track range is 3-15 (starting at 3), so rewards are balanced accordingly.
    actCards: {
        // CHURCH TRACK ACTS (5 acts)
        choral_performance: {
            id: "choral_performance",
            name: "Choral Performance",
            coinCost: 0,
            resourceCost: { mummers: 1 },
            tracks: { church: 1, population: 1 },
            hasWinner: false,
            consumesResources: false,
            coinReward: 2,
            nonParticipantPenalty: { church: -1 },
            description: "Religious hymns and choral music performed for the faithful"
        },
        religious_play: {
            id: "religious_play",
            name: "Religious Play",
            coinCost: 0,
            resourceCost: { mummers: 2 },
            tracks: { church: 2, empire: 1 },
            hasWinner: true,
            consumesResources: false,
            coinReward: 3,
            nonParticipantPenalty: { church: -1 },
            description: "Mystery plays and religious dramas depicting sacred stories"
        },
        procession_martyrs: {
            id: "procession_martyrs",
            name: "Procession of Martyrs",
            coinCost: 0,
            resourceCost: { mummers: 1, slaves: 1 },
            tracks: { church: 3, population: -1 },
            hasWinner: false,
            consumesResources: true, // Both mummers and slaves consumed (slaves die in reenactment)
            coinReward: 4,
            nonParticipantPenalty: { church: -2 },
            description: "Reenactment of Christian martyrdoms, demonstrating faith"
        },
        hymn_competition: {
            id: "hymn_competition",
            name: "Hymn Competition",
            coinCost: 0,
            resourceCost: { mummers: 1 },
            tracks: { church: 2 },
            hasWinner: true,
            consumesResources: false,
            coinReward: 2,
            nonParticipantPenalty: { church: -1 },
            description: "Competitive singing of hymns for religious festivals"
        },
        sacred_music: {
            id: "sacred_music",
            name: "Sacred Music Festival",
            coinCost: 1,
            resourceCost: { mummers: 2 },
            tracks: { church: 3, population: 1 },
            hasWinner: false,
            consumesResources: false,
            coinReward: 4,
            nonParticipantPenalty: { church: -2 },
            description: "Grand festival of sacred music and religious celebration"
        },

        // POPULATION TRACK ACTS (5 acts)
        gladiator_combat: {
            id: "gladiator_combat",
            name: "Gladiator Combat",
            coinCost: 0,
            resourceCost: { slaves: 2 },
            tracks: { population: 3, empire: 1 },
            hasWinner: true,
            consumesResources: true, // Loser's slaves die, winner's slaves return
            coinReward: 5,
            nonParticipantPenalty: { population: -2 },
            description: "Classic gladiatorial combat to the death"
        },
        bestiarii_vs_beasts: {
            id: "bestiarii_vs_beasts",
            name: "Bestiarii vs. Beasts",
            coinCost: 0,
            resourceCost: { animals: 1, slaves: 1 },
            tracks: { population: 3, church: -1 },
            hasWinner: true,
            consumesResources: true, // Loser's resources consumed, winner's returned
            coinReward: 6,
            nonParticipantPenalty: { population: -2 },
            description: "Beast fighters battle wild animals in the arena"
        },
        venatio: {
            id: "venatio",
            name: "Venatio (Animal Hunt)",
            coinCost: 0,
            resourceCost: { animals: 2 },
            tracks: { population: 2, empire: 1 },
            hasWinner: false,
            consumesResources: true, // Animals killed
            coinReward: 4,
            nonParticipantPenalty: { population: -1 },
            description: "Staged animal hunts showcasing exotic beasts"
        },
        animal_feeding: {
            id: "animal_feeding",
            name: "Animal Feeding",
            coinCost: 0,
            resourceCost: { animals: 2 }, // No prisoners in regular acts
            tracks: { population: 3, church: -1 },
            hasWinner: false,
            consumesResources: true, // Animals consumed
            coinReward: 5,
            nonParticipantPenalty: { population: -2 },
            description: "Feeding slaves to wild animals for public spectacle"
        },
        slave_battle: {
            id: "slave_battle",
            name: "Slave Battle Royale",
            coinCost: 0,
            resourceCost: { slaves: 3 },
            tracks: { population: 4, empire: 1 },
            hasWinner: true,
            consumesResources: true, // Loser's slaves die (all 3), winner's return
            coinReward: 7,
            nonParticipantPenalty: { population: -2 },
            description: "Massive battle between slave armies"
        },

        // EMPIRE TRACK ACTS (5 acts)
        chariot_race: {
            id: "chariot_race",
            name: "Chariot Race",
            coinCost: 0,
            resourceCost: { animals: 2 }, // Horses
            tracks: { empire: 3, population: 2 },
            hasWinner: true,
            consumesResources: false, // Horses return
            coinReward: 6,
            nonParticipantPenalty: { empire: -1 },
            description: "The most popular Roman spectacle - chariot racing"
        },
        ludi_militaris: {
            id: "ludi_militaris",
            name: "Ludi Militaris (War Games)",
            coinCost: 0,
            resourceCost: { slaves: 2 },
            tracks: { empire: 4, population: 1 },
            hasWinner: true,
            consumesResources: true, // Loser's slaves die, winner's return
            coinReward: 7,
            nonParticipantPenalty: { empire: -2 },
            description: "Reenactment of famous military battles"
        },
        triumph_parade: {
            id: "triumph_parade",
            name: "Triumph Parade",
            coinCost: 0,
            resourceCost: { mummers: 2, animals: 1 },
            tracks: { empire: 3, population: 2 },
            hasWinner: false,
            consumesResources: false,
            coinReward: 5,
            nonParticipantPenalty: { empire: -1 },
            description: "Victory procession celebrating military conquest"
        },
        cavalry_display: {
            id: "cavalry_display",
            name: "Cavalry Display",
            coinCost: 0,
            resourceCost: { animals: 2 },
            tracks: { empire: 2, population: 1 },
            hasWinner: false,
            consumesResources: false,
            coinReward: 4,
            nonParticipantPenalty: { empire: -1 },
            description: "Military horse demonstrations showcasing imperial power"
        },
        naumachia: {
            id: "naumachia",
            name: "Naumachia (Naval Battle)",
            coinCost: 3, // Paid during act performance (completely separate from bid)
            resourceCost: { slaves: 3 },
            tracks: { empire: 4, population: 2 }, // High reward for high cost
            hasWinner: true,
            consumesResources: true, // Loser's slaves die, winner's return
            coinReward: 8,
            nonParticipantPenalty: { empire: -2, population: -1 },
            description: "Staged sea battles in flooded arenas - the ultimate spectacle"
        }
    },

    // Final Execution Acts (all 3 always available, players can bid on any)
    // These require prisoners and advance the selected track
    // Note: All 3 are displayed each round, players choose which to bid on
    finalActs: {
        torture: {
            id: "torture",
            name: "Public Torture",
            coinCost: 0,
            resourceCost: { prisoners: 1 },
            tracks: { empire: 2 },
            hasWinner: false,
            consumesResources: true, // Prisoner consumed
            coinReward: 3,
            nonParticipantPenalty: { empire: -1 },
            description: "Public torture demonstration of imperial authority"
        },
        military_execution: {
            id: "military_execution",
            name: "Military Execution",
            coinCost: 0,
            resourceCost: { prisoners: 1 },
            tracks: { population: 2 },
            hasWinner: false,
            consumesResources: true, // Prisoner consumed
            coinReward: 3,
            nonParticipantPenalty: { population: -1 },
            description: "Public execution by military methods for the masses"
        },
        crucifixion: {
            id: "crucifixion",
            name: "Crucifixion",
            coinCost: 0,
            resourceCost: { prisoners: 1 },
            tracks: { church: 2 },
            hasWinner: false,
            consumesResources: true, // Prisoner consumed
            coinReward: 3,
            nonParticipantPenalty: { church: -1 },
            description: "Religious execution by crucifixion"
        }
    },

    // Act Display Configuration
    actDisplay: {
        regularActsPerRound: 5, // 5 regular acts displayed per round
        totalRegularActs: 15, // Total pool of regular acts
        executionActsAlwaysAvailable: true, // All 3 execution acts always shown
        // Regular acts not bid on stay, selected ones replaced in cleanup
        // Execution acts always stay (never replaced)
        // Non-participant penalty: Applied once per round if player didn't participate in ANY selected act
    },

    // Event Cards - Drawn at start of each round (before phases begin)
    // Structure: id, name, description, effects
    // Effects can include: trackBlocked, locationDisabled, marketModify, playerCost, playerGain, 
    // trackModify, drawAnotherEvent, marketPriceModify, workerCostModify
    // Note: Terminology mapping - "Citizen track" = population, "Clergy track" = church, 
    // "Town Square" = forum, "Pantheon" = temple, "Sestertius" = coins
    // Balanced: 6 negative, 6 positive, 3 strategic/neutral
    eventCards: {
        plague_strikes: {
            id: "plague_strikes",
            name: "The Plague Strikes",
            description: "A terrible disease sweeps through the land. The citizens are confined to their homes.",
            effects: {
                trackBlocked: ["population"], // Population track cannot be moved this round
                locationDisabled: ["forum"] // Forum (Town Square) action does nothing this round
            }
        },
        new_lands_discovered: {
            id: "new_lands_discovered",
            name: "New Lands Discovered",
            description: "An expedition to the east has returned, bringing all sorts of exotic creatures to be pitted against each other.",
            effects: {
                marketModify: {
                    animals: 3 // Add 3 animals to the market
                }
            }
        },
        animals_escape: {
            id: "animals_escape",
            name: "Animals Escape",
            description: "There is a breakout from the animal pens and lions are loose on the streets. They must be killed.",
            effects: {
                marketModify: {
                    animals: -3 // Remove 3 animals from the market
                }
            }
        },
        traveling_troop: {
            id: "traveling_troop",
            name: "Traveling Troop",
            description: "A group of performers from Greece are passing through Rome and decided to stay.",
            effects: {
                marketModify: {
                    mummers: 3 // Add 3 mummers to the market
                }
            }
        },
        new_age: {
            id: "new_age",
            name: "New Age",
            description: "The season turns from one to another and a new era in the city has begun.",
            effects: {
                drawAnotherEvent: true // Shuffle discard pile into event deck, then draw another event card
            }
        },
        caesar_leaves_for_war: {
            id: "caesar_leaves_for_war",
            name: "Caesar Leaves for War",
            description: "Duty calls and the Caesar is needed elsewhere. Rome grows quiet without the legion.",
            effects: {
                trackBlocked: ["empire"], // Empire track cannot be moved this round
                locationDisabled: ["palace"] // Palace action does nothing this round
            }
        },
        pirates_grow_brave: {
            id: "pirates_grow_brave",
            name: "Pirates Grow Brave",
            description: "The empire needs money for new ships, so taxes must be raised.",
            effects: {
                playerCost: {
                    coins: 5, // Each player pays 5 coins
                    alternative: { // If player has no coins
                        resourceLoss: 1 // They lose 1 resource of their choice
                    }
                }
            }
        },
        slaves_revolt: {
            id: "slaves_revolt",
            name: "Slaves Revolt",
            description: "The slaves rise up in rebellion but are quickly forced into submission. Their leaders are executed.",
            effects: {
                marketModify: {
                    slaves: -3 // Remove 3 slaves from the market (placed in supply)
                }
            }
        },
        jupiter_is_angry: {
            id: "jupiter_is_angry",
            name: "Jupiter is Angry",
            description: "A goat's entrails reveal Jupiter is not pleased with our worship. We must appease him.",
            effects: {
                trackBlocked: ["church"], // Church (Clergy) track cannot be moved this round
                locationDisabled: ["temple"] // Temple (Pantheon) action does nothing this round
            }
        },
        
        // NEW POSITIVE EVENTS
        slave_ship_arrives: {
            id: "slave_ship_arrives",
            name: "Slave Ship Arrives",
            description: "A merchant ship arrives from the east, bringing a fresh supply of slaves to the market.",
            effects: {
                marketModify: {
                    slaves: 3 // Add 3 slaves to the market
                }
            }
        },
        victory_celebration: {
            id: "victory_celebration",
            name: "Victory Celebration",
            description: "The empire celebrates a great military victory. The people rejoice and coins flow freely.",
            effects: {
                playerGain: {
                    coins: 2 // All players gain 2 coins
                },
                trackModify: {
                    empire: 1 // All players gain +1 Empire track
                }
            }
        },
        festival_declared: {
            id: "festival_declared",
            name: "Festival Declared",
            description: "The emperor declares a grand festival. The streets fill with celebration and performers.",
            effects: {
                playerGain: {
                    coins: 1 // All players gain 1 coin
                },
                trackModify: {
                    population: 1 // All players gain +1 Population track
                },
                marketModify: {
                    mummers: 2 // Add 2 mummers to the market
                }
            }
        },
        imperial_bounty: {
            id: "imperial_bounty",
            name: "Imperial Bounty",
            description: "The emperor rewards loyal citizens. Those in favor receive generous payments.",
            effects: {
                playerGain: {
                    coins: "trackBased" // Each player gains coins equal to their Empire track position (min 1)
                }
            }
        },
        religious_offering: {
            id: "religious_offering",
            name: "Religious Offering",
            description: "A great religious ceremony brings the faithful together. The church gains favor.",
            effects: {
                trackModify: {
                    church: 1 // All players gain +1 Church track
                },
                marketModify: {
                    mummers: 2 // Add 2 mummers to the market
                }
            }
        },
        economic_boom: {
            id: "economic_boom",
            name: "Economic Boom",
            description: "Trade flourishes and the markets overflow with goods. Everyone prospers.",
            effects: {
                marketModify: {
                    mummers: 2, // Add 2 to each market
                    animals: 2,
                    slaves: 2
                },
                playerGain: {
                    coins: 1 // All players gain 1 coin
                }
            }
        },
        
        // NEW STRATEGIC/NEUTRAL EVENTS
        market_crash: {
            id: "market_crash",
            name: "Market Crash",
            description: "Oversupply causes prices to plummet. Resources are cheaper this round.",
            effects: {
                marketPriceModify: -1 // All market prices reduced by 1 this round (minimum 1)
            }
        },
        labor_shortage: {
            id: "labor_shortage",
            name: "Labor Shortage",
            description: "Workers are in high demand. It costs more to deploy them this round.",
            effects: {
                workerCostModify: 1 // Workers cost +1 coin to deploy this round
            }
        }
    },

    // Win Conditions
    winConditions: {
        trackVictory: {
            type: "track",
            threshold: 15, // Reach this on any track to win
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
        minBid: 1, // Minimum bid is 1 coin
        workerDeployCost: 1 // Cost in coins to deploy a worker (paid during placeWorkers phase)
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
