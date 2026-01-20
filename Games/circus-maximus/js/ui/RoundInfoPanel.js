/**
 * RoundInfoPanel - Component for bottom panel showing phase-appropriate content
 * Shows acts during bidding, selected acts/event/execution during other phases
 */

export class RoundInfoPanel {
    constructor(container, gameEngine) {
        this.container = container;
        this.gameEngine = gameEngine;
        this.selectedActId = null;
        this.bidAmount = 0;
        this.render();
    }
    
    render() {
        const state = this.gameEngine?.getState();
        if (!state) {
            console.error('RoundInfoPanel.render(): No game state available');
            this.container.innerHTML = '<div style="padding: 16px; color: red; text-shadow: 1px 1px 2px rgba(0,0,0,0.7);">Error: No game state</div>';
            return;
        }
        
        try {
            if (state.currentPhase === 'bidOnActs') {
                this.renderBiddingPhase(state);
            } else {
                this.renderOtherPhases(state);
            }
        } catch (error) {
            console.error('Error rendering round info panel:', error);
            this.container.innerHTML = `<div style="padding: 16px; color: red; text-shadow: 1px 1px 2px rgba(0,0,0,0.7);">Error: ${error.message}</div>`;
        }
    }
    
    renderBiddingPhase(state) {
        // During bidding phase, only show selected act (if any)
        // The popup will show all available acts
        if (this.selectedActId) {
            const availableActs = this.gameEngine.acts?.getAvailableActs() || { regular: [], execution: [] };
            const allActs = [...availableActs.regular, ...availableActs.execution];
            const selectedAct = allActs.find(a => a.id === this.selectedActId);
            
            if (selectedAct) {
                const actName = this.escapeHtml(selectedAct.name || selectedAct.id);
                const bids = this.gameEngine.acts?.bids?.[selectedAct.id] || [];
                const totalBids = this.gameEngine.acts?.getTotalBids?.(selectedAct.id) || 0;
                
                this.container.innerHTML = `
                    <div class="round-info-content">
                        <div class="round-info-bidding-selected">
                            <h3>Selected Act for Bidding</h3>
                            <div class="selected-act-display-card">
                                <div class="selected-act-name">${actName}</div>
                                <div class="selected-act-details">
                                    <div><strong>Cost:</strong> ${this.formatResourceCost(selectedAct.resourceCost)}</div>
                                    <div><strong>Reward:</strong> ${selectedAct.coinReward || 0} coins</div>
                                    <div><strong>Tracks:</strong> ${this.formatTrackRewards(selectedAct.tracks)}</div>
                                    <div class="selected-act-bids">
                                        <strong>Total Bids:</strong> ${totalBids} coins
                                        ${bids.length > 0 ? `
                                            <div class="selected-act-bids-list">
                                                ${bids.map(bid => {
                                                    const player = state.players.find(p => p.id === bid.playerId);
                                                    return `<div>${this.escapeHtml(player?.name || 'Unknown')}: ${bid.coins} coins</div>`;
                                                }).join('')}
                                            </div>
                                        ` : ''}
                                    </div>
                                </div>
                                ${this.renderBidInput(state)}
                            </div>
                        </div>
                    </div>
                `;
                
                // Attach bid input listener
                this.attachBidInputListener();
            } else {
                // Selected act not found, show prompt
                this.container.innerHTML = `
                    <div class="round-info-content">
                        <div class="round-info-bidding-selected">
                            <div class="bidding-prompt">
                                <p>Select an act from the bidding popup to place your bid</p>
                            </div>
                        </div>
                    </div>
                `;
            }
        } else {
            // No act selected yet
            this.container.innerHTML = `
                <div class="round-info-content">
                    <div class="round-info-bidding-selected">
                        <div class="bidding-prompt">
                            <p>Select an act from the bidding popup to place your bid</p>
                        </div>
                    </div>
                </div>
            `;
        }
    }
    
    renderBidInput(state) {
        const availableActs = this.gameEngine.acts?.getAvailableActs() || { regular: [], execution: [] };
        const allActs = [...availableActs.regular, ...availableActs.execution];
        const selectedAct = allActs.find(a => a.id === this.selectedActId);
        
        if (!selectedAct) return '';
        
        // Use unique ID to avoid conflicts
        const inputId = `bid-amount-${Date.now()}`;
        const maxCoins = state.currentPlayer.resources.coins || 0;
        
        return `
            <div class="bid-input-section">
                <div class="bid-input">
                    <label>
                        <span>Your Bid Amount (coins):</span>
                        <input type="number" 
                               id="${inputId}" 
                               class="bid-amount-input"
                               min="1" 
                               max="${maxCoins}"
                               value="${this.bidAmount || ''}"
                               placeholder="Enter bid amount">
                    </label>
                    <div class="coins-available">
                        You have ${maxCoins} coins available
                    </div>
                </div>
            </div>
        `;
    }
    
    renderOtherPhases(state) {
        const selectedActs = this.gameEngine.acts?.getSelectedActs() || [];
        const event = state.currentEvent;
        const executionAct = state.mandatoryExecutionAct;
        
        this.container.innerHTML = `
            <div class="round-info-content">
                <div class="round-info-other">
                    ${selectedActs.length > 0 ? `
                        <div class="info-section selected-acts">
                            <h3>Selected Acts for This Round</h3>
                            <div class="acts-mini-grid">
                                ${selectedActs.map(act => this.renderMiniActCard(act, state)).join('')}
                            </div>
                        </div>
                    ` : ''}
                    ${event ? `
                        <div class="info-section event-card">
                            <h3>📜 Event: ${this.escapeHtml(event.name || 'Unknown')}</h3>
                            <p>${this.escapeHtml(event.description || '')}</p>
                        </div>
                    ` : ''}
                    ${executionAct ? `
                        <div class="info-section execution-act">
                            <h3>⚔️ Mandatory Execution: ${this.escapeHtml(executionAct.name || 'Unknown')}</h3>
                            <p>${this.escapeHtml(executionAct.description || '')}</p>
                            <p>Requires: ${executionAct.resourceCost?.prisoners || 1} prisoner(s)</p>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }
    
    renderMiniActCard(act, state) {
        // Escape act name
        const actName = this.escapeHtml(act.name || act.id);
        
        return `
            <div class="act-mini-card">
                <div class="mini-act-name">${actName}</div>
                <div class="mini-act-details">
                    ${act.coinReward || 0} coins
                </div>
            </div>
        `;
    }
    
    attachBidInputListener() {
        // Bid amount input - use class selector to avoid ID conflicts
        setTimeout(() => {
            const bidInput = this.container.querySelector('.bid-amount-input');
            if (bidInput) {
                bidInput.addEventListener('input', (e) => {
                    this.bidAmount = parseInt(e.target.value) || 0;
                    // Notify GameDisplay of bid amount
                    if (window.gameDisplay) {
                        window.gameDisplay.bidAmount = this.bidAmount;
                    }
                });
            }
        }, 0);
    }
    
    formatResourceCost(cost) {
        if (!cost) return 'None';
        const parts = [];
        if (cost.mummers) parts.push(`${cost.mummers} Mummers`);
        if (cost.animals) parts.push(`${cost.animals} Animals`);
        if (cost.slaves) parts.push(`${cost.slaves} Slaves`);
        if (cost.prisoners) parts.push(`${cost.prisoners} Prisoners`);
        return parts.join(', ') || 'None';
    }
    
    formatTrackRewards(tracks) {
        if (!tracks) return 'None';
        const parts = [];
        if (tracks.empire) parts.push(`Empire: ${tracks.empire > 0 ? '+' : ''}${tracks.empire}`);
        if (tracks.population) parts.push(`Population: ${tracks.population > 0 ? '+' : ''}${tracks.population}`);
        if (tracks.church) parts.push(`Church: ${tracks.church > 0 ? '+' : ''}${tracks.church}`);
        return parts.join(', ') || 'None';
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    update(state) {
        this.render();
    }
}
