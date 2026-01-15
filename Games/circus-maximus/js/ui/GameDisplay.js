/**
 * GameDisplay - Renders the game state to the UI
 * 
 * Complete UI implementation with all game elements
 */

export class GameDisplay {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.gamePlayContainer = document.getElementById('game-play');
        this.selectedActId = null;
        this.selectedLocationId = null;
        this.selectedResourceType = null;
        this.bidAmount = 0;
    }

    /**
     * Update the game display with current state
     */
    update() {
        if (!this.gamePlayContainer) {
            return;
        }

        const state = this.gameEngine.getState();
        
        // Clear previous content
        this.gamePlayContainer.innerHTML = '';

        // Game info bar
        this.renderGameInfo(state);

        // Message display
        this.renderMessage(state);

        // Round announcements (event + mandatory execution act)
        this.renderRoundAnnouncements(state);

        // Selected acts display (acts chosen for this round)
        this.renderSelectedActs(state);

        // Player info cards with victory tracks
        this.renderPlayers(state);

        // Phase-specific displays
        this.renderPhaseContent(state);

        // Actions panel
        this.renderActions(state);
    }

    /**
     * Render game info bar
     */
    renderGameInfo(state) {
        const gameInfo = document.createElement('div');
        gameInfo.className = 'game-info';
        gameInfo.innerHTML = `
            <div>
                <span class="current-phase">Phase: ${this.formatPhaseName(state.currentPhase)}</span>
            </div>
            <div>
                <span class="current-player">Current Player: ${state.currentPlayer.name}</span>
            </div>
            <div>
                Round: ${state.round} | Turn: ${state.turn}
            </div>
        `;
        this.gamePlayContainer.appendChild(gameInfo);
    }

    /**
     * Render action log showing last 10 messages from game state
     */
    renderMessage(state) {
        const history = state.messageHistory || [];
        if (history.length === 0) return;

        const logContainer = document.createElement('div');
        logContainer.className = 'game-action-log';
        
        // Show last 10 messages
        const recentMessages = history.slice(-10);
        
        recentMessages.forEach(entry => {
            const messageBar = document.createElement('div');
            messageBar.className = `game-message message-${entry.type || 'info'}`;
            messageBar.innerHTML = `<span class="message-text">${entry.msg}</span>`;
            logContainer.appendChild(messageBar);
        });
        
        this.gamePlayContainer.appendChild(logContainer);
    }

    /**
     * Render round announcements (event and mandatory execution act)
     */
    renderRoundAnnouncements(state) {
        const container = document.createElement('div');
        container.className = 'round-announcements';
        container.style.display = 'flex';
        container.style.gap = '16px';
        container.style.marginBottom = '16px';

        // Current Event
        if (state.currentEvent) {
            const eventCard = document.createElement('div');
            eventCard.className = 'announcement-card event-card';
            eventCard.style.flex = '1';
            eventCard.style.padding = '12px';
            eventCard.style.borderRadius = '8px';
            eventCard.style.backgroundColor = '#fff3e0';
            eventCard.style.border = '2px solid #ff9800';
            
            eventCard.innerHTML = `
                <div style="font-weight: bold; color: #e65100; margin-bottom: 4px;">📜 Event: ${state.currentEvent.name}</div>
                <div style="font-size: 0.9em;">${state.currentEvent.description || ''}</div>
            `;
            container.appendChild(eventCard);
        }

        // Mandatory Execution Act
        if (state.mandatoryExecutionAct) {
            const execCard = document.createElement('div');
            execCard.className = 'announcement-card execution-card';
            execCard.style.flex = '1';
            execCard.style.padding = '12px';
            execCard.style.borderRadius = '8px';
            execCard.style.backgroundColor = '#ffebee';
            execCard.style.border = '2px solid #c62828';
            
            execCard.innerHTML = `
                <div style="font-weight: bold; color: #c62828; margin-bottom: 4px;">⚔️ Mandatory Execution: ${state.mandatoryExecutionAct.name}</div>
                <div style="font-size: 0.9em;">${state.mandatoryExecutionAct.description || ''}</div>
                <div style="font-size: 0.85em; margin-top: 4px; color: #666;">Requires: ${state.mandatoryExecutionAct.resourceCost?.prisoners || 1} prisoner(s)</div>
            `;
            container.appendChild(execCard);
        }

        if (state.currentEvent || state.mandatoryExecutionAct) {
            this.gamePlayContainer.appendChild(container);
        }
    }

    /**
     * Format phase name for display
     */
    formatPhaseName(phaseId) {
        const names = {
            'bidOnActs': 'Bid on Acts',
            'placeWorkers': 'Place Workers',
            'buyResources': 'Buy Resources',
            'performActs': 'Perform Acts',
            'cleanup': 'Cleanup'
        };
        return names[phaseId] || phaseId;
    }

    /**
     * Render selected acts for this round (acts that received bids)
     * This shows what acts will be performed, so players know what resources they need
     */
    renderSelectedActs(state) {
        // Get selected acts (acts with bids)
        const selectedActs = this.gameEngine.acts?.getSelectedActs() || [];
        
        // Only show if there are selected acts and we're past the bidding phase
        if (selectedActs.length === 0 || state.currentPhase === 'bidOnActs') {
            return;
        }

        const container = document.createElement('div');
        container.className = 'selected-acts-board';

        const title = document.createElement('h3');
        title.textContent = 'Selected Acts for This Round';
        title.className = 'selected-acts-title';
        container.appendChild(title);

        const actsGrid = document.createElement('div');
        actsGrid.className = 'selected-acts-grid';

        selectedActs.forEach(act => {
            const actCard = document.createElement('div');
            actCard.className = 'selected-act-card';

            // Get bids for this act
            const bids = this.gameEngine.acts?.getBids(act.id) || [];
            const currentPlayerBid = bids.find(b => b.playerId === state.currentPlayer.id);
            const isParticipating = currentPlayerBid !== undefined;

            // Highlight if current player is participating
            if (isParticipating) {
                actCard.classList.add('player-participating');
            }

            // Build resource requirements display
            const resourceReqs = [];
            if (act.resourceCost) {
                if (act.resourceCost.mummers) resourceReqs.push(`${act.resourceCost.mummers} Mummers`);
                if (act.resourceCost.animals) resourceReqs.push(`${act.resourceCost.animals} Animals`);
                if (act.resourceCost.slaves) resourceReqs.push(`${act.resourceCost.slaves} Slaves`);
            }
            if (act.coinCost) {
                resourceReqs.push(`${act.coinCost} Coins`);
            }

            // Check if current player has required resources
            const hasResources = this.checkPlayerHasResources(state.currentPlayer, act);

            actCard.innerHTML = `
                <div class="selected-act-name">${act.name || act.id}</div>
                <div class="selected-act-resources ${hasResources ? 'has-resources' : 'missing-resources'}">
                    <strong>Required Resources:</strong> ${resourceReqs.length > 0 ? resourceReqs.join(', ') : 'None'}
                    ${!hasResources ? '<span class="resource-warning">⚠ Missing resources</span>' : ''}
                </div>
                <div class="selected-act-rewards">
                    <strong>Rewards:</strong> ${act.coinReward || 0} coins, ${this.formatTrackRewards(act.tracks || {})}
                </div>
                ${isParticipating ? `<div class="participating-badge">Your Bid: ${currentPlayerBid.coins} coins</div>` : ''}
            `;

            actsGrid.appendChild(actCard);
        });

        container.appendChild(actsGrid);
        this.gamePlayContainer.appendChild(container);
    }

    /**
     * Check if player has required resources for an act
     */
    checkPlayerHasResources(player, act) {
        if (act.resourceCost) {
            for (const [resourceType, amount] of Object.entries(act.resourceCost)) {
                if ((player.resources[resourceType] || 0) < amount) {
                    return false;
                }
            }
        }
        if (act.coinCost && (player.resources.coins || 0) < act.coinCost) {
            return false;
        }
        return true;
    }

    /**
     * Render player cards with victory tracks
     */
    renderPlayers(state) {
        const playersContainer = document.createElement('div');
        playersContainer.className = 'player-info';
        
        state.players.forEach((player, index) => {
            const isCurrent = player.name === state.currentPlayer.name;
            const playerCard = document.createElement('div');
            playerCard.className = `player-card ${isCurrent ? 'active' : ''}`;
            
            // Resources
            let resourcesHtml = '';
            Object.entries(player.resources).forEach(([key, value]) => {
                resourcesHtml += `<div class="resource ${key}"><span>${this.formatResourceName(key)}:</span> <span>${value}</span></div>`;
            });
            
            // Victory tracks
            const tracksHtml = this.renderVictoryTracks(player, state.blockedTracks || []);
            
            playerCard.innerHTML = `
                <h3>${player.name} ${isCurrent ? '(Current)' : ''}</h3>
                ${resourcesHtml}
                <div class="resource workers"><span>Workers:</span> <span>${player.workers.available} available, ${player.workers.placed} placed</span></div>
                ${tracksHtml}
            `;
            playersContainer.appendChild(playerCard);
        });
        
        this.gamePlayContainer.appendChild(playersContainer);
    }

    /**
     * Render victory tracks for a player
     */
    renderVictoryTracks(player, blockedTracks) {
        const tracks = [
            { id: 'empire', name: 'Empire', value: player.victoryTracks?.empire || 0 },
            { id: 'population', name: 'Population', value: player.victoryTracks?.population || 0 },
            { id: 'church', name: 'Church', value: player.victoryTracks?.church || 0 }
        ];

        let html = '<div class="victory-tracks">';
        tracks.forEach(track => {
            const isBlocked = blockedTracks.includes(track.id);
            const min = -10;
            const max = 20;
            const range = max - min;
            const percentage = ((track.value - min) / range) * 100;
            const clampedPercentage = Math.max(0, Math.min(100, percentage));

            html += `
                <div class="track-container">
                    <div class="track-label ${track.id} ${isBlocked ? 'blocked' : ''}">
                        ${track.name} ${isBlocked ? '(Blocked)' : ''}
                    </div>
                    <div class="track-bar ${track.id}">
                        <div class="track-marker" style="left: ${clampedPercentage}%"></div>
                    </div>
                    <div class="track-value">${track.value}</div>
                </div>
            `;
        });
        html += '</div>';
        return html;
    }

    /**
     * Format resource name for display
     */
    formatResourceName(key) {
        const names = {
            'coins': 'Coins',
            'workers': 'Workers',
            'mummers': 'Mummers',
            'animals': 'Animals',
            'slaves': 'Slaves',
            'prisoners': 'Prisoners'
        };
        return names[key] || key.charAt(0).toUpperCase() + key.slice(1);
    }

    /**
     * Format track rewards for display
     */
    formatTrackRewards(tracks) {
        if (!tracks || Object.keys(tracks).length === 0) {
            return 'None';
        }
        const parts = [];
        if (tracks.empire) parts.push(`Empire: ${tracks.empire > 0 ? '+' : ''}${tracks.empire}`);
        if (tracks.population) parts.push(`Population: ${tracks.population > 0 ? '+' : ''}${tracks.population}`);
        if (tracks.church) parts.push(`Church: ${tracks.church > 0 ? '+' : ''}${tracks.church}`);
        return parts.join(', ') || 'None';
    }

    /**
     * Render phase-specific content
     */
    renderPhaseContent(state) {
        const phaseContent = document.createElement('div');
        phaseContent.className = 'phase-content';

        switch (state.currentPhase) {
            case 'bidOnActs':
                phaseContent.appendChild(this.renderActCards(state));
                break;
            case 'placeWorkers':
                phaseContent.appendChild(this.renderLocations(state));
                break;
            case 'buyResources':
                phaseContent.appendChild(this.renderMarkets(state));
                break;
            case 'performActs':
                phaseContent.appendChild(this.renderActResults(state));
                break;
            case 'cleanup':
                phaseContent.innerHTML = '<div class="auto-phase-message">Cleaning up...</div>';
                break;
        }

        this.gamePlayContainer.appendChild(phaseContent);
    }

    /**
     * Render act cards with bidding UI
     */
    renderActCards(state) {
        const container = document.createElement('div');
        container.className = 'act-cards-container';

        const acts = state.availableActs || { regular: [], execution: [] };
        const allActs = [...acts.regular, ...acts.execution];

        if (allActs.length === 0) {
            container.innerHTML = '<p>No acts available</p>';
            return container;
        }

        const title = document.createElement('h3');
        title.textContent = 'Available Acts';
        title.style.marginBottom = '16px';
        container.appendChild(title);

        // Add summary of total bids per act
        const bidsSummary = document.createElement('div');
        bidsSummary.className = 'bids-summary';
        bidsSummary.style.marginBottom = '16px';
        bidsSummary.style.padding = '12px';
        bidsSummary.style.backgroundColor = '#f0f0f0';
        bidsSummary.style.borderRadius = '4px';
        
        let summaryHtml = '<strong>Total Bids Per Act:</strong><ul style="margin: 8px 0; padding-left: 20px;">';
        allActs.forEach(act => {
            const totalBids = this.gameEngine.acts?.getTotalBids?.(act.id) || 0;
            if (totalBids > 0) {
                summaryHtml += `<li><strong>${act.name || act.id}:</strong> ${totalBids} coins</li>`;
            }
        });
        summaryHtml += '</ul>';
        
        if (allActs.every(act => (this.gameEngine.acts?.getTotalBids?.(act.id) || 0) === 0)) {
            summaryHtml = '<em>No bids placed yet</em>';
        }
        
        bidsSummary.innerHTML = summaryHtml;
        container.appendChild(bidsSummary);

        const actCardsGrid = document.createElement('div');
        actCardsGrid.className = 'act-cards';

        allActs.forEach(act => {
            const actCard = document.createElement('div');
            actCard.className = 'act-card';
            
            // Get bids for this act
            const bids = this.gameEngine.acts?.bids?.[act.id] || [];
            const hasBid = bids.length > 0;
            if (hasBid) {
                actCard.classList.add('has-bid');
            }

            // Check if this act is selected
            if (this.selectedActId === act.id) {
                actCard.classList.add('selected');
            }

            // Build bid display
            let bidsHtml = '';
            const totalBids = this.gameEngine.acts?.getTotalBids?.(act.id) || 0;
            if (bids.length > 0) {
                bidsHtml = '<div class="act-bids">';
                bidsHtml += `<div class="total-bids"><strong>Total Bids: ${totalBids} coins</strong></div>`;
                bidsHtml += '<strong>Individual Bids:</strong><ul>';
                bids.forEach(bid => {
                    const player = state.players.find(p => p.id === bid.playerId);
                    bidsHtml += `<li>${player?.name || 'Unknown'}: ${bid.coins} coins</li>`;
                });
                bidsHtml += '</ul></div>';
            } else if (totalBids > 0) {
                // Fallback if getTotalBids works but bids array is empty
                bidsHtml = `<div class="act-bids"><div class="total-bids"><strong>Total Bids: ${totalBids} coins</strong></div></div>`;
            }

            actCard.innerHTML = `
                <div class="act-card-title">${act.name || act.id}</div>
                <div class="act-card-details">
                    <div><strong>Cost:</strong> ${act.resourceCost?.mummers || 0} Mummers, ${act.resourceCost?.animals || 0} Animals, ${act.resourceCost?.slaves || 0} Slaves</div>
                    <div><strong>Rewards:</strong> ${act.coinReward || 0} coins</div>
                    ${bidsHtml}
                </div>
            `;

            // Make clickable for selection
            actCard.addEventListener('click', () => {
                if (!state.currentPlayer.isAI) {
                    this.selectedActId = act.id;
                    this.update();
                }
            });

            actCardsGrid.appendChild(actCard);
        });

        container.appendChild(actCardsGrid);

        // Selected act display section
        if (this.selectedActId) {
            const selectedAct = allActs.find(a => a.id === this.selectedActId);
            if (selectedAct) {
                const selectedSection = document.createElement('div');
                selectedSection.className = 'selected-act-section';
                
                const selectedTitle = document.createElement('h3');
                selectedTitle.textContent = 'Selected Act';
                selectedTitle.style.marginTop = '24px';
                selectedTitle.style.marginBottom = '12px';
                selectedSection.appendChild(selectedTitle);

                // Display selected act card
                const selectedCard = document.createElement('div');
                selectedCard.className = 'act-card selected-act-display';
                
                const bids = this.gameEngine.acts?.bids?.[selectedAct.id] || [];
                const totalBids = this.gameEngine.acts?.getTotalBids?.(selectedAct.id) || 0;
                let bidsHtml = '';
                if (bids.length > 0) {
                    bidsHtml = '<div class="act-bids">';
                    bidsHtml += `<div class="total-bids"><strong>Total Bids: ${totalBids} coins</strong></div>`;
                    bidsHtml += '<strong>Current Bids:</strong><ul>';
                    bids.forEach(bid => {
                        const player = state.players.find(p => p.id === bid.playerId);
                        bidsHtml += `<li>${player?.name || 'Unknown'}: ${bid.coins} coins</li>`;
                    });
                    bidsHtml += '</ul></div>';
                } else if (totalBids > 0) {
                    bidsHtml = `<div class="act-bids"><div class="total-bids"><strong>Total Bids: ${totalBids} coins</strong></div></div>`;
                }

                selectedCard.innerHTML = `
                    <div class="act-card-title">${selectedAct.name || selectedAct.id}</div>
                    <div class="act-card-details">
                        <div><strong>Description:</strong> ${selectedAct.description || 'No description'}</div>
                        <div><strong>Resource Cost:</strong> ${selectedAct.resourceCost?.mummers || 0} Mummers, ${selectedAct.resourceCost?.animals || 0} Animals, ${selectedAct.resourceCost?.slaves || 0} Slaves</div>
                        <div><strong>Coin Reward:</strong> ${selectedAct.coinReward || 0} coins</div>
                        <div><strong>Track Rewards:</strong> ${this.formatTrackRewards(selectedAct.tracks || {})}</div>
                        ${bidsHtml}
                    </div>
                `;
                selectedSection.appendChild(selectedCard);

                // Bid input
                const bidInput = document.createElement('div');
                bidInput.className = 'bid-input-container';
                bidInput.innerHTML = `
                    <label>
                        Your Bid Amount (coins):
                        <input type="number" id="bid-amount-input" min="0" max="${state.currentPlayer.resources.coins || 0}" value="${this.bidAmount || 0}">
                        <span class="coins-available">(You have ${state.currentPlayer.resources.coins || 0} coins)</span>
                    </label>
                    <button type="button" class="clear-selection-btn" id="clear-act-selection">Clear Selection</button>
                `;
                selectedSection.appendChild(bidInput);

                // Update bid amount when input changes
                setTimeout(() => {
                    const input = document.getElementById('bid-amount-input');
                    if (input) {
                        input.addEventListener('input', (e) => {
                            this.bidAmount = parseInt(e.target.value) || 0;
                        });
                    }
                    
                    // Clear selection button
                    const clearBtn = document.getElementById('clear-act-selection');
                    if (clearBtn) {
                        clearBtn.addEventListener('click', () => {
                            this.selectedActId = null;
                            this.bidAmount = 0;
                            this.update();
                        });
                    }
                }, 0);

                container.appendChild(selectedSection);
            }
        }

        return container;
    }

    /**
     * Render locations with worker placement UI
     */
    renderLocations(state) {
        const container = document.createElement('div');
        container.className = 'locations-container';

        const title = document.createElement('h3');
        title.textContent = 'Locations';
        title.style.marginBottom = '16px';
        container.appendChild(title);

        const locationsGrid = document.createElement('div');
        locationsGrid.className = 'locations';

        const board = state.board || { spaces: [] };
        const spaces = board.spaces || [];
        const disabledLocations = state.disabledLocations || [];

        spaces.forEach(space => {
            const locationCard = document.createElement('div');
            locationCard.className = 'location-card';
            
            const isDisabled = disabledLocations.includes(space.id);
            if (isDisabled) {
                locationCard.classList.add('disabled');
            }

            // Check if player has worker here
            const workerPlacements = board.workerPlacements?.[space.id] || {};
            const playerWorkers = workerPlacements[state.currentPlayer.id] || 0;
            if (playerWorkers > 0) {
                locationCard.classList.add('has-worker');
            }

            // Get all workers on this location
            const allWorkers = Object.entries(workerPlacements).map(([playerId, count]) => {
                const player = state.players.find(p => p.id === parseInt(playerId));
                return { name: player?.name || 'Unknown', count };
            });

            let workersHtml = '';
            if (allWorkers.length > 0) {
                workersHtml = '<div class="location-workers"><strong>Workers:</strong><ul>';
                allWorkers.forEach(w => {
                    workersHtml += `<li>${w.name}: ${w.count}</li>`;
                });
                workersHtml += '</ul></div>';
            }

            // Calculate worker cost (base + modifier)
            const workerCost = (this.gameEngine.config.limits.workerDeployCost || 1) + 
                              (state.workerCostModifier || 0);
            
            // Check if player can afford and has workers
            const canAfford = (state.currentPlayer.resources.coins || 0) >= workerCost;
            const hasWorkers = (state.currentPlayer.workers.available || 0) > 0;
            const canPlace = !isDisabled && hasWorkers && canAfford;
            
            // Check if player already has max workers at this location
            const playerWorkersHere = playerWorkers;
            const atMaxWorkers = space.maxWorkersPerPlayer !== null && 
                                playerWorkersHere >= space.maxWorkersPerPlayer;
            
            // Show stock info for stock locations
            let stockInfo = '';
            if (space.type === 'stock') {
                const stock = space.stock || 0;
                stockInfo = `<div class="location-stock">Stock: ${stock} available</div>`;
            }
            
            locationCard.innerHTML = `
                <div class="location-name">${space.name || space.id}</div>
                <div class="location-description">${space.description || ''}</div>
                <div class="location-cost">Cost: ${workerCost} coin${workerCost !== 1 ? 's' : ''}</div>
                ${stockInfo}
                ${workersHtml}
                ${atMaxWorkers ? '<div class="location-status">Max workers placed</div>' : ''}
                ${!canAfford ? '<div class="location-status">Insufficient coins</div>' : ''}
                ${!hasWorkers ? '<div class="location-status">No available workers</div>' : ''}
            `;

            // Make clickable if available
            if (canPlace && !atMaxWorkers) {
                locationCard.style.cursor = 'pointer';
                locationCard.addEventListener('click', () => {
                    this.selectedLocationId = space.id;
                    this.update();
                });
            } else {
                locationCard.style.cursor = 'not-allowed';
                locationCard.style.opacity = '0.6';
            }

            if (this.selectedLocationId === space.id) {
                locationCard.classList.add('selected');
            }

            locationsGrid.appendChild(locationCard);
        });

        container.appendChild(locationsGrid);
        return container;
    }

    /**
     * Render markets with resource buying UI
     */
    renderMarkets(state) {
        const container = document.createElement('div');
        container.className = 'markets-container';

        const title = document.createElement('h3');
        title.textContent = 'Markets';
        title.style.marginBottom = '16px';
        container.appendChild(title);
        
        // Show which market is currently being resolved
        if (state.currentMarket) {
            const currentMarketInfo = document.createElement('div');
            currentMarketInfo.className = 'current-market-info';
            currentMarketInfo.style.marginBottom = '16px';
            currentMarketInfo.style.padding = '12px';
            currentMarketInfo.style.backgroundColor = '#e3f2fd';
            currentMarketInfo.style.borderRadius = '4px';
            currentMarketInfo.style.border = '2px solid #2196f3';
            currentMarketInfo.innerHTML = `<strong>Currently Resolving: ${state.currentMarket.charAt(0).toUpperCase() + state.currentMarket.slice(1)} Market</strong><br>
                <small>Markets are resolved one at a time. You can only buy from the current market.</small>`;
            container.appendChild(currentMarketInfo);
        }

        const markets = state.markets || {};
        const resourceTypes = ['mummers', 'animals', 'slaves'];

        resourceTypes.forEach(resourceType => {
            const market = markets[resourceType];
            if (!market) return;

            const marketSection = document.createElement('div');
            marketSection.className = 'market';
            
            // Highlight current market
            if (state.currentMarket === resourceType) {
                marketSection.classList.add('current-market');
                marketSection.style.border = '2px solid #2196f3';
                marketSection.style.backgroundColor = '#e3f2fd';
            } else if (state.currentMarket && state.currentMarket !== resourceType) {
                // Dim markets that aren't currently being resolved
                marketSection.style.opacity = '0.5';
                marketSection.style.pointerEvents = 'none';
            }

            const marketTitle = document.createElement('h4');
            let titleText = market.name || resourceType.charAt(0).toUpperCase() + resourceType.slice(1);
            if (state.currentMarket === resourceType) {
                titleText += ' (Current)';
            } else if (state.currentMarket) {
                titleText += ' (Waiting)';
            }
            marketTitle.textContent = titleText;
            marketSection.appendChild(marketTitle);
            
            // Show queue order for this market
            const marketQueue = state.marketQueues?.[resourceType] || [];
            if (marketQueue.length > 0) {
                const queueInfo = document.createElement('div');
                queueInfo.className = 'market-queue-info';
                queueInfo.style.marginBottom = '8px';
                queueInfo.style.fontSize = '0.9em';
                queueInfo.style.color = '#666';
                const queueNames = marketQueue.map(playerId => {
                    const player = state.players.find(p => p.id === playerId);
                    return player?.name || 'Unknown';
                });
                queueInfo.textContent = `Queue Order: ${queueNames.join(' → ')}`;
                marketSection.appendChild(queueInfo);
            }

            // Get market state from game engine (SimpleMarket uses .markets directly)
            const simpleMarket = this.gameEngine.markets;
            const marketPrices = simpleMarket?.markets?.[resourceType];
            if (marketPrices && marketPrices.length > 0) {
                const availableCount = marketPrices.length;

                if (availableCount === 0) {
                    const noResources = document.createElement('p');
                    noResources.textContent = 'No resources available';
                    marketSection.appendChild(noResources);
                } else {
                    // Show all available resources with prices
                    // User selects resource type, game buys leftmost (cheapest)
                    const resourceDiv = document.createElement('div');
                    resourceDiv.className = 'market-resource available';
                    
                    // Check if this is the current market and if player is in queue
                    const isCurrentMarket = state.currentMarket === resourceType;
                    const marketQueue = state.marketQueues?.[resourceType] || [];
                    const playerInQueue = marketQueue.includes(state.currentPlayer.id);
                    const canBuyFromThisMarket = isCurrentMarket && playerInQueue;
                    
                    if (this.selectedResourceType === resourceType) {
                        resourceDiv.classList.add('selected');
                    }
                    
                    const currentPrice = simpleMarket.getPrice(resourceType);
                    
                    let statusText = '';
                    if (!isCurrentMarket && state.currentMarket) {
                        statusText = ' (Not current market)';
                        resourceDiv.style.opacity = '0.5';
                        resourceDiv.style.cursor = 'not-allowed';
                    } else if (isCurrentMarket && !playerInQueue) {
                        statusText = ' (You are not in queue)';
                        resourceDiv.style.opacity = '0.5';
                        resourceDiv.style.cursor = 'not-allowed';
                    } else if (canBuyFromThisMarket) {
                        // Make it clear this is clickable
                        resourceDiv.style.cursor = 'pointer';
                        resourceDiv.style.border = '2px solid #4CAF50';
                        resourceDiv.style.padding = '8px';
                        resourceDiv.style.margin = '4px 0';
                        resourceDiv.style.borderRadius = '4px';
                        resourceDiv.style.backgroundColor = this.selectedResourceType === resourceType ? '#e8f5e9' : '#f5f5f5';
                    }

                    resourceDiv.innerHTML = `
                        <span class="price-badge">${currentPrice || 'N/A'}</span>
                        <span>${market.name || resourceType} (${availableCount} available)${statusText}</span>
                        ${canBuyFromThisMarket ? '<br><small style="color: #4CAF50;">Click to select and buy</small>' : ''}
                    `;

                    resourceDiv.addEventListener('click', (e) => {
                        e.stopPropagation();
                        if (!state.currentPlayer.isAI && canBuyFromThisMarket) {
                            this.selectedResourceType = resourceType;
                            this.update();
                        } else if (!state.currentPlayer.isAI && isCurrentMarket && !playerInQueue) {
                            this.showError('You must have a worker in this market to buy resources');
                        }
                    });

                    marketSection.appendChild(resourceDiv);
                }
            } else {
                const noResources = document.createElement('p');
                noResources.textContent = 'No resources available';
                marketSection.appendChild(noResources);
            }

            container.appendChild(marketSection);
        });

        return container;
    }

    /**
     * Render act resolution results
     */
    renderActResults(state) {
        const container = document.createElement('div');
        container.className = 'act-results-container';

        const title = document.createElement('h3');
        title.textContent = 'Act Resolution Results';
        title.style.marginBottom = '16px';
        container.appendChild(title);

        const results = state.lastActResults || [];
        
        if (results.length === 0) {
            container.innerHTML += '<div class="auto-phase-message">Resolving acts...</div>';
            return container;
        }

        results.forEach(result => {
            const resultCard = document.createElement('div');
            resultCard.className = 'act-result-card';
            resultCard.style.marginBottom = '16px';
            resultCard.style.padding = '16px';
            resultCard.style.border = '2px solid #ccc';
            resultCard.style.borderRadius = '8px';
            resultCard.style.backgroundColor = '#f9f9f9';

            let html = `<h4 style="margin: 0 0 12px 0;">${result.act?.name || 'Unknown Act'}</h4>`;
            
            // Show winner if there is one
            if (result.winner) {
                html += `<div class="act-winner" style="color: #228B22; font-weight: bold; margin-bottom: 8px;">
                    🏆 Winner: ${result.winner.name || 'Player ' + result.winner.id}
                </div>`;
                
                // Show dice rolls
                if (result.diceResults) {
                    html += '<div class="dice-rolls" style="margin-bottom: 8px;"><strong>Dice Rolls:</strong><ul style="margin: 4px 0; padding-left: 20px;">';
                    result.diceResults.rolls.forEach(roll => {
                        const isWinner = roll.player.id === result.winner.id;
                        html += `<li style="${isWinner ? 'font-weight: bold; color: #228B22;' : ''}">${roll.player.name || 'Player ' + roll.player.id}: ${roll.roll} ${isWinner ? '(Winner!)' : ''}</li>`;
                    });
                    html += '</ul></div>';
                    
                    if (result.diceResults.rerollCount > 0) {
                        html += `<div style="font-size: 0.9em; color: #666;">Ties re-rolled ${result.diceResults.rerollCount} time(s)</div>`;
                    }
                }
            } else {
                html += '<div style="margin-bottom: 8px;"><em>All participants rewarded equally</em></div>';
            }

            // Show all participants and their rewards
            if (result.results && result.results.length > 0) {
                html += '<div class="participants"><strong>Participants:</strong><ul style="margin: 4px 0; padding-left: 20px;">';
                result.results.forEach(r => {
                    const player = state.players.find(p => p.id === r.playerId);
                    const playerName = player?.name || 'Player ' + r.playerId;
                    html += `<li>${playerName}: +${r.coinsGained} coins`;
                    if (r.tracksMoved && Object.keys(r.tracksMoved).length > 0) {
                        html += `, ${this.formatTrackRewards(r.tracksMoved)}`;
                    }
                    html += '</li>';
                });
                html += '</ul></div>';
            }

            resultCard.innerHTML = html;
            container.appendChild(resultCard);
        });

        return container;
    }

    /**
     * Render actions panel
     */
    renderActions(state) {
        const actionsPanel = document.createElement('div');
        actionsPanel.className = 'actions-panel';

        const availableActions = this.gameEngine.getAvailableActions();
        const currentPlayer = state.currentPlayer;

        if (availableActions.length === 0) {
            // Default pass button
            const passBtn = this.createActionButton({
                type: 'pass',
                name: 'Pass'
            }, state);
            actionsPanel.appendChild(passBtn);
        } else {
            availableActions.forEach(action => {
                const actionBtn = this.createActionButton(action, state);
                actionsPanel.appendChild(actionBtn);
            });
        }

        this.gamePlayContainer.appendChild(actionsPanel);
    }

    /**
     * Create an action button
     */
    createActionButton(action, state) {
        const button = document.createElement('button');
        button.className = 'action-btn';
        
        if (action.type === 'pass') {
            button.classList.add('danger');
        }

        // Check if action requires selection
        if (action.requiresSelection) {
            let canExecute = false;
            
            if (action.type === 'bid' && action.selectionType === 'act') {
                canExecute = this.selectedActId !== null && this.bidAmount > 0 && 
                            this.bidAmount <= (state.currentPlayer.resources.coins || 0);
                button.textContent = `Bid ${this.bidAmount || 0} coins on selected act`;
            } else if (action.type === 'placeWorker' && action.selectionType === 'location') {
                const workerCost = (this.gameEngine.config.limits.workerDeployCost || 1) + 
                                  (state.workerCostModifier || 0);
                const selectedSpace = state.board?.spaces?.find(s => s.id === this.selectedLocationId);
                const locationName = selectedSpace?.name || this.selectedLocationId || 'location';
                canExecute = this.selectedLocationId !== null && 
                            (state.currentPlayer.workers.available || 0) > 0 &&
                            (state.currentPlayer.resources.coins || 0) >= workerCost;
                button.textContent = `Place Worker at ${locationName} (${workerCost} coin${workerCost !== 1 ? 's' : ''})`;
            } else if (action.type === 'buyResource') {
                // Check if player is in current market queue
                const currentMarket = state.currentMarket;
                const marketQueue = state.marketQueues?.[currentMarket] || [];
                const playerInQueue = currentMarket && marketQueue.includes(state.currentPlayer.id);
                
                canExecute = this.selectedResourceType !== null && 
                            this.selectedResourceType === currentMarket &&
                            playerInQueue &&
                            (state.currentPlayer.resources.coins || 0) > 0;
                
                if (this.selectedResourceType && this.selectedResourceType === currentMarket) {
                    const currentPrice = this.gameEngine.markets?.getPrice(this.selectedResourceType) || 0;
                    button.textContent = `Buy ${this.selectedResourceType} (${currentPrice} coins)`;
                } else if (!currentMarket) {
                    button.textContent = 'Buy Resource (No market active)';
                } else if (!playerInQueue) {
                    button.textContent = `Buy Resource (Not in ${currentMarket} queue)`;
                } else {
                    button.textContent = 'Buy Resource (Select resource first)';
                }
            } else {
                button.textContent = action.name || 'Action';
            }

            if (!canExecute) {
                button.disabled = true;
                button.textContent = action.name || 'Action (Select first)';
            }
        } else {
            button.textContent = action.name || 'Action';
        }

        button.onclick = () => {
            if (button.disabled) return;

            let actionToExecute = { type: action.type };

            // Build action based on type
            if (action.type === 'bid') {
                if (!this.selectedActId || !this.bidAmount) {
                    this.showError('Please select an act and enter a bid amount');
                    return;
                }
                actionToExecute.actId = this.selectedActId;
                actionToExecute.coins = this.bidAmount;
            } else if (action.type === 'placeWorker') {
                if (!this.selectedLocationId) {
                    this.showError('Please select a location');
                    return;
                }
                actionToExecute.locationId = this.selectedLocationId;
            } else if (action.type === 'buyResource') {
                if (!this.selectedResourceType) {
                    this.showError('Please select a resource');
                    return;
                }
                // Market buys leftmost (cheapest) available resource automatically
                actionToExecute.resourceType = this.selectedResourceType;
            }

            // Execute action
            if (window.gameControls) {
                window.gameControls.handleAction(actionToExecute);
            }

            // Reset selections
            this.selectedActId = null;
            this.selectedLocationId = null;
            this.selectedResourceType = null;
            this.bidAmount = 0;
        };

        return button;
    }

    /**
     * Show game end screen
     */
    showGameEnd(winner) {
        const gameEndContainer = document.getElementById('game-end');
        if (!gameEndContainer) {
            return;
        }

        const state = this.gameEngine.getState();
        
        gameEndContainer.innerHTML = `
            <div class="winner-announcement">
                ${winner ? `${winner.name} Wins!` : 'Game Over'}
            </div>
            <div class="final-scores">
                <h3>Final Scores</h3>
                ${state.players.map(p => `
                    <div class="score-item">
                        <span>${p.name}</span>
                        <span>Empire: ${p.victoryTracks?.empire || 0} | Population: ${p.victoryTracks?.population || 0} | Church: ${p.victoryTracks?.church || 0}</span>
                    </div>
                `).join('')}
            </div>
            <button onclick="location.reload()">New Game</button>
        `;
        
        // Switch to game end screen
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        gameEndContainer.classList.add('active');
    }

    /**
     * Show error message
     */
    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        
        const gamePlay = document.getElementById('game-play');
        if (gamePlay) {
            gamePlay.insertBefore(errorDiv, gamePlay.firstChild);
            
            // Remove after 5 seconds
            setTimeout(() => {
                errorDiv.remove();
            }, 5000);
        }
    }

    /**
     * Show success message
     */
    showMessage(message, type = 'success') {
        const messageDiv = document.createElement('div');
        messageDiv.className = type === 'success' ? 'success-message' : 'error-message';
        messageDiv.textContent = message;
        
        const gamePlay = document.getElementById('game-play');
        if (gamePlay) {
            gamePlay.insertBefore(messageDiv, gamePlay.firstChild);
            
            // Remove after 3 seconds
            setTimeout(() => {
                messageDiv.remove();
            }, 3000);
        }
    }
}
