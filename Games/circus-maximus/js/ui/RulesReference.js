/**
 * RulesReference - Displays game rules in a modal overlay
 * 
 * Provides an in-game reference for all game rules
 */

export class RulesReference {
    constructor() {
        this.modal = null;
        this.isVisible = false;
        this.createModal();
    }

    /**
     * Create the rules modal
     */
    createModal() {
        // Create modal container
        this.modal = document.createElement('div');
        this.modal.id = 'rules-modal';
        this.modal.className = 'rules-modal';
        this.modal.style.display = 'none';

        // Create modal content
        const content = document.createElement('div');
        content.className = 'rules-modal-content';

        // Create header with close button
        const header = document.createElement('div');
        header.className = 'rules-modal-header';
        const title = document.createElement('h2');
        title.textContent = 'Circus Maximus - Game Rules';
        const closeBtn = document.createElement('button');
        closeBtn.className = 'rules-modal-close';
        closeBtn.innerHTML = '&times;';
        closeBtn.onclick = () => this.hide();
        header.appendChild(title);
        header.appendChild(closeBtn);

        // Create scrollable content area
        const scrollArea = document.createElement('div');
        scrollArea.className = 'rules-modal-body';
        scrollArea.innerHTML = this.generateRulesHTML();

        // Assemble modal
        content.appendChild(header);
        content.appendChild(scrollArea);
        this.modal.appendChild(content);

        // Add to body
        document.body.appendChild(this.modal);

        // Close on outside click
        this.modal.onclick = (e) => {
            if (e.target === this.modal) {
                this.hide();
            }
        };

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isVisible) {
                this.hide();
            }
        });
    }

    /**
     * Generate HTML content for rules
     */
    generateRulesHTML() {
        return `
            <div class="rules-content">
                <section class="rules-section">
                    <h3>Game Overview</h3>
                    <p>A worker placement board game for 2-4 players set in ancient Rome. Players compete to perform circus acts for Rome, managing resources and gaining favor across three victory tracks: <strong>Empire</strong>, <strong>Population</strong>, and <strong>Church</strong>.</p>
                </section>

                <section class="rules-section">
                    <h3>Game Setup</h3>
                    <h4>Starting Resources</h4>
                    <ul>
                        <li><strong>15 coins</strong></li>
                        <li><strong>5 workers</strong></li>
                        <li>0 mummers, 0 animals, 0 slaves, 0 prisoners</li>
                    </ul>
                    <h4>Starting Victory Tracks</h4>
                    <ul>
                        <li><strong>Empire</strong>: 3</li>
                        <li><strong>Population</strong>: 3</li>
                        <li><strong>Church</strong>: 3</li>
                    </ul>
                    <p>Track values range from -10 to 15 (win threshold).</p>
                </section>

                <section class="rules-section">
                    <h3>Game Phases</h3>
                    <p>Each round consists of 5 phases, played in order:</p>
                    <ol>
                        <li><strong>Bid on Acts</strong> - Players bid coins on act cards (Turn Order: Leader on Empire track)</li>
                        <li><strong>Place Workers</strong> - Players place workers at locations (Turn Order: Leader on Population track)</li>
                        <li><strong>Buy Resources</strong> - Players purchase resources from markets (Turn Order: Market queue order)</li>
                        <li><strong>Perform Acts</strong> - Resolve act cards, award coins and track movement (Turn Order: Bid order)</li>
                        <li><strong>Cleanup and Reset</strong> - Calculate income/feeding costs, reset workers, restock markets, draw new event</li>
                    </ol>
                </section>

                <section class="rules-section">
                    <h3>Victory Tracks</h3>
                    <p>Three victory tracks determine the winner:</p>
                    <ul>
                        <li><strong>Empire</strong>: Favor with the empire</li>
                        <li><strong>Population</strong>: Favor with the people</li>
                        <li><strong>Church</strong>: Favor with the church</li>
                    </ul>
                    <h4>Win Conditions</h4>
                    <ul>
                        <li><strong>Track Victory</strong>: Reach 15 on any track (immediate win)</li>
                        <li><strong>Round Limit</strong>: After 10 rounds, player with highest total across all tracks wins</li>
                        <li><strong>Tiebreaker</strong>: Player with most total resources wins</li>
                    </ul>
                </section>

                <section class="rules-section">
                    <h3>Resources</h3>
                    <ul>
                        <li><strong>Coins</strong>: Currency for bidding and purchasing</li>
                        <li><strong>Workers</strong>: Placed at locations to perform actions (cost: 1 coin per worker deployed)</li>
                        <li><strong>Mummers</strong>: Performers for circus acts</li>
                        <li><strong>Animals</strong>: Animals for circus acts</li>
                        <li><strong>Slaves</strong>: Slaves for circus acts</li>
                        <li><strong>Prisoners</strong>: Used in final execution acts</li>
                    </ul>
                </section>

                <section class="rules-section">
                    <h3>Worker Placement Locations</h3>
                    <h4>Action Locations (1 worker total, first come first served)</h4>
                    <ul>
                        <li><strong>Port</strong>: Coin flip - Heads: +2 mummers from supply, Tails: Worker dies</li>
                        <li><strong>War</strong>: Coin flip - Heads: +2 slaves from supply, Tails: Worker dies</li>
                        <li><strong>Forest</strong>: Coin flip - Heads: +2 animals from supply, Tails: Worker dies</li>
                        <li><strong>Prison</strong>: +1 prisoner from supply (2 workers per player allowed)</li>
                        <li><strong>Town Square</strong>: +1 Population track (temporary, this turn only)</li>
                        <li><strong>Palace</strong>: +1 Empire track (temporary, this turn only). If first on Empire track, go first next round.</li>
                        <li><strong>Pantheon</strong>: +1 Church track (temporary, this turn only)</li>
                        <li><strong>Guildhall</strong>: Return 1 slave + pay 5 coins = gain 1 worker from supply</li>
                    </ul>
                    <h4>Market Locations (1 worker per player)</h4>
                    <ul>
                        <li><strong>Mummers Market</strong>: Hold place in buying queue</li>
                        <li><strong>Animals Market</strong>: Hold place in buying queue</li>
                        <li><strong>Slaves Market</strong>: Hold place in buying queue</li>
                    </ul>
                    <p><em>Note: Gamblers Den and Oracle are not available in MVP version.</em></p>
                </section>

                <section class="rules-section">
                    <h3>Market System</h3>
                    <p>Supply/demand pricing system:</p>
                    <ul>
                        <li>Resources bought left-to-right (cheapest to most expensive)</li>
                        <li><strong>Mummers</strong>: Prices [1, 2, 3, 4, 5]</li>
                        <li><strong>Animals</strong>: Prices [2, 3, 4, 5, 6]</li>
                        <li><strong>Slaves</strong>: Prices [3, 4, 5, 6, 7]</li>
                    </ul>
                    <p>Markets restock during cleanup phase based on player count.</p>
                </section>

                <section class="rules-section">
                    <h3>Act Cards</h3>
                    <p>5 regular acts are displayed each round. Players bid coins to participate. Acts require resources and may have coin costs.</p>
                    
                    <h4>Church Track Acts</h4>
                    <ul>
                        <li><strong>Choral Performance</strong>: 1 mummer → Church +1, Population +1 (Resources returned)</li>
                        <li><strong>Pageant</strong>: 2 mummers → Church +2, 3 coins (Resources returned)</li>
                        <li><strong>Procession of Martyrs</strong>: 1 mummer, 1 slave → Church +3, Population -1, 4 coins (Slaves consumed, mummers returned)</li>
                        <li><strong>Hymn Competition</strong>: 1 mummer → Church +2, 4 coins (Winner gets track advancement, all get coins, Resources returned)</li>
                        <li><strong>Sacred Festival</strong>: 2 mummers, 1 coin → Church +3, Population +1, 4 coins (Resources returned)</li>
                    </ul>

                    <h4>Population Track Acts</h4>
                    <ul>
                        <li><strong>Gladiator Combat</strong>: 1 slave → Population +2, 3 coins (Winner gets track advancement, loser's slave dies)</li>
                        <li><strong>Bestiarii vs. Beasts</strong>: 1 animal, 1 slave → Population +3, Church -1, 5 coins (Slaves consumed, animals returned)</li>
                        <li><strong>Venatio (Animal Hunt)</strong>: 2 animals → Population +2, 4 coins (Animals consumed)</li>
                        <li><strong>Animal Feeding</strong>: 2 animals, 2 coins → Population +2, Church +1, 5 coins (Resources returned)</li>
                        <li><strong>Slave Battle Royale</strong>: 3 slaves → Population +3, Empire +2, 7 coins (Winner gets track advancement, loser's slaves die)</li>
                    </ul>

                    <h4>Empire Track Acts</h4>
                    <ul>
                        <li><strong>Chariot Race</strong>: 2 animals, 1 mummer → Empire +3, Population +1, 5 coins (Winner gets track advancement, Resources returned)</li>
                        <li><strong>Ludi Militaris (War Games)</strong>: 2 slaves → Empire +3, Population +1, 7 coins (Winner gets track advancement, loser's slaves die)</li>
                        <li><strong>Triumph Parade</strong>: 2 mummers, 1 animal → Empire +2, Church +1, 3 coins (Resources returned)</li>
                        <li><strong>Cavalry Display</strong>: 2 animals → Empire +1, Church +1, 1 coin per animal owned (Winner determined by most animals, Resources returned)</li>
                        <li><strong>Naumachia (Naval Battle)</strong>: 3 slaves, 3 coins → Empire +4, Population +2, 8 coins (Winner gets track advancement, loser's slaves die)</li>
                    </ul>

                    <h4>Final Execution Acts</h4>
                    <p>One execution act is randomly selected each round. All require 1 prisoner (consumed) and provide no coin rewards:</p>
                    <ul>
                        <li><strong>Public Torture</strong>: Population +1</li>
                        <li><strong>Military Execution</strong>: Empire +1</li>
                        <li><strong>Crucifixion</strong>: Church +1</li>
                    </ul>

                    <h4>Non-Participant Penalties</h4>
                    <p>Players who do not participate in ANY selected act during a round receive track penalties as specified on each act card.</p>
                </section>

                <section class="rules-section">
                    <h3>Event Cards</h3>
                    <p>An event card is drawn at the start of each round and affects that round:</p>
                    
                    <h4>Negative Events</h4>
                    <ul>
                        <li><strong>The Plague Strikes</strong>: Population track blocked, Town Square disabled</li>
                        <li><strong>Animals Escape</strong>: Remove 3 animals from market</li>
                        <li><strong>Caesar Leaves for War</strong>: Empire track blocked, Palace disabled</li>
                        <li><strong>Pirates Grow Brave</strong>: Each player pays 5 coins (or loses 1 resource if no coins)</li>
                        <li><strong>Slaves Revolt</strong>: Remove 3 slaves from market</li>
                        <li><strong>Jupiter is Angry</strong>: Church track blocked, Pantheon disabled</li>
                    </ul>

                    <h4>Positive Events</h4>
                    <ul>
                        <li><strong>New Lands Discovered</strong>: Add 1 animal per player to market</li>
                        <li><strong>Traveling Troop</strong>: Add 1 mummer per player to market</li>
                        <li><strong>Slave Ship Arrives</strong>: Add 1 slave per player to market</li>
                        <li><strong>Victory Celebration</strong>: All players gain 2 coins and +1 Empire track</li>
                        <li><strong>Festival Declared</strong>: All players gain 1 coin and +1 Population track, add 2 mummers to market</li>
                        <li><strong>Imperial Bounty</strong>: Each player gains coins equal to Empire track (minimum 1)</li>
                        <li><strong>Religious Offering</strong>: All players gain +1 Church track, add 2 mummers to market</li>
                        <li><strong>Economic Boom</strong>: Add 2 resources to each market, all players gain 1 coin</li>
                    </ul>

                    <h4>Strategic/Neutral Events</h4>
                    <ul>
                        <li><strong>New Age</strong>: Shuffle discard pile into event deck, draw another event (resolved immediately)</li>
                        <li><strong>Market Crash</strong>: All market prices reduced by 1 this round (minimum 1)</li>
                        <li><strong>Labor Shortage</strong>: Workers cost +1 coin to deploy this round</li>
                    </ul>
                </section>

                <section class="rules-section">
                    <h3>Cleanup Phase Details</h3>
                    <p>During cleanup, the following occurs automatically:</p>
                    <ol>
                        <li><strong>Feeding Costs</strong>: Each player pays 1 coin per resource owned (mummers, animals, slaves, prisoners)</li>
                        <li><strong>Income</strong>: Each player receives coins equal to sum of all three victory tracks (minimum 3 coins)</li>
                        <li><strong>Net Change</strong>: Income minus feeding costs is applied</li>
                        <li>All placed workers returned to available pool</li>
                        <li>All bids cleared</li>
                        <li>Markets restocked</li>
                        <li>New event card drawn</li>
                        <li>Win conditions checked</li>
                    </ol>
                </section>
            </div>
        `;
    }

    /**
     * Show the rules modal
     */
    show() {
        if (this.modal) {
            this.modal.style.display = 'flex';
            this.isVisible = true;
            // Prevent body scroll when modal is open
            document.body.style.overflow = 'hidden';
        }
    }

    /**
     * Hide the rules modal
     */
    hide() {
        if (this.modal) {
            this.modal.style.display = 'none';
            this.isVisible = false;
            // Restore body scroll
            document.body.style.overflow = '';
        }
    }

    /**
     * Toggle the rules modal
     */
    toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }
}
